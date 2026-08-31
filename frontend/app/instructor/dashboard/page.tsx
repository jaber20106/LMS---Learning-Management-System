"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Role = {
  id: number;
  name: string;
  type?: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  role?: Role | null;
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
};

type CourseResponse = {
  data: Course[];
};

export default function InstructorDashboard() {
  const [user, setUser] =
    useState<User | null>(null);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const userResponse =
        await fetch(
          "https://lms-learning-management-system-production-0ff5.up.railway.app/api/users/me?populate=*",
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

      const userResult =
        await userResponse.json();

      if (!userResponse.ok) {
        setMessage(
          userResult?.error?.message ||
            "Could not load user information."
        );
        setLoading(false);
        return;
      }

      setUser(userResult);

      const courseResponse =
        await fetch(
          "https://lms-learning-management-system-production-0ff5.up.railway.app/api/courses?populate=lessons",
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

      const courseResult:
        | CourseResponse
        | {
            error?: {
              message?: string;
            };
          } =
        await courseResponse.json();

      if (!courseResponse.ok) {
        setMessage(
          "error" in courseResult
            ? courseResult.error?.message ||
                "Failed to load courses."
            : "Failed to load courses."
        );
        setLoading(false);
        return;
      }

      if (!("data" in courseResult)) {
        setMessage(
          "Invalid course response."
        );
        setLoading(false);
        return;
      }

      setCourses(
        courseResult.data || []
      );
    } catch (error) {
      console.error(
        "Instructor dashboard error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCourse(
    documentId: string,
    title: string
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${title}"?`
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setDeletingId(documentId);
    setMessage("");

    try {
      const response =
        await fetch(
          `https://lms-learning-management-system-production-0ff5.up.railway.app/api/courses/${documentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete course."
        );
        return;
      }

      setCourses(
        (currentCourses) =>
          currentCourses.filter(
            (course) =>
              course.documentId !==
              documentId
          )
      );

      setMessage(
        "Course deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete course error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the course."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="h-4 w-28 rounded bg-[#151515]" />

          <div className="mt-5 h-12 w-80 max-w-full rounded bg-[#151515]" />

          <div className="mt-3 h-5 w-96 max-w-full rounded bg-[#111]" />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-32 rounded-2xl bg-[#0b0b0b]" />
            <div className="h-32 rounded-2xl bg-[#0b0b0b]" />
            <div className="h-32 rounded-2xl bg-[#0b0b0b]" />
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-7 pb-16 text-white sm:px-8 sm:py-10 lg:px-12">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-[#292929] bg-[#0b0b0b] p-6 sm:p-8 lg:p-10">

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f15a24]/[0.06] blur-3xl" />

          <div className="relative">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#f15a24]/20 bg-[#f15a24]/[0.06] px-3 py-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                    Instructor
                  </span>

                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Welcome back,{" "}
                  <span className="text-[#f15a24]">
                    {user?.username ||
                      "Instructor"}
                  </span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
                  Manage your courses and
                  teaching content from your
                  dashboard.
                </p>

              </div>

              {/* Header Actions */}

              <div className="flex flex-wrap gap-2">

                <Link
                  href="/instructor/dashboard/create-course"
                  className="inline-flex items-center justify-center rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
                >
                  + Create Course
                </Link>

                {/* EXISTING MANAGE QUIZZES */}

                <Link
                  href="/instructor/dashboard/quizzes/manage"
                  className="inline-flex items-center justify-center rounded-xl border border-[#303030] bg-[#080808] px-5 py-3 text-sm font-medium text-[#bbb] transition hover:border-[#f15a24]/40 hover:text-white"
                >
                  Manage Quizzes
                </Link>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================
            MESSAGE
        ===================================== */}

        {message && (
          <div className="mt-5 rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-[#aaa]">
            {message}
          </div>
        )}

        {/* =====================================
            STATS
        ===================================== */}

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 transition hover:border-[#f15a24]/30">

            <div className="flex items-start justify-between">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#666]">
                Courses
              </p>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-[#f15a24]">
                ◈
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {courses.length}
            </p>

            <p className="mt-1 text-xs text-[#666]">
              Total courses
            </p>

          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 transition hover:border-[#f15a24]/30">

            <div className="flex items-start justify-between">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#666]">
                Role
              </p>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-[#f15a24]">
                ✓
              </span>

            </div>

            <p className="mt-5 text-xl font-bold">
              Instructor
            </p>

            <p className="mt-1 text-xs text-[#666]">
              Account type
            </p>

          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 transition hover:border-[#f15a24]/30">

            <div className="flex items-start justify-between">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#666]">
                Account
              </p>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-[#f15a24]">
                @
              </span>

            </div>

            <p className="mt-5 truncate text-sm font-medium text-[#ddd]">
              {user?.email || "—"}
            </p>

            <p className="mt-1 text-xs text-[#666]">
              Instructor email
            </p>

          </div>

        </section>

        {/* =====================================
            MY COURSES
        ===================================== */}

        <section className="mt-12">

          <div className="flex flex-col gap-3 border-b border-[#202020] pb-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
                Content
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                My Courses
              </h2>

              <p className="mt-1 text-sm text-[#666]">
                Create, edit and manage your
                courses.
              </p>

            </div>

            <span className="text-sm text-[#555]">
              {courses.length}{" "}
              {courses.length === 1
                ? "course"
                : "courses"}
            </span>

          </div>

          {/* ===================================
              EMPTY
          =================================== */}

          {courses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-5 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-xl text-[#f15a24]">
                +
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No courses yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#666]">
                Create your first course to
                start building your learning
                content.
              </p>

              <Link
                href="/instructor/dashboard/create-course"
                className="mt-6 inline-flex rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
              >
                Create Course →
              </Link>

            </div>
          ) : (

            /* =================================
               COURSE GRID
            ================================= */

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

              {courses.map(
                (course, index) => (
                  <article
                    key={
                      course.documentId
                    }
                    className="overflow-hidden rounded-2xl border border-[#292929] bg-[#0b0b0b] transition hover:border-[#f15a24]/35"
                  >

                    {/* Card Header */}

                    <div className="flex items-center justify-between border-b border-[#202020] px-5 py-4">

                      <div className="flex items-center gap-3">

                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f15a24]/[0.07] text-xs font-semibold text-[#f15a24]">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666]">
                          Course
                        </span>

                      </div>

                      <span className="rounded-full border border-green-500/20 bg-green-500/[0.05] px-2.5 py-1 text-[10px] text-green-400">
                        Active
                      </span>

                    </div>

                    {/* Card Content */}

                    <div className="p-5 sm:p-6">

                      <h3 className="text-xl font-semibold leading-7 text-[#f5f5f5]">
                        {course.title}
                      </h3>

                      <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#777]">
                        {course.description ||
                          "No description available."}
                      </p>

                      {/* =================================
                          ACTIONS
                      ================================= */}

                      <div className="mt-6 flex flex-wrap gap-2 border-t border-[#202020] pt-5">

                        {/* View */}

                        <Link
                          href={`/courses/${course.documentId}`}
                          className="rounded-lg border border-[#292929] bg-[#070707] px-4 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
                        >
                          View
                        </Link>

                        {/* Lessons */}

                        <Link
                          href={`/instructor/dashboard/lessons/${course.documentId}`}
                          className="rounded-lg border border-[#292929] bg-[#070707] px-4 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
                        >
                          Lessons
                        </Link>

                        {/* MANAGE QUIZZES */}

                        <Link
                          href="/instructor/dashboard/quizzes/manage"
                          className="rounded-lg border border-[#292929] bg-[#070707] px-4 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
                        >
                          Manage Quizzes
                        </Link>

                        {/* Edit */}

                        <Link
                          href={`/instructor/dashboard/edit/${course.documentId}`}
                          className="rounded-lg bg-[#f15a24] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d94b1f]"
                        >
                          Edit
                        </Link>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCourse(
                              course.documentId,
                              course.title
                            )
                          }
                          disabled={
                            deletingId ===
                            course.documentId
                          }
                          className="rounded-lg border border-red-500/20 px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          course.documentId
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}