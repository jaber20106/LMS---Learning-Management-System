"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = {
  id: number;
  documentId: string;
  title: string;
  content: string;
};

type QuizQuestion = {
  id: number;
  documentId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

type Quiz = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  questions?: QuizQuestion[];
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  lessons?: Lesson[];
  quizzes?: Quiz[];
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
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadMyCourses() {
      const token =
        localStorage.getItem("lms_token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://lms-learning-management-system-syom.onrender.com/api/users/me?populate[enrollments][populate][course][populate][0]=lessons&populate[enrollments][populate][course][populate][1]=quizzes",
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

        const result:
          | MeResponse
          | ErrorResponse =
          await response.json();

        console.log(
          "MY COURSES RESPONSE:",
          result
        );

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

        const userEnrollments =
          Array.isArray(
            result.enrollments
          )
            ? result.enrollments
            : [];

        const validEnrollments =
          userEnrollments.filter(
            (enrollment) =>
              enrollment.course
          );

        const uniqueEnrollments: Enrollment[] =
          [];

        const seenCourses =
          new Set<string>();

        for (const enrollment of
          validEnrollments) {
          const course =
            enrollment.course;

          if (!course) {
            continue;
          }

          if (
            seenCourses.has(
              course.documentId
            )
          ) {
            continue;
          }

          seenCourses.add(
            course.documentId
          );

          uniqueEnrollments.push(
            enrollment
          );
        }

        setEnrollments(
          uniqueEnrollments
        );
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f5f5f5] sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-white/[0.06]" />

            <div className="mt-8 h-12 w-64 rounded bg-white/[0.06]" />

            <div className="mt-4 h-5 w-80 max-w-full rounded bg-white/[0.04]" />

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-[420px] rounded-2xl bg-white/[0.04]" />
              <div className="h-[420px] rounded-2xl bg-white/[0.04]" />
              <div className="hidden h-[420px] rounded-2xl bg-white/[0.04] lg:block" />
            </div>
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
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f5f5f5] sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-4xl">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f15a24]">
            Student
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            My Courses
          </h1>

          <div className="mt-7 rounded-2xl border border-[#292929] bg-[#0b0b0b] p-6">
            <p className="text-sm leading-6 text-[#999]">
              {message}
            </p>

            <Link
              href="/login"
              className="mt-5 inline-flex rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
            >
              Go to Login →
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12 lg:pb-16">

      {/* Background */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[750px] -translate-x-1/2 rounded-full bg-[#f15a24]/[0.04] blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* Back */}

        <Link
          href="/courses"
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Browse Courses
        </Link>

        {/* Header */}

        <div className="mt-8 max-w-3xl sm:mt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f15a24]">
            Student
          </p>

          <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#f5f5f5] sm:text-5xl md:text-6xl">
            My Courses
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#888] sm:text-base">
            Courses you have enrolled in.
          </p>
        </div>

        {/* Course count */}

        {enrollments.length > 0 && (
          <div className="mt-7 border-b border-[#202020] pb-4">
            <p className="text-sm text-[#666]">
              {enrollments.length}{" "}
              {enrollments.length === 1
                ? "course"
                : "courses"}{" "}
              enrolled
            </p>
          </div>
        )}

        {/* EMPTY */}

        {enrollments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-5 py-14 text-center sm:px-8">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-xl text-[#f15a24]">
              ◈
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#f5f5f5]">
              No enrolled courses
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">
              Enroll in a course to start
              learning.
            </p>

            <Link
              href="/courses"
              className="mt-5 inline-flex items-center rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
            >
              Browse Courses
              <span className="ml-2">
                →
              </span>
            </Link>

          </div>
        ) : (
          /* COURSES */
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {enrollments.map(
              (enrollment) => {
                const course =
                  enrollment.course;

                if (!course) {
                  return null;
                }

                const lessons =
                  course.lessons || [];

                const quizzes =
                  course.quizzes || [];

                return (
                  <article
                    key={
                      course.documentId
                    }
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#292929] bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-1 hover:border-[#f15a24]/40"
                  >

                    {/* Card Header */}

                    <div className="relative flex h-24 items-center justify-center border-b border-[#202020] bg-[#090909]">

                      <div className="absolute inset-0 bg-[#f15a24]/[0.035] opacity-0 transition group-hover:opacity-100" />

                      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.07] text-lg text-[#f15a24]">
                        ◈
                      </div>

                    </div>

                    {/* Course Info */}

                    <div className="p-5 sm:p-6">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
                          Enrolled Course
                        </p>

                        <span className="rounded-full border border-green-500/20 bg-green-500/[0.06] px-2.5 py-1 text-[10px] font-medium text-green-400">
                          Enrolled
                        </span>

                      </div>

                      <h2 className="mt-3 text-xl font-semibold leading-7 text-[#f5f5f5]">
                        {course.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#777]">
                        {course.description}
                      </p>

                      {/* Stats */}

                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <div className="rounded-xl border border-[#242424] bg-[#070707] p-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-[#555]">
                            Lessons
                          </p>

                          <p className="mt-1 text-lg font-semibold text-[#f5f5f5]">
                            {lessons.length}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#242424] bg-[#070707] p-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-[#555]">
                            Quizzes
                          </p>

                          <p className="mt-1 text-lg font-semibold text-[#f5f5f5]">
                            {quizzes.length}
                          </p>
                        </div>

                      </div>

                      {/* Lessons */}

                      <div className="mt-6 border-t border-[#202020] pt-5">

                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-[#f5f5f5]">
                            Lessons
                          </h3>

                          <span className="text-xs text-[#666]">
                            {lessons.length}
                          </span>
                        </div>

                        {lessons.length ===
                        0 ? (
                          <p className="mt-3 text-xs text-[#666]">
                            No lessons available yet.
                          </p>
                        ) : (
                          <div className="mt-2 max-h-36 overflow-y-auto pr-1">

                            {lessons.map(
                              (
                                lesson,
                                index
                              ) => (
                                <Link
                                  key={
                                    lesson.documentId
                                  }
                                  href={`/lessons/${lesson.documentId}`}
                                  className="flex items-center gap-3 border-b border-[#1c1c1c] py-2.5 text-sm text-[#999] transition hover:text-[#f15a24]"
                                >
                                  <span className="text-[10px] text-[#f15a24]">
                                    {String(
                                      index + 1
                                    ).padStart(
                                      2,
                                      "0"
                                    )}
                                  </span>

                                  <span className="truncate">
                                    {lesson.title}
                                  </span>
                                </Link>
                              )
                            )}

                          </div>
                        )}
                      </div>

                      {/* Quizzes */}

                      <div className="mt-5 border-t border-[#202020] pt-5">

                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-[#f5f5f5]">
                            Quizzes
                          </h3>

                          <span className="text-xs text-[#666]">
                            {quizzes.length}
                          </span>
                        </div>

                        {quizzes.length ===
                        0 ? (
                          <p className="mt-3 text-xs text-[#666]">
                            No quizzes available yet.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">

                            {quizzes.map(
                              (
                                quiz,
                                index
                              ) => (
                                <div
                                  key={
                                    quiz.documentId
                                  }
                                  className="flex items-center justify-between gap-3 rounded-xl border border-[#242424] bg-[#070707] p-3"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[#ddd]">
                                      Quiz{" "}
                                      {index +
                                        1}
                                      :{" "}
                                      {
                                        quiz.title
                                      }
                                    </p>

                                    <p className="mt-1 text-[11px] text-[#666]">
                                      {quiz
                                        .questions
                                        ?.length ||
                                        0}{" "}
                                      questions
                                    </p>
                                  </div>

                                  <Link
                                    href={`/quizzes/${quiz.documentId}`}
                                    className="shrink-0 rounded-lg bg-[#f15a24] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#d94b1f]"
                                  >
                                    Start
                                  </Link>
                                </div>
                              )
                            )}

                          </div>
                        )}
                      </div>

                      {/* Continue */}

                      <Link
                        href={`/courses/${course.documentId}`}
                        className="group/button mt-6 flex w-full items-center justify-center rounded-xl border border-[#292929] bg-[#050505] px-5 py-3 text-sm font-semibold text-[#f5f5f5] transition hover:border-[#f15a24]/40 hover:bg-[#f15a24]/[0.06]"
                      >
                        Continue Learning

                        <span className="ml-2 text-[#f15a24] transition-transform group-hover/button:translate-x-1">
                          →
                        </span>
                      </Link>

                    </div>
                  </article>
                );
              }
            )}

          </div>
        )}

      </div>
    </main>
  );
}