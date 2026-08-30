"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type Enrollment = {
  id: number;
  documentId: string;
  course?: {
    id?: number;
    documentId?: string;
  } | null;
};

type ProgressItem = {
  id: number;
  documentId: string;
  completed?: boolean;
  completedAt?: string | null;
  user?: {
    id?: number;
    documentId?: string;
  } | null;
  lesson?: {
    id?: number;
    documentId?: string;
  } | null;
};

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const router = useRouter();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [enrolled, setEnrolled] =
    useState(false);

  const [completedLessons, setCompletedLessons] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [enrollmentLoading, setEnrollmentLoading] =
    useState(true);

  const [progressLoading, setProgressLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [role, setRole] =
    useState("");

  // ==========================================
  // LOAD COURSE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        const { documentId } = await params;

        const token =
          localStorage.getItem("lms_token");

        const currentRole =
          localStorage.getItem("lms_role") || "";

        setRole(currentRole);

        if (!token) {
          setMessage("Please login first.");
          setLoading(false);
          setEnrollmentLoading(false);
          return;
        }

        // ======================================
        // 1. GET COURSE
        // ======================================

        const courseUrl =
          currentRole === "instructor"
            ? `http://localhost:1337/api/courses/${encodeURIComponent(
                documentId
              )}?status=draft&populate=lessons`
            : `http://localhost:1337/api/courses/${encodeURIComponent(
                documentId
              )}?populate=lessons`;

        const response =
          await fetch(courseUrl, {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
          });

        const result =
          await response.json();

        console.log(
          "COURSE RESPONSE:",
          result
        );

        if (!response.ok) {
          setMessage(
            result?.error?.message ||
              "Failed to fetch course."
          );
          setLoading(false);
          setEnrollmentLoading(false);
          return;
        }

        const rawCourse =
          result?.data;

        if (!rawCourse) {
          setMessage(
            "Course not found."
          );
          setLoading(false);
          setEnrollmentLoading(false);
          return;
        }

        const rawLessons =
          rawCourse.lessons;

        const lessons: Lesson[] =
          Array.isArray(rawLessons)
            ? rawLessons
            : Array.isArray(
                rawLessons?.data
              )
            ? rawLessons.data.map(
                (item: any) => ({
                  id: item.id,
                  documentId:
                    item.documentId ||
                    item.attributes?.documentId,
                  title:
                    item.title ||
                    item.attributes?.title ||
                    "",
                  content:
                    item.content ||
                    item.attributes?.content ||
                    "",
                })
              )
            : [];

        const currentCourse: Course = {
          id: rawCourse.id,
          documentId:
            rawCourse.documentId,
          title:
            rawCourse.title || "",
          description:
            rawCourse.description || "",
          lessons,
        };

        if (cancelled) return;

        setCourse(currentCourse);

        console.log(
          "CURRENT COURSE:",
          currentCourse
        );

        console.log(
          "LESSONS:",
          lessons
        );

        // ======================================
        // 2. INSTRUCTOR
        // ======================================

        if (
          currentRole === "instructor"
        ) {
          setEnrolled(true);
          setEnrollmentLoading(false);
          setLoading(false);
          return;
        }

        // ======================================
        // 3. CHECK STUDENT ENROLLMENT
        // ======================================

        const userResponse =
          await fetch(
            "http://localhost:1337/api/users/me?populate=enrollments.course",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            }
          );

        const userResult =
          await userResponse.json();

        console.log(
          "CURRENT USER:",
          userResult
        );

        if (!userResponse.ok) {
          setEnrolled(false);
          setEnrollmentLoading(false);
          setLoading(false);
          return;
        }

        const userEnrollments =
          Array.isArray(
            userResult?.enrollments
          )
            ? userResult.enrollments
            : [];

        const isEnrolled =
          userEnrollments.some(
            (
              enrollment: Enrollment
            ) =>
              enrollment?.course
                ?.documentId ===
              currentCourse.documentId
          );

        console.log(
          "IS ENROLLED:",
          isEnrolled
        );

        if (cancelled) return;

        setEnrolled(isEnrolled);
        setEnrollmentLoading(false);

        // ======================================
        // 4. ONLY ENROLLED STUDENT GETS PROGRESS
        // ======================================

        if (
          !isEnrolled ||
          lessons.length === 0
        ) {
          setCompletedLessons([]);
          setProgressLoading(false);
          setLoading(false);
          return;
        }

        setProgressLoading(true);

        // ======================================
        // 5. GET ALL PROGRESS
        //
        // We don't use the old:
        // /my-progress?courseDocumentId=...
        //
        // because that endpoint was returning
        // 400 Bad Request in your project.
        // ======================================

        const progressResponse =
          await fetch(
            "http://localhost:1337/api/lesson-progresses?populate=*",
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            }
          );

        const progressResult =
          await progressResponse.json();

        console.log(
          "ALL PROGRESS RESPONSE:",
          progressResult
        );

        if (
          !progressResponse.ok
        ) {
          console.error(
            "PROGRESS API ERROR:",
            progressResult
          );

          setCompletedLessons([]);
        } else {
          const allProgress: ProgressItem[] =
            Array.isArray(
              progressResult?.data
            )
              ? progressResult.data
              : [];

          const completed: string[] =
            [];

          // ====================================
          // FIND CURRENT USER'S COMPLETED LESSONS
          // ====================================

          for (
            const progress of allProgress
          ) {
            if (
              progress?.completed !== true
            ) {
              continue;
            }

            const progressUserId =
              progress?.user?.id;

            // Only current logged-in user
            if (
              progressUserId &&
              progressUserId !==
                userResult?.id
            ) {
              continue;
            }

            const progressLessonId =
              progress?.lesson
                ?.documentId;

            if (
              !progressLessonId
            ) {
              continue;
            }

            // Make sure lesson belongs
            // to current course
            const belongsToCourse =
              lessons.some(
                (lesson) =>
                  lesson.documentId ===
                  progressLessonId
              );

            if (
              belongsToCourse &&
              !completed.includes(
                progressLessonId
              )
            ) {
              completed.push(
                progressLessonId
              );
            }
          }

          console.log(
            "COMPLETED LESSONS:",
            completed
          );

          setCompletedLessons(
            completed
          );
        }
      } catch (error) {
        console.error(
          "COURSE PAGE ERROR:",
          error
        );

        if (!cancelled) {
          setMessage(
            "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [params]);

  // ==========================================
  // LOADING
  // ==========================================

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

  // ==========================================
  // ERROR
  // ==========================================

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
            }}
          >
            {message}
          </div>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            style={{
              marginTop: "20px",
              padding: "10px 18px",
              border: "1px solid #444",
              borderRadius: "7px",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 30px",
        }}
      >
        <h1>Course not found</h1>
      </main>
    );
  }

  // ==========================================
  // PROGRESS CALCULATION
  // ==========================================

  const totalLessons =
    course.lessons?.length || 0;

  const completedCount =
    completedLessons.length;

  const progressPercentage =
    totalLessons > 0
      ? Math.round(
          (completedCount /
            totalLessons) *
            100
        )
      : 0;

  const isInstructor =
    role === "instructor";

  // ==========================================
  // UI
  // ==========================================

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
        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          style={{
            border: "none",
            background: "transparent",
            color: "#aaa",
            padding: 0,
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          ← Back
        </button>

        {/* COURSE HEADER */}

        <div
          style={{
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          <p
            style={{
              color: "#888",
              marginBottom: "10px",
            }}
          >
            {isInstructor
              ? "Instructor Course"
              : "Course"}
          </p>

          <h1>{course.title}</h1>

          <p
            style={{
              marginTop: "15px",
              color: "#aaa",
              lineHeight: "1.7",
            }}
          >
            {course.description}
          </p>
        </div>

        {/* NOT ENROLLED */}

        {!isInstructor &&
          !enrollmentLoading &&
          !enrolled && (
            <div
              style={{
                marginTop: "30px",
                padding: "25px",
                border: "1px solid #444",
                borderRadius: "12px",
              }}
            >
              <h2>
                Enroll to access lessons
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  color: "#999",
                  lineHeight: "1.6",
                }}
              >
                You can view the course
                information, but you must
                enroll before accessing
                lessons and tracking
                progress.
              </p>

              <EnrollButton
                courseDocumentId={
                  course.documentId
                }
              />
            </div>
          )}

        {/* PROGRESS */}

        {!isInstructor &&
          enrolled && (
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
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <strong>
                  Course Progress
                </strong>

                <span
                  style={{
                    color: "#aaa",
                  }}
                >
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
          )}

        {/* LESSONS */}

        {(isInstructor ||
          enrolled) && (
          <section
            style={{
              marginTop: "40px",
            }}
          >
            <h2>Lessons</h2>

            {course.lessons.length ===
            0 ? (
              <div
                style={{
                  marginTop: "20px",
                  padding: "25px",
                  border:
                    "1px dashed #444",
                  borderRadius: "12px",
                  color: "#999",
                }}
              >
                No lessons added to this
                course yet.
              </div>
            ) : (
              <div
                style={{
                  marginTop: "20px",
                }}
              >
                {course.lessons.map(
                  (lesson, index) => {
                    const isCompleted =
                      completedLessons.includes(
                        lesson.documentId
                      );

                    return (
                      <div
                        key={
                          lesson.documentId
                        }
                        style={{
                          border:
                            "1px solid #333",
                          borderRadius: "12px",
                          padding: "22px",
                          marginBottom:
                            "18px",
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
                            }}
                          >
                            {index + 1}.{" "}
                            {lesson.title}
                          </h3>

                          {isCompleted &&
                            !isInstructor && (
                              <span
                                style={{
                                  color:
                                    "#22c55e",
                                  fontSize:
                                    "14px",
                                }}
                              >
                                ✓ Completed
                              </span>
                            )}
                        </div>

                        <p
                          style={{
                            marginTop: "12px",
                            color: "#aaa",
                          }}
                        >
                          {lesson.content}
                        </p>

                        <Link
                          href={`/lessons/${lesson.documentId}`}
                          style={{
                            display:
                              "inline-block",
                            marginTop: "18px",
                            padding:
                              "10px 16px",
                            border:
                              "1px solid #444",
                            borderRadius: "7px",
                            textDecoration:
                              "none",
                            color: "white",
                          }}
                        >
                          Open Lesson →
                        </Link>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {/* ENROLLMENT FOOTER */}

        {!isInstructor &&
          enrolled && (
            <div
              style={{
                marginTop: "25px",
              }}
            >
              <p
                style={{
                  color: "#22c55e",
                }}
              >
                ✓ Already Enrolled
              </p>

              <Link
                href="/my-courses"
                style={{
                  display:
                    "inline-block",
                  marginTop: "12px",
                  padding: "10px 16px",
                  border:
                    "1px solid #444",
                  borderRadius: "7px",
                  textDecoration:
                    "none",
                  color: "white",
                }}
              >
                Go to My Courses →
              </Link>
            </div>
          )}
      </div>
    </main>
  );
}