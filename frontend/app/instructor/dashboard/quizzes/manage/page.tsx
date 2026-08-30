"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: number;
  documentId: string;
  title: string;
};

type Question = {
  id: number;
  documentId: string;
};

type Quiz = {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  course?: Course | null;
  questions?: Question[];
};

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    try {
      // ==========================================
      // 1. CURRENT USER
      // ==========================================

      const userResponse = await fetch(
        "http://localhost:1337/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const user = await userResponse.json();

      console.log("CURRENT USER:", user);

      if (!userResponse.ok) {
        throw new Error(
          user?.error?.message ||
            "Failed to load user"
        );
      }

      const userId = user.id;

      console.log("INSTRUCTOR ID:", userId);

      // ==========================================
      // 2. GET THIS INSTRUCTOR'S COURSES
      // ==========================================

      const coursesUrl =
        `http://localhost:1337/api/courses` +
        `?filters[instructor][id][$eq]=${userId}` +
        `&status=published`;

      console.log("COURSES URL:", coursesUrl);

      const coursesResponse = await fetch(
        coursesUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const coursesResult =
        await coursesResponse.json();

      console.log(
        "INSTRUCTOR COURSES RESPONSE:",
        coursesResult
      );

      if (!coursesResponse.ok) {
        throw new Error(
          coursesResult?.error?.message ||
            "Failed to load courses"
        );
      }

      const courses: Course[] =
        coursesResult?.data || [];

      console.log(
        "INSTRUCTOR COURSES:",
        courses
      );

      // ==========================================
      // 3. GET QUIZZES FOR EACH COURSE
      // ==========================================

      const collectedQuizzes: Quiz[] = [];

      for (const course of courses) {
        console.log(
          "LOADING QUIZZES FOR COURSE:",
          course.title,
          course.documentId
        );

        const quizUrl =
          `http://localhost:1337/api/quizzes` +
          `?filters[course][documentId][$eq]=${course.documentId}` +
          `&status=published` +
          `&populate[questions]=true`;

        console.log(
          "COURSE QUIZ URL:",
          quizUrl
        );

        const quizResponse = await fetch(
          quizUrl,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const quizResult =
          await quizResponse.json();

        console.log(
          `QUIZZES FOR ${course.title}:`,
          quizResult
        );

        if (!quizResponse.ok) {
          console.warn(
            `Could not load quizzes for ${course.title}`,
            quizResult
          );

          continue;
        }

        const courseQuizzes =
          quizResult?.data || [];

        courseQuizzes.forEach(
          (quiz: Quiz) => {
            collectedQuizzes.push({
              ...quiz,
              course,
            });
          }
        );
      }

      // ==========================================
      // 4. REMOVE DUPLICATES
      // ==========================================

      const uniqueQuizzes = Array.from(
        new Map(
          collectedQuizzes.map((quiz) => [
            quiz.documentId,
            quiz,
          ])
        ).values()
      );

      console.log(
        "FINAL MY QUIZZES:",
        uniqueQuizzes
      );

      setQuizzes(uniqueQuizzes);
    } catch (error) {
      console.error(
        "MANAGE QUIZZES ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function handleDelete(
    documentId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
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
      const response = await fetch(
        `http://localhost:1337/api/quizzes/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log(
        "DELETE QUIZ:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete quiz."
        );
        return;
      }

      setQuizzes((current) =>
        current.filter(
          (quiz) =>
            quiz.documentId !== documentId
        )
      );

      setMessage(
        "Quiz deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE QUIZ ERROR:",
        error
      );

      setMessage(
        "Failed to delete quiz."
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
        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="h-4 w-28 rounded bg-white/[0.06]" />

          <div className="mt-6 h-10 w-72 max-w-full rounded bg-white/[0.06]" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.04]" />

          <div className="mt-8 h-32 rounded-2xl bg-white/[0.04]" />

          <div className="mt-4 h-32 rounded-2xl bg-white/[0.04]" />

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-7 pb-16 text-white sm:px-8 sm:py-10 lg:px-12">

      <div className="mx-auto max-w-6xl">

        {/* =====================================
            BACK
        ===================================== */}

        <Link
          href="/instructor/dashboard"
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Dashboard
        </Link>

        {/* =====================================
            HEADER
        ===================================== */}

        <section className="mt-7 rounded-3xl border border-[#292929] bg-[#0b0b0b] p-6 sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#f15a24]/20 bg-[#f15a24]/[0.06] px-3 py-1.5">

                <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                  Instructor
                </span>

              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Manage Quizzes
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
                Create, edit and manage quizzes
                from your courses.
              </p>

            </div>

            <Link
              href="/instructor/dashboard/quizzes"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
            >
              + Create Quiz
            </Link>

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
            SUMMARY
        ===================================== */}

        <div className="mt-6 flex items-center justify-between border-b border-[#202020] pb-4">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
              Quiz Library
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Your Quizzes
            </h2>
          </div>

          <span className="text-sm text-[#555]">
            {quizzes.length}{" "}
            {quizzes.length === 1
              ? "quiz"
              : "quizzes"}
          </span>

        </div>

        {/* =====================================
            EMPTY
        ===================================== */}

        {quizzes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-5 py-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-xl text-[#f15a24]">
              ?
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No quizzes found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#666]">
              No quizzes were found in your
              published courses.
            </p>

            <Link
              href="/instructor/dashboard/quizzes"
              className="mt-6 inline-flex rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
            >
              Create Quiz
            </Link>

          </div>
        ) : (

          /* ===================================
             QUIZ LIST
          =================================== */

          <div className="mt-6 space-y-4">

            {quizzes.map(
              (quiz, index) => (
                <article
                  key={quiz.documentId}
                  className="overflow-hidden rounded-2xl border border-[#292929] bg-[#0b0b0b] transition hover:border-[#f15a24]/30"
                >

                  <div className="p-5 sm:p-6">

                    {/* Top */}

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-xs font-semibold text-[#f15a24]">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666]">
                            Quiz
                          </span>

                          {quiz.course?.title && (
                            <>
                              <span className="text-[#333]">
                                /
                              </span>

                              <span className="max-w-[220px] truncate text-xs text-[#777]">
                                {quiz.course.title}
                              </span>
                            </>
                          )}

                        </div>

                        <h2 className="mt-4 text-xl font-semibold leading-7 text-[#f5f5f5] sm:text-2xl">
                          {quiz.title}
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777]">
                          {quiz.description ||
                            "No description available."}
                        </p>

                      </div>

                      <div className="shrink-0 rounded-full border border-green-500/20 bg-green-500/[0.05] px-3 py-1 text-[10px] font-medium text-green-400">
                        Published
                      </div>

                    </div>

                    {/* Meta */}

                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#202020] pt-4">

                      <div>
                        <span className="text-xs text-[#555]">
                          Course
                        </span>

                        <p className="mt-0.5 text-sm text-[#aaa]">
                          {quiz.course?.title ||
                            "Unknown course"}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs text-[#555]">
                          Questions
                        </span>

                        <p className="mt-0.5 text-sm text-[#aaa]">
                          {quiz.questions?.length ||
                            0}
                        </p>
                      </div>

                    </div>

                    {/* Actions */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      <Link
                        href={`/instructor/dashboard/quizzes/edit/${quiz.documentId}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[#f15a24] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d94b1f]"
                      >
                        Edit Quiz
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            quiz.documentId
                          )
                        }
                        disabled={
                          deletingId ===
                          quiz.documentId
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-transparent px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        quiz.documentId
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

      </div>
    </main>
  );
}