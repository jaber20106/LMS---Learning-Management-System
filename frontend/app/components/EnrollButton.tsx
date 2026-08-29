"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  courseDocumentId: string;
  onEnrollmentSuccess?: () => void;
};

type Enrollment = {
  id: number;
  documentId: string;
  course?: {
    documentId?: string;
  } | null;
};

export default function EnrollButton({
  courseDocumentId,
  onEnrollmentSuccess,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkEnrollment() {
      const token =
        localStorage.getItem("lms_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Check current user's enrollments
        const response = await fetch(
          "http://localhost:1337/api/users/me?populate=enrollments.course",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        console.log(
          "ENROLLMENT CHECK:",
          result
        );

        if (!response.ok) {
          setLoading(false);
          return;
        }

        const enrollments: Enrollment[] =
          Array.isArray(result?.enrollments)
            ? result.enrollments
            : [];

        const alreadyEnrolled =
          enrollments.some(
            (enrollment) =>
              enrollment?.course
                ?.documentId ===
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
    setMessage("");

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      setMessage("Enrolling...");

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

      const data =
        await response.json();

      console.log(
        "ENROLLMENT CREATE RESPONSE:",
        data
      );

      if (!response.ok) {
        setMessage(
          data?.error?.message ||
            "Enrollment failed."
        );

        return;
      }

      setEnrolled(true);

      setMessage(
        "Enrollment successful!"
      );

      // Tell parent page that enrollment succeeded
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess();
      }
    } catch (error) {
      console.error(
        "Enrollment error:",
        error
      );

      setMessage(
        "Something went wrong."
      );
    }
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <p style={{ color: "#999" }}>
          Checking enrollment...
        </p>
      </div>
    );
  }

  // =====================================
  // ALREADY ENROLLED
  // =====================================

  if (enrolled) {
    return (
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <p
          style={{
            marginBottom: "15px",
            color: "#22c55e",
          }}
        >
          ✓ Already Enrolled
        </p>

        <Link
          href="/my-courses"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            border: "1px solid #444",
            borderRadius: "7px",
            textDecoration: "none",
            color: "white",
          }}
        >
          Go to My Courses →
        </Link>
      </div>
    );
  }

  // =====================================
  // ENROLL BUTTON
  // =====================================

  return (
    <div
      style={{
        marginTop: "20px",
      }}
    >
      <button
        type="button"
        onClick={handleEnroll}
        style={{
          padding: "11px 20px",
          border: "1px solid white",
          borderRadius: "7px",
          background: "white",
          color: "black",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Enroll Now
      </button>

      {message && (
        <p
          style={{
            marginTop: "15px",
            color:
              message ===
              "Enrollment successful!"
                ? "#22c55e"
                : "#aaa",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}