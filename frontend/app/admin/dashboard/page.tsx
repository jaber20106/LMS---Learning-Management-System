"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  username?: string;
  email?: string;
  role?: {
    name?: string;
    type?: string;
  };
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  description?: string;
};

type Lesson = {
  id: number;
  documentId: string;
  title: string;
  course?: {
    id: number;
    documentId: string;
    title: string;
  } | null;
};

type Quiz = {
  id: number;
  documentId: string;
  title: string;
  description?: string;
};

const API_URL = "https://lms-learning-management-system-production-0ff5.up.railway.app";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("lms_token");
    const role = localStorage.getItem("lms_role");

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    if (role !== "admin") {
      setMessage("Access denied. Admin only.");
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setMessage("");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        usersResponse,
        coursesResponse,
        lessonsResponse,
        quizzesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/users`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/courses?populate=*`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/lessons?populate=*`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/quizzes?populate=*`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users.");
      }

      if (!coursesResponse.ok) {
        throw new Error("Failed to fetch courses.");
      }

      if (!lessonsResponse.ok) {
        throw new Error("Failed to fetch lessons.");
      }

      // Quiz permission failure should not break
      // the entire admin dashboard.
      let quizzesData: { data?: Quiz[] } = {
        data: [],
      };

      if (quizzesResponse.ok) {
        quizzesData = await quizzesResponse.json();
      }

      const usersData = await usersResponse.json();
      const coursesData = await coursesResponse.json();
      const lessonsData = await lessonsResponse.json();

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : []
      );

      setCourses(
        coursesData?.data || []
      );

      setLessons(
        lessonsData?.data || []
      );

      setQuizzes(
        quizzesData?.data || []
      );

      if (!quizzesResponse.ok) {
        setMessage(
          "Courses and lessons loaded. Quiz list could not be loaded."
        );
      }
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteCourse(
    documentId: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`
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

    try {
      setMessage("Deleting course...");

      const response = await fetch(
        `${API_URL}/api/courses/${encodeURIComponent(
          documentId
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
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

      setCourses((current) =>
        current.filter(
          (course) =>
            course.documentId !==
            documentId
        )
      );

      setLessons((current) =>
        current.filter(
          (lesson) =>
            lesson.course?.documentId !==
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
    }
  }

  async function deleteLesson(
    documentId: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`
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

    try {
      setMessage("Deleting lesson...");

      const response = await fetch(
        `${API_URL}/api/lessons/${encodeURIComponent(
          documentId
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete lesson."
        );
        return;
      }

      setLessons((current) =>
        current.filter(
          (lesson) =>
            lesson.documentId !==
            documentId
        )
      );

      setMessage(
        "Lesson deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete lesson error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the lesson."
      );
    }
  }

  async function deleteQuiz(
    documentId: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`
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

    try {
      setMessage("Deleting quiz...");

      const response = await fetch(
        `${API_URL}/api/quizzes/${encodeURIComponent(
          documentId
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

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
            quiz.documentId !==
            documentId
        )
      );

      setMessage(
        "Quiz deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete quiz error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the quiz."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-4 w-28 rounded bg-white/[0.06]" />
          <div className="mt-5 h-10 w-72 max-w-full rounded bg-white/[0.06]" />

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (
    message ===
    "Access denied. Admin only."
  ) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-500/20 bg-[#0b0b0b] p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">
            Administration
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-[#777]">
            Only administrators can access
            this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-7 pb-16 text-white sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <section className="rounded-3xl border border-[#292929] bg-[#0b0b0b] p-6 sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f15a24]/20 bg-[#f15a24]/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                  Administration
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
                Manage courses, lessons and
                quizzes from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <Link
                href="/instructor/dashboard/create-course"
                className="rounded-xl bg-[#f15a24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
              >
                + Create Course
              </Link>

              <Link
                href="/instructor/dashboard/quizzes"
                className="rounded-xl border border-[#303030] px-4 py-3 text-sm font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
              >
                + Create Quiz
              </Link>

              <button
                type="button"
                onClick={loadDashboard}
                disabled={refreshing}
                className="rounded-xl border border-[#303030] px-4 py-3 text-sm font-medium text-[#aaa] transition hover:border-[#444] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>

          </div>

        </section>

        {/* Message */}

        {message && (
          <div className="mt-5 rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-[#aaa]">
            {message}
          </div>
        )}

        {/* Statistics */}

        <section className="mt-6">

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            <StatCard
              title="Total Users"
              value={users.length}
            />

            <StatCard
              title="Total Courses"
              value={courses.length}
            />

            <StatCard
              title="Total Lessons"
              value={lessons.length}
            />

            <StatCard
              title="Total Quizzes"
              value={quizzes.length}
            />

          </div>

        </section>

        {/* Courses */}

        <section className="mt-10">

          <SectionHeader
            title="Courses"
            count={courses.length}
          />

          {courses.length === 0 ? (
            <EmptyState
              title="No courses yet"
              text="Create a course to start adding lessons and quizzes."
              actionHref="/instructor/dashboard/create-course"
              actionText="+ Create Course"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {courses.map((course) => {

                const courseLessons =
                  lessons.filter(
                    (lesson) =>
                      lesson.course?.documentId ===
                      course.documentId
                  );

                return (
                  <article
                    key={
                      course.documentId
                    }
                    className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                          Course
                        </span>

                        <h3 className="mt-2 break-words text-xl font-semibold">
                          {course.title}
                        </h3>

                      </div>

                      <span className="shrink-0 rounded-full border border-[#292929] px-2.5 py-1 text-[10px] text-[#666]">
                        {courseLessons.length}{" "}
                        lessons
                      </span>

                    </div>

                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#777]">
                      {course.description ||
                        "No description available."}
                    </p>

                    <div className="mt-5 border-t border-[#202020] pt-4">

                      <div className="flex flex-wrap gap-2">

                        <Link
                          href={`/courses/${course.documentId}`}
                          className="rounded-lg border border-[#303030] px-3.5 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#444] hover:text-white"
                        >
                          View
                        </Link>

                        <Link
                          href={`/instructor/dashboard/lessons/${course.documentId}`}
                          className="rounded-lg border border-[#303030] px-3.5 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
                        >
                          Manage Lessons
                        </Link>

                        <Link
                          href={`/instructor/dashboard/edit/${course.documentId}`}
                          className="rounded-lg border border-[#303030] px-3.5 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCourse(
                              course.documentId,
                              course.title
                            )
                          }
                          className="rounded-lg border border-red-500/20 px-3.5 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05]"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* Lessons */}

        <section className="mt-10">

          <SectionHeader
            title="Lessons"
            count={lessons.length}
          />

          {lessons.length === 0 ? (
            <EmptyState
              title="No lessons yet"
              text="Create a course first, then add lessons from Manage Lessons."
              actionHref={
                courses.length > 0
                  ? `/instructor/dashboard/lessons/${courses[0].documentId}`
                  : "/instructor/dashboard/create-course"
              }
              actionText={
                courses.length > 0
                  ? "Manage Lessons"
                  : "+ Create Course"
              }
            />
          ) : (
            <div className="space-y-3">

              {lessons.map(
                (lesson, index) => (
                  <div
                    key={
                      lesson.documentId
                    }
                    className="flex flex-col gap-4 rounded-2xl border border-[#292929] bg-[#0b0b0b] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >

                    <div className="flex min-w-0 items-center gap-4">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-xs font-semibold text-[#f15a24]">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div className="min-w-0">

                        <h3 className="break-words text-base font-semibold">
                          {lesson.title}
                        </h3>

                        <p className="mt-1 text-xs text-[#666]">
                          {lesson.course?.title ||
                            "Course not connected"}
                        </p>

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      {lesson.course && (
                        <Link
                          href={`/instructor/dashboard/lessons/${lesson.course.documentId}`}
                          className="rounded-lg border border-[#303030] px-3.5 py-2.5 text-xs text-[#aaa] transition hover:border-[#444] hover:text-white"
                        >
                          Manage
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteLesson(
                            lesson.documentId,
                            lesson.title
                          )
                        }
                        className="rounded-lg border border-red-500/20 px-3.5 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05]"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* Quizzes */}

        <section className="mt-10">

          <SectionHeader
            title="Quizzes"
            count={quizzes.length}
          />

          {quizzes.length === 0 ? (
            <EmptyState
              title="No quizzes yet"
              text="Create a quiz and connect it to one of your courses."
              actionHref="/instructor/dashboard/quizzes"
              actionText="+ Create Quiz"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {quizzes.map((quiz) => (
                <article
                  key={
                    quiz.documentId
                  }
                  className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:p-6"
                >

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                    Quiz
                  </span>

                  <h3 className="mt-2 break-words text-xl font-semibold">
                    {quiz.title}
                  </h3>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#777]">
                    {quiz.description ||
                      "No description available."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[#202020] pt-4">

                    <Link
                      href={`/instructor/dashboard/quizzes/edit/${quiz.documentId}`}
                      className="rounded-lg bg-[#f15a24] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d94b1f]"
                    >
                      Edit Quiz
                    </Link>

                    <Link
                      href={`/quizzes/${quiz.documentId}`}
                      className="rounded-lg border border-[#303030] px-3.5 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#444] hover:text-white"
                    >
                      View Quiz
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        deleteQuiz(
                          quiz.documentId,
                          quiz.title
                        )
                      }
                      className="rounded-lg border border-red-500/20 px-3.5 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05]"
                    >
                      Delete
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-4 sm:p-5">

      <p className="text-xs text-[#666]">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>

    </div>
  );
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="mb-5 flex items-center gap-2">

      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>

      <span className="rounded-full border border-[#292929] px-2.5 py-1 text-[10px] text-[#666]">
        {count}
      </span>

    </div>
  );
}

function EmptyState({
  title,
  text,
  actionHref,
  actionText,
}: {
  title: string;
  text: string;
  actionHref: string;
  actionText: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-5 py-10 text-center">

      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-sm text-[#f15a24]">
        —
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#ddd]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#666]">
        {text}
      </p>

      <Link
        href={actionHref}
        className="mt-5 inline-flex rounded-xl bg-[#f15a24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
      >
        {actionText}
      </Link>

    </div>
  );
}