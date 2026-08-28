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

type ErrorResponse = {
  error?: {
    message?: string;
  };
};

type Progress = {
  id: number;
  documentId: string;
  completed: boolean;
  completedAt?: string | null;
  lesson?: {
    documentId?: string;
  };
};

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessons, setCompletedLessons] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        const { documentId } = await params;

        const token =
          localStorage.getItem("lms_token");

        const role =
          localStorage.getItem("lms_role");

        if (!token) {
          if (!cancelled) {
            setMessage("Please login first.");
            setLoading(false);
          }

          return;
        }

        console.log("COURSE DOCUMENT ID:", documentId);
        console.log("CURRENT ROLE:", role);

        // =====================================
        // 1. GET COURSE
        // =====================================

        /*
         * Instructor:
         * Get the draft/latest version so an instructor
         * can view a newly-created draft course.
         *
         * Student:
         * Get the normal published version.
         */

        const courseUrl =
          role === "instructor"
            ? `http://localhost:1337/api/courses/${encodeURIComponent(
                documentId
              )}?status=draft&populate=lessons`
            : `http://localhost:1337/api/courses/${encodeURIComponent(
                documentId
              )}?populate=lessons`;

        console.log(
          "COURSE REQUEST:",
          courseUrl
        );

        const response = await fetch(courseUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const result:
          | CourseResponse
          | ErrorResponse =
          await response.json();

        console.log(
          "COURSE STATUS:",
          response.status
        );

        console.log(
          "COURSE RESPONSE:",
          result
        );

        if (!response.ok) {
          if (!cancelled) {
            const errorMessage =
              "error" in result
                ? result.error?.message ||
                  "Failed to fetch course."
                : "Failed to fetch course.";

            setMessage(errorMessage);
            setLoading(false);
          }

          return;
        }

        if (
          !("data" in result) ||
          !result.data
        ) {
          if (!cancelled) {
            setMessage(
              "Invalid course response."
            );
            setLoading(false);
          }

          return;
        }

        const currentCourse = result.data;

        if (cancelled) {
          return;
        }

        setCourse(currentCourse);

        // =====================================
        // 2. GET LESSON PROGRESS
        // =====================================

        if (
          currentCourse.lessons &&
          currentCourse.lessons.length > 0
        ) {
          setProgressLoading(true);

          const completed: string[] = [];

          for (const lesson of currentCourse.lessons) {
            if (cancelled) {
              return;
            }

            try {
              const progressResponse =
                await fetch(
                  `http://localhost:1337/api/lesson-progresses?filters[lesson][documentId][$eq]=${encodeURIComponent(
                    lesson.documentId
                  )}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type":
                        "application/json",
                    },
                    cache: "no-store",
                  }
                );

              const progressResult =
                await progressResponse.json();

              console.log(
                `Progress for ${lesson.title}:`,
                progressResult
              );

              if (
                progressResponse.ok &&
                Array.isArray(
                  progressResult?.data
                )
              ) {
                const lessonProgress =
                  progressResult.data.find(
                    (item: Progress) =>
                      item.completed === true
                  );

                if (lessonProgress) {
                  completed.push(
                    lesson.documentId
                  );
                }
              }
            } catch (error) {
              console.error(
                `Failed to load progress for ${lesson.title}:`,
                error
              );
            }
          }

          if (!cancelled) {
            setCompletedLessons(completed);
            setProgressLoading(false);
          }
        } else {
          setProgressLoading(false);
        }
      } catch (error) {
        console.error(
          "Course error:",
          error
        );

        if (!cancelled) {
          setMessage(
            "Something went wrong."
          );

          setProgressLoading(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [params]);

  // =====================================
  // LOADING
  // =====================================

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
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <p style={{ color: "#999" }}>
            Loading course...
          </p>
        </div>
      </main>
    );
  }

  // =====================================
  // ERROR
  // =====================================

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
          <h1>Course</h1>

          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              border: "1px solid #444",
              borderRadius: "10px",
              color: "#ccc",
            }}
          >
            {message}
          </div>

          <Link
            href="/courses"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 18px",
              border: "1px solid #444",
              borderRadius: "7px",
              textDecoration: "none",
              color: "white",
            }}
          >
            ← Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  // =====================================
  // COURSE NOT FOUND
  // =====================================

  if (!course) {
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
          <h1>Course not found</h1>

          <Link
            href="/courses"
            style={{
              display: "inline-block",
              marginTop: "20px",
              textDecoration: "none",
            }}
          >
            ← Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  // =====================================
  // PROGRESS
  // =====================================

  const totalLessons =
    course.lessons?.length || 0;

  const completedCount =
    completedLessons.length;

  const progressPercentage =
    totalLessons > 0
      ? Math.round(
          (completedCount / totalLessons) *
            100
        )
      : 0;

  const role =
    typeof window !== "undefined"
      ? localStorage.getItem("lms_role")
      : "";

  const isInstructor =
    role === "instructor";

  // =====================================
  // PAGE
  // =====================================

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 30px 90px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Back */}

        <Link
          href={
            isInstructor
              ? "/instructor/dashboard"
              : "/courses"
          }
          style={{
            display: "inline-block",
            marginBottom: "30px",
            color: "#aaa",
            textDecoration: "none",
          }}
        >
          ←{" "}
          {isInstructor
            ? "Back to Dashboard"
            : "Back to Courses"}
        </Link>

        {/* Instructor Draft Notice */}

        {isInstructor && (
          <div
            style={{
              marginBottom: "25px",
              padding: "12px 16px",
              border: "1px solid #444",
              borderRadius: "8px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            Instructor preview — you can view
            your draft course here.
          </div>
        )}

        {/* Course Header */}

        <div
          style={{
            border: "1px solid #333",
            borderRadius: "14px",
            padding: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "40px",
              lineHeight: "1.2",
            }}
          >
            {course.title}
          </h1>

          <p
            style={{
              marginTop: "18px",
              maxWidth: "800px",
              color: "#aaa",
              lineHeight: "1.7",
              fontSize: "16px",
            }}
          >
            {course.description}
          </p>
        </div>

        {/* Course Progress */}

        <div
          style={{
            marginTop: "30px",
            padding: "22px",
            border: "1px solid #333",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "12px",
            }}
          >
            <strong>
              Course Progress
            </strong>

            <span style={{ color: "#aaa" }}>
              {completedCount} /{" "}
              {totalLessons} lessons
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#333",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: "100%",
                background: "#22c55e",
                transition:
                  "width 0.3s ease",
              }}
            />
          </div>

          <p
            style={{
              marginTop: "10px",
              color: "#aaa",
            }}
          >
            {progressLoading
              ? "Loading progress..."
              : `${progressPercentage}% complete`}
          </p>
        </div>

        {/* Lessons */}

        <section
          style={{
            marginTop: "40px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            Lessons
          </h2>

          <div
            style={{
              marginTop: "20px",
            }}
          >
            {course.lessons &&
            course.lessons.length > 0 ? (
              course.lessons.map(
                (lesson, index) => {
                  const isCompleted =
                    completedLessons.includes(
                      lesson.documentId
                    );

                  return (
                    <div
                      key={lesson.documentId}
                      style={{
                        border:
                          "1px solid #333",
                        borderRadius: "12px",
                        padding: "22px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: "15px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize:
                              "19px",
                          }}
                        >
                          {index + 1}.{" "}
                          {lesson.title}
                        </h3>

                        {isCompleted && (
                          <span
                            style={{
                              padding:
                                "6px 10px",
                              borderRadius:
                                "6px",
                              border:
                                "1px solid #22c55e",
                              color:
                                "#22c55e",
                              fontSize:
                                "13px",
                            }}
                          >
                            ✓ Completed
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          marginTop:
                            "14px",
                          color: "#aaa",
                          lineHeight:
                            "1.6",
                        }}
                      >
                        {lesson.content}
                      </p>

                      <Link
                        href={`/lessons/${lesson.documentId}`}
                        style={{
                          display:
                            "inline-block",
                          marginTop:
                            "15px",
                          padding:
                            "10px 16px",
                          border:
                            "1px solid #444",
                          borderRadius:
                            "7px",
                          textDecoration:
                            "none",
                          color: "white",
                        }}
                      >
                        {isCompleted
                          ? "Review Lesson →"
                          : "Open Lesson →"}
                      </Link>
                    </div>
                  );
                }
              )
            ) : (
              <div
                style={{
                  border:
                    "1px dashed #444",
                  borderRadius: "10px",
                  padding: "30px",
                  color: "#888",
                }}
              >
                No lessons added to
                this course yet.
              </div>
            )}
          </div>
        </section>

        {/* Enrollment */}

        {!isInstructor && (
          <div
            style={{
              marginTop: "30px",
            }}
          >
            <EnrollButton
              courseDocumentId={
                course.documentId
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}