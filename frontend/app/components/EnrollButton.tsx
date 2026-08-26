"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  courseDocumentId: string;
};

type Enrollment = {
  id: number;
  documentId: string;
  course?: {
    documentId: string;
  } | null;
};

export default function EnrollButton({
  courseDocumentId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkEnrollment() {
      const token = localStorage.getItem("lms_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:1337/api/enrollments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const result = await response.json();

        const enrollments: Enrollment[] =
          result.data || [];

        const alreadyEnrolled = enrollments.some(
          (enrollment) =>
            enrollment.course?.documentId ===
            courseDocumentId
        );

        setEnrolled(alreadyEnrolled);
      } catch (error) {
        console.error(
          "Failed to check enrollment:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    checkEnrollment();
  }, [courseDocumentId]);

  async function handleEnroll() {
    setMessage("Enrolling...");

    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:1337/api/enrollments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              course: courseDocumentId,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error?.message ||
            "Enrollment failed."
        );
        return;
      }

      setEnrolled(true);
      setMessage("Enrollment successful!");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  }

  if (loading) {
    return (
      <div style={{ marginTop: "30px" }}>
        <p>Checking enrollment...</p>
      </div>
    );
  }

  if (enrolled) {
    return (
      <div style={{ marginTop: "30px" }}>
        <p
          style={{
            marginBottom: "15px",
          }}
        >
          ✓ Already Enrolled
        </p>

        <Link
          href="/my-courses"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            border: "1px solid white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Continue Learning →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <button
        onClick={handleEnroll}
        style={{
          padding: "10px 18px",
          cursor: "pointer",
        }}
      >
        Enroll Now
      </button>

      {message && (
        <p style={{ marginTop: "15px" }}>
          {message}
        </p>
      )}
    </div>
  );
}