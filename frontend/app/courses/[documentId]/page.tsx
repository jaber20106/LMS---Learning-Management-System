"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EnrollButton from "@/app/components/EnrollButton";

type Lesson = {
  id: number;
  documentId: string;
  title: string;
  content: string;
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

type CourseResponse = {
  data: Course;
};

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const { documentId } = await params;

        const token = localStorage.getItem("lms_token");

        if (!token) {
          setMessage("Please login first.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:1337/api/courses/${documentId}?populate=lessons`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result: CourseResponse | {
          error?: {
            message?: string;
          };
        } = await response.json();

        console.log("Course API:", result);
        console.log("LESSONS:", result.data?.lessons);
        if (!response.ok) {
          setMessage(
            "error" in result
              ? result.error?.message ||
                  "Failed to fetch course."
              : "Failed to fetch course."
          );

          setLoading(false);
          return;
        }

        if (!("data" in result)) {
          setMessage("Invalid course response.");
          setLoading(false);
          return;
        }

        setCourse(result.data);
      } catch (error) {
        console.error("Course error:", error);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params]);

  if (loading) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Course</h1>

        <p style={{ marginTop: "20px" }}>
          Loading course...
        </p>
      </main>
    );
  }

  if (message) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Course</h1>

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

  if (!course) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Course not found</h1>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>{course.title}</h1>

      <p style={{ marginTop: "20px" }}>
        {course.description}
      </p>

      <h2 style={{ marginTop: "40px" }}>
        Lessons
      </h2>

      <div style={{ marginTop: "20px" }}>
        {course.lessons?.map((lesson, index) => (
          <div
            key={lesson.documentId}
            style={{
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>
              {index + 1}. {lesson.title}
            </h3>

            <p style={{ marginTop: "15px" }}>
              {lesson.content}
            </p>

            <Link
              href={`/lessons/${lesson.documentId}`}
              style={{
                display: "inline-block",
                marginTop: "15px",
                padding: "10px 18px",
                border: "1px solid white",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Open Lesson →
            </Link>
          </div>
        ))}
      </div>

      <EnrollButton
        courseDocumentId={course.documentId}
      />
    </main>
  );
}