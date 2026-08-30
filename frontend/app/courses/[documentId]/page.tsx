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
      <main className="min-h-screen bg-[#050505] px-4 py-12 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-white/[0.06]" />
            <div className="mt-10 h-12 w-2/3 rounded bg-white/[0.06]" />
            <div className="mt-4 h-5 w-1/2 rounded bg-white/[0.04]" />
            <div className="mt-10 h-32 rounded-2xl bg-white/[0.04]" />
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (message) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-12 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f15a24]">
            Course
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Something went wrong
          </h1>

          <div className="mt-7 rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 text-sm text-[#999]">
            {message}
          </div>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mt-5 rounded-xl border border-[#292929] bg-[#0b0b0b] px-5 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:border-[#f15a24]/40 hover:bg-[#f15a24]/[0.06]"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-12 text-[#f5f5f5]">
        <h1 className="text-3xl font-bold">
          Course not found
        </h1>
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
    <main className="min-h-screen overflow-hidden bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[750px] -translate-x-1/2 rounded-full bg-[#f15a24]/[0.045] blur-[140px]" />

        <div className="absolute bottom-[-250px] right-[-200px] h-[450px] w-[450px] rounded-full bg-[#f15a24]/[0.02] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back
        </button>

        {/* COURSE HEADER */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-[#292929] bg-[#0b0b0b]">

          {/* Header accent */}

          <div className="h-1 w-full bg-[#f15a24]" />

          <div className="p-6 sm:p-8 lg:p-10">

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#f15a24]/20 bg-[#f15a24]/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
                {isInstructor
                  ? "Instructor Course"
                  : "Course"}
              </span>

              {enrolled && !isInstructor && (
                <span className="rounded-full border border-green-500/20 bg-green-500/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400">
                  Enrolled
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-[-0.03em] text-[#f5f5f5] sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#888] sm:text-base">
              {course.description}
            </p>

            {/* Course info */}

            <div className="mt-7 flex flex-wrap gap-3">

              <div className="rounded-xl border border-[#292929] bg-[#050505] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#666]">
                  Lessons
                </p>

                <p className="mt-1 text-lg font-semibold text-[#f5f5f5]">
                  {totalLessons}
                </p>
              </div>

              {enrolled && !isInstructor && (
                <div className="rounded-xl border border-[#292929] bg-[#050505] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#666]">
                    Progress
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#f15a24]">
                    {progressPercentage}%
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* NOT ENROLLED */}

        {!isInstructor &&
          !enrollmentLoading &&
          !enrolled && (
            <div className="mt-5 rounded-2xl border border-[#f15a24]/20 bg-[#f15a24]/[0.035] p-6 sm:p-7">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-semibold text-[#f5f5f5]">
                    Start this course
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#888]">
                    Enroll in this course to access
                    lessons and track your progress.
                  </p>
                </div>

                <div className="shrink-0">
                  <EnrollButton
                    courseDocumentId={
                      course.documentId
                    }
                  />
                </div>

              </div>
            </div>
          )}

        {/* PROGRESS */}

        {!isInstructor &&
          enrolled && (
            <div className="mt-5 rounded-2xl border border-[#292929] bg-[#0b0b0b] p-6 sm:p-7">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
                    Your progress
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Course Progress
                  </h2>
                </div>

                <span className="text-sm text-[#888]">
                  {completedCount} /{" "}
                  {totalLessons} lessons
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#242424]">
                <div
                  className="h-full rounded-full bg-[#f15a24] transition-all duration-500"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-[#666]">
                  {progressLoading
                    ? "Loading progress..."
                    : `${progressPercentage}% complete`}
                </p>

                {progressPercentage === 100 && (
                  <span className="text-xs font-medium text-green-400">
                    Course completed ✓
                  </span>
                )}
              </div>
            </div>
          )}

        {/* LESSONS */}

        {(isInstructor ||
          enrolled) && (
          <section className="mt-8">

            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
                  Course content
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Lessons
                </h2>
              </div>

              {totalLessons > 0 && (
                <span className="text-sm text-[#666]">
                  {totalLessons}{" "}
                  {totalLessons === 1
                    ? "lesson"
                    : "lessons"}
                </span>
              )}
            </div>

            {course.lessons.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-6 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-[#f15a24]">
                  ◈
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  No lessons yet
                </h3>

                <p className="mt-2 text-sm text-[#777]">
                  No lessons have been added to
                  this course yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

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
                        className={`group rounded-2xl border bg-[#0b0b0b] p-5 transition-all duration-200 sm:p-6 ${
                          isCompleted
                            ? "border-green-500/20"
                            : "border-[#292929] hover:border-[#f15a24]/30"
                        }`}
                      >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex min-w-0 items-start gap-4">

                            {/* Number */}

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${
                                isCompleted
                                  ? "border-green-500/20 bg-green-500/[0.06] text-green-400"
                                  : "border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-[#f15a24]"
                              }`}
                            >
                              {isCompleted
                                ? "✓"
                                : String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-semibold text-[#f5f5f5] sm:text-lg">
                                  {lesson.title}
                                </h3>

                                {isCompleted &&
                                  !isInstructor && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-green-400">
                                      Completed
                                    </span>
                                  )}
                              </div>

                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#777]">
                                {lesson.content}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/lessons/${lesson.documentId}`}
                            className="group/link flex shrink-0 items-center justify-center rounded-xl border border-[#292929] bg-[#050505] px-5 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:border-[#f15a24]/40 hover:bg-[#f15a24]/[0.06]"
                          >
                            Open Lesson

                            <span className="ml-2 text-[#f15a24] transition-transform group-hover/link:translate-x-1">
                              →
                            </span>
                          </Link>

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            )}
          </section>
        )}

        {/* MY COURSES */}

        {!isInstructor &&
          enrolled && (
            <div className="mt-7 border-t border-[#1c1c1c] pt-6">
              <Link
                href="/my-courses"
                className="inline-flex items-center text-sm font-medium text-[#888] transition hover:text-[#f15a24]"
              >
                ← Go to My Courses
              </Link>
            </div>
          )}

      </div>
    </main>
  );
}