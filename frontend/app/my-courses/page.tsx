"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  lessons?: Lesson[];
};

type Enrollment = {
  id: number;
  documentId: string;
  course?: Course | null;
};

type MeResponse = {
  id: number;
  username: string;
  email: string;
  enrollments?: Enrollment[];
};

type ErrorResponse = {
  error?: {
    message?: string;
  };
};

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMyCourses() {
      const token = localStorage.getItem("lms_token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:1337/api/users/me?populate[enrollments][populate][course][populate]=lessons",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result: MeResponse | ErrorResponse =
          await response.json();

        console.log("MY COURSES RESPONSE:", result);

        if (!response.ok) {
          setMessage(
            "error" in result
              ? result.error?.message ||
                  "Failed to load your courses."
              : "Failed to load your courses."
          );
          return;
        }

        if (!("enrollments" in result)) {
          setEnrollments([]);
          return;
        }

        const userEnrollments = Array.isArray(
          result.enrollments
        )
          ? result.enrollments
          : [];

        const validEnrollments =
          userEnrollments.filter(
            (enrollment) => enrollment.course
          );

        const uniqueEnrollments: Enrollment[] = [];
        const seenCourses = new Set<string>();

        for (const enrollment of validEnrollments) {
          const course = enrollment.course;

          if (!course) {
            continue;
          }

          if (seenCourses.has(course.documentId)) {
            continue;
          }

          seenCourses.add(course.documentId);
          uniqueEnrollments.push(enrollment);
        }

        setEnrollments(uniqueEnrollments);
      } catch (error) {
        console.error(
          "My Courses Error:",
          error
        );

        setMessage(
          "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMyCourses();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 30px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h1>My Courses</h1>
          <p style={{ color: "#999" }}>
            Loading your courses...
          </p>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 30px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1>My Courses</h1>

          <p
            style={{
              marginTop: "20px",
              color: "#ccc",
            }}
          >
            {message}
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 18px",
              border: "1px solid #444",
              borderRadius: "7px",
              color: "white",
              textDecoration: "none",
            }}
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 30px 100px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/courses"
          style={{
            color: "#aaa",
            textDecoration: "none",
          }}
        >
          ← Browse Courses
        </Link>

        <div
          style={{
            marginTop: "30px",
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#888",
              fontSize: "14px",
            }}
          >
            Student
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "40px",
            }}
          >
            My Courses
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#999",
            }}
          >
            Courses you have enrolled in.
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div
            style={{
              border: "1px dashed #444",
              borderRadius: "12px",
              padding: "50px 30px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
              }}
            >
              No enrolled courses
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: "#888",
              }}
            >
              Enroll in a course to start learning.
            </p>

            <Link
              href="/courses"
              style={{
                display: "inline-block",
                marginTop: "20px",
                padding: "11px 18px",
                borderRadius: "8px",
                background: "white",
                color: "black",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Browse Courses →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "22px",
            }}
          >
            {enrollments.map((enrollment) => {
              const course = enrollment.course;

              if (!course) {
                return null;
              }

              const lessons = course.lessons || [];

              return (
                <article
                  key={course.documentId}
                  style={{
                    border: "1px solid #333",
                    borderRadius: "14px",
                    padding: "24px",
                    background: "#111",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#777",
                      fontSize: "13px",
                    }}
                  >
                    Enrolled Course
                  </p>

                  <h2
                    style={{
                      marginTop: "8px",
                      marginBottom: "10px",
                      fontSize: "24px",
                    }}
                  >
                    {course.title}
                  </h2>

                  <p
                    style={{
                      color: "#aaa",
                      lineHeight: "1.6",
                    }}
                  >
                    {course.description}
                  </p>

                  <div
                    style={{
                      marginTop: "22px",
                      paddingTop: "18px",
                      borderTop: "1px solid #292929",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                      }}
                    >
                      Lessons ({lessons.length})
                    </h3>

                    {lessons.length === 0 ? (
                      <p
                        style={{
                          color: "#777",
                          marginTop: "12px",
                        }}
                      >
                        No lessons available yet.
                      </p>
                    ) : (
                      <div
                        style={{
                          marginTop: "12px",
                        }}
                      >
                        {lessons.map(
                          (lesson, index) => (
                            <Link
                              key={
                                lesson.documentId
                              }
                              href={`/lessons/${lesson.documentId}`}
                              style={{
                                display: "block",
                                padding: "11px 0",
                                borderBottom:
                                  "1px solid #222",
                                color: "white",
                                textDecoration:
                                  "none",
                              }}
                            >
                              Lesson {index + 1}:{" "}
                              {lesson.title}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/courses/${course.documentId}`}
                    style={{
                      display: "inline-block",
                      marginTop: "22px",
                      padding: "11px 18px",
                      borderRadius: "8px",
                      background: "white",
                      color: "black",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    Continue Learning →
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}