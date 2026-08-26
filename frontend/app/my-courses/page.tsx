"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
};

type Enrollment = {
  id: number;
  documentId: string;
  course?: Course | { data?: Course | null } | null;
};

type EnrollmentResponse = {
  data: Enrollment[];
};

function getCourse(
  course: Enrollment["course"]
): Course | null {
  if (!course) {
    return null;
  }

  if ("data" in course) {
    return course.data ?? null;
  }

  return course;
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getMyCourses() {
      const token = localStorage.getItem("lms_token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:1337/api/enrollments?populate=course",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result: EnrollmentResponse | {
          error?: {
            message?: string;
          };
        } = await response.json();

        console.log("My Courses API:", result);

        if (!response.ok) {
          setMessage(
            "error" in result
              ? result.error?.message ||
                  "Failed to load your courses."
              : "Failed to load your courses."
          );

          setLoading(false);
          return;
        }

        if (!("data" in result)) {
          setMessage("Invalid response from server.");
          setLoading(false);
          return;
        }

        setEnrollments(result.data || []);
      } catch (error) {
        console.error("My Courses Error:", error);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    getMyCourses();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>My Courses</h1>

        <p style={{ marginTop: "20px" }}>
          Loading your courses...
        </p>
      </main>
    );
  }

  if (message) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>My Courses</h1>

        <p style={{ marginTop: "20px" }}>
          {message}
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 18px",
            border: "1px solid white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Go to Login
        </Link>
      </main>
    );
  }

  // Only keep enrollments that have a course
  const validEnrollments = enrollments.filter(
    (enrollment) => getCourse(enrollment.course)
  );

  // Remove duplicate courses
  const uniqueEnrollments: Enrollment[] = [];
  const seenCourses = new Set<string>();

  for (const enrollment of validEnrollments) {
    const course = getCourse(enrollment.course);

    if (!course) {
      continue;
    }

    const courseKey = course.documentId;

    if (seenCourses.has(courseKey)) {
      continue;
    }

    seenCourses.add(courseKey);
    uniqueEnrollments.push(enrollment);
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>My Courses</h1>

      {uniqueEnrollments.length === 0 ? (
        <div style={{ marginTop: "30px" }}>
          <p>
            You have not enrolled in any course yet.
          </p>

          <Link
            href="/courses"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 18px",
              border: "1px solid white",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: "30px" }}>
          {uniqueEnrollments.map((enrollment) => {
            const course = getCourse(enrollment.course);

            if (!course) {
              return null;
            }

            return (
              <div
                key={course.documentId}
                style={{
                  border: "1px solid #333",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <h2>{course.title}</h2>

                <p
                  style={{
                    marginTop: "12px",
                  }}
                >
                  {course.description}
                </p>

                <Link
                  href={`/courses/${course.documentId}`}
                  style={{
                    display: "inline-block",
                    marginTop: "18px",
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
          })}
        </div>
      )}
    </main>
  );
}