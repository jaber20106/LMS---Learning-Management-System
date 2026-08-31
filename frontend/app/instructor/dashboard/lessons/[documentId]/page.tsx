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

export default function ManageLessonsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const [course, setCourse] =
    useState<Course | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [editingLesson, setEditingLesson] =
    useState<Lesson | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [courseDocumentId, setCourseDocumentId] =
    useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const { documentId } =
          await params;

        setCourseDocumentId(documentId);

        const token =
          localStorage.getItem("lms_token");

        const role =
          localStorage.getItem("lms_role");

        if (!token) {
          setMessage(
            "Please login first."
          );
          setLoading(false);
          return;
        }

        if (
  role !== "instructor" &&
  role !== "admin"
) {
  setMessage(
    "Only instructors and admins can manage lessons."
  );
  setLoading(false);
  return;
}

        const response = await fetch(
          `https://lms-learning-management-system-production-0ff5.up.railway.app/api/courses/${encodeURIComponent(
            documentId
          )}?status=draft&populate=lessons`,
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

        const result =
          await response.json();

        console.log(
          "MANAGE LESSONS COURSE:",
          result
        );

        if (!response.ok) {
          setMessage(
            result?.error?.message ||
              "Failed to load course."
          );
          setLoading(false);
          return;
        }

        if (!result?.data) {
          setMessage(
            "Course not found."
          );
          setLoading(false);
          return;
        }

        setCourse(result.data);
      } catch (error) {
        console.error(
          "Load lessons error:",
          error
        );

        setMessage(
          "Something went wrong while loading lessons."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params]);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingLesson(null);
    setMessage("");
  }

  function startEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setContent(lesson.content);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSaveLesson(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

    if (!courseDocumentId) {
      setMessage(
        "Course documentId is missing."
      );
      return;
    }

    if (!title.trim()) {
      setMessage(
        "Lesson title is required."
      );
      return;
    }

    if (!content.trim()) {
      setMessage(
        "Lesson content is required."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // =========================
      // UPDATE LESSON
      // =========================

      if (editingLesson) {
        const response = await fetch(
          `https://lms-learning-management-system-production-0ff5.up.railway.app/api/lessons/${encodeURIComponent(
            editingLesson.documentId
          )}`,
          {
            method: "PUT",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              data: {
                title: title.trim(),
                content:
                  content.trim(),
              },
            }),
          }
        );

        const result =
          await response.json();

        console.log(
          "UPDATE LESSON RESPONSE:",
          result
        );

        if (!response.ok) {
          setMessage(
            result?.error?.message ||
              "Failed to update lesson."
          );
          return;
        }

        setMessage(
          "Lesson updated successfully."
        );

        resetForm();

        await reloadCourse();

        return;
      }

      // =========================
      // CREATE LESSON
      // =========================

      const response = await fetch(
        "https://lms-learning-management-system-production-0ff5.up.railway.app/api/lessons",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            data: {
              title: title.trim(),
              content:
                content.trim(),
              course: {
                connect: [
                  courseDocumentId,
                ],
              },
            },
            status: "published",
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "CREATE LESSON RESPONSE:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to create lesson."
        );
        return;
      }

      setMessage(
        "Lesson created successfully."
      );

      resetForm();

      await reloadCourse();
    } catch (error) {
      console.error(
        "Save lesson error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function reloadCourse() {
    const token =
      localStorage.getItem("lms_token");

    if (
      !token ||
      !courseDocumentId
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `https://lms-learning-management-system-production-0ff5.up.railway.app/api/courses/${encodeURIComponent(
            courseDocumentId
          )}?status=draft&populate=lessons`,
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

      const result =
        await response.json();

      if (
        response.ok &&
        result?.data
      ) {
        setCourse(result.data);
      }
    } catch (error) {
      console.error(
        "Reload course error:",
        error
      );
    }
  }

  async function deleteLesson(
    lesson: Lesson
  ) {
    const confirmed =
      window.confirm(
        `Delete "${lesson.title}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem(
        "lms_token"
      );

    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }

    setMessage(
      "Deleting lesson..."
    );

    try {
      const response =
        await fetch(
          `https://lms-learning-management-system-production-0ff5.up.railway.app/api/lessons/${encodeURIComponent(
            lesson.documentId
          )}`,
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

      const responseText =
        await response.text();

      let result: any = null;

      if (responseText.trim()) {
        try {
          result =
            JSON.parse(
              responseText
            );
        } catch {
          console.log(
            "DELETE LESSON NON-JSON RESPONSE:",
            responseText
          );
        }
      }

      console.log(
        "DELETE LESSON STATUS:",
        response.status
      );

      console.log(
        "DELETE LESSON RESPONSE:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            `Failed to delete lesson. Status: ${response.status}`
        );
        return;
      }

      setMessage(
        "Lesson deleted successfully."
      );

      if (
        editingLesson?.documentId ===
        lesson.documentId
      ) {
        resetForm();
      }

      await reloadCourse();
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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="h-4 w-32 rounded bg-[#151515]" />

          <div className="mt-7 h-10 w-80 max-w-full rounded bg-[#151515]" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-[#111]" />

          <div className="mt-8 h-72 rounded-2xl bg-[#0b0b0b]" />

        </div>
      </main>
    );
  }

  // ==========================================
  // COURSE NOT FOUND
  // ==========================================

  if (!course) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
            Instructor
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Course
          </h1>

          <div className="mt-6 rounded-xl border border-[#292929] bg-[#0b0b0b] p-5 text-sm leading-6 text-[#aaa]">
            {message ||
              "Course not found."}
          </div>

          <Link
            href="/instructor/dashboard"
            className="mt-5 inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
          >
            ← Back to Dashboard
          </Link>

        </div>
      </main>
    );
  }

  const lessons =
    course.lessons || [];

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-7 pb-16 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12">

      <div className="mx-auto max-w-6xl">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="border-b border-[#202020] pb-7">

          <Link
            href="/instructor/dashboard"
            className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Dashboard
          </Link>

          <div className="mt-7">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
              Course Lessons
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Manage Lessons
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">

              <span className="text-[#888]">
                {course.title}
              </span>

              <span className="text-[#444]">
                •
              </span>

              <span className="text-[#666]">
                {lessons.length}{" "}
                {lessons.length === 1
                  ? "lesson"
                  : "lessons"}
              </span>

            </div>

          </div>

        </div>

        {/* =====================================
            MESSAGE
        ===================================== */}

        {message && (
          <div className="mt-5 rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-[#aaa]">
            {message}
          </div>
        )}

        {/* =====================================
            CREATE / EDIT FORM
        ===================================== */}

        <section className="mt-7 rounded-2xl border border-[#292929] bg-[#0b0b0b]">

          <div className="border-b border-[#202020] px-5 py-4 sm:px-6">

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f15a24]">
                  {editingLesson
                    ? "Edit"
                    : "New Lesson"}
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {editingLesson
                    ? "Edit Lesson"
                    : "Add Lesson"}
                </h2>
              </div>

              {editingLesson && (
                <span className="text-xs text-[#666]">
                  Editing:{" "}
                  {editingLesson.title}
                </span>
              )}

            </div>

          </div>

          <form
            onSubmit={
              handleSaveLesson
            }
            className="p-5 sm:p-6"
          >

            {/* Title */}

            <div>
              <label
                htmlFor="lesson-title"
                className="mb-2 block text-sm font-medium text-[#ddd]"
              >
                Lesson Title
              </label>

              <input
                id="lesson-title"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Introduction to React"
                disabled={saving}
                required
                className="w-full rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/60 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Content */}

            <div className="mt-5">
              <label
                htmlFor="lesson-content"
                className="mb-2 block text-sm font-medium text-[#ddd]"
              >
                Lesson Content
              </label>

              <textarea
                id="lesson-content"
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }
                placeholder="Write the lesson content..."
                disabled={saving}
                required
                rows={8}
                className="w-full resize-y rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/60 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Actions */}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">

              {editingLesson && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={saving}
                  className="rounded-xl border border-[#292929] bg-[#070707] px-5 py-3 text-sm font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white disabled:opacity-50"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingLesson
                  ? "Save Changes"
                  : "Create Lesson"}
              </button>

            </div>

          </form>
        </section>

        {/* =====================================
            LESSONS
        ===================================== */}

        <section className="mt-10">

          <div className="flex items-end justify-between border-b border-[#202020] pb-5">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f15a24]">
                Content
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Lessons
              </h2>
            </div>

            <span className="text-sm text-[#666]">
              {lessons.length} total
            </span>

          </div>

          {/* Empty */}

          {lessons.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-5 py-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-lg text-[#f15a24]">
                +
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No lessons yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#666]">
                Add your first lesson using
                the form above.
              </p>

            </div>
          ) : (
            <div className="mt-5 space-y-3">

              {lessons.map(
                (lesson, index) => (
                  <article
                    key={
                      lesson.documentId
                    }
                    className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 transition hover:border-[#f15a24]/30 sm:p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      {/* Lesson info */}

                      <div className="min-w-0">

                        <div className="flex items-center gap-3">

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f15a24]/[0.07] text-xs font-semibold text-[#f15a24]">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666]">
                            Lesson
                          </span>

                        </div>

                        <h3 className="mt-4 text-xl font-semibold leading-7 text-[#f5f5f5]">
                          {lesson.title}
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#777]">
                          {lesson.content}
                        </p>

                      </div>

                      {/* Actions */}

                      <div className="flex shrink-0 flex-wrap gap-2 lg:pt-1">

                        <Link
                          href={`/lessons/${lesson.documentId}`}
                          className="inline-flex items-center justify-center rounded-lg border border-[#292929] bg-[#070707] px-4 py-2.5 text-xs font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              lesson
                            )
                          }
                          className="inline-flex items-center justify-center rounded-lg bg-[#f15a24] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d94b1f]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteLesson(
                              lesson
                            )
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-transparent px-4 py-2.5 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05]"
                        >
                          Delete
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