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
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingLesson, setEditingLesson] =
    useState<Lesson | null>(null);

  const [saving, setSaving] = useState(false);

  const [courseDocumentId, setCourseDocumentId] =
    useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const { documentId } = await params;

        setCourseDocumentId(documentId);

        const token =
          localStorage.getItem("lms_token");

        const role =
          localStorage.getItem("lms_role");

        if (!token) {
          setMessage("Please login first.");
          setLoading(false);
          return;
        }

        if (role !== "instructor") {
          setMessage(
            "Only instructors can manage lessons."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:1337/api/courses/${encodeURIComponent(
            documentId
          )}?status=draft&populate=lessons`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

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
          setMessage("Course not found.");
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
  }

  function startEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setContent(lesson.content);

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
      setMessage("Please login first.");
      return;
    }

    if (!courseDocumentId) {
      setMessage("Course documentId is missing.");
      return;
    }

    if (!title.trim()) {
      setMessage("Lesson title is required.");
      return;
    }

    if (!content.trim()) {
      setMessage("Lesson content is required.");
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
          `http://localhost:1337/api/lessons/${encodeURIComponent(
            editingLesson.documentId
          )}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                title: title.trim(),
                content: content.trim(),
              },
            }),
          }
        );

        const result = await response.json();

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
        "http://localhost:1337/api/lessons",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  data: {
    title: title.trim(),
    content: content.trim(),
    course: {
      connect: [courseDocumentId],
    },
  },
}),
        }
      );

      const result = await response.json();

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

    if (!token || !courseDocumentId) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1337/api/courses/${encodeURIComponent(
          courseDocumentId
        )}?status=draft&populate=lessons`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.ok && result?.data) {
        setCourse(result.data);
      }
    } catch (error) {
      console.error(
        "Reload course error:",
        error
      );
    }
  }

  async function deleteLesson(lesson: Lesson) {
  const confirmed = window.confirm(
    `Delete "${lesson.title}"? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("lms_token");

  if (!token) {
    setMessage("Please login first.");
    return;
  }

  setMessage("Deleting lesson...");

  try {
    const response = await fetch(
      `http://localhost:1337/api/lessons/${encodeURIComponent(
        lesson.documentId
      )}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // DELETE response may be empty.
    const responseText = await response.text();

    let result: any = null;

    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
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
            Loading lessons...
          </p>
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
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1>Course</h1>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#ccc",
            }}
          >
            {message || "Course not found."}
          </div>

          <Link
            href="/instructor/dashboard"
            style={{
              display: "inline-block",
              marginTop: "20px",
              color: "white",
              textDecoration: "none",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const lessons = course.lessons || [];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 30px 100px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/instructor/dashboard"
          style={{
            color: "#aaa",
            textDecoration: "none",
          }}
        >
          ← Back to Dashboard
        </Link>

        <div
          style={{
            marginTop: "35px",
          }}
        >
          <p
            style={{
              color: "#888",
              marginBottom: "8px",
            }}
          >
            Instructor
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
            }}
          >
            Manage Lessons
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#999",
            }}
          >
            {course.title}
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSaveLesson}
          style={{
            marginTop: "35px",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "24px",
            }}
          >
            {editingLesson
              ? "Edit Lesson"
              : "Add Lesson"}
          </h2>

          <div
            style={{
              marginTop: "22px",
              marginBottom: "20px",
            }}
          >
            <label
              htmlFor="lesson-title"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Lesson Title
            </label>

            <input
              id="lesson-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Introduction to React"
              disabled={saving}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#111",
                color: "white",
                fontSize: "15px",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              htmlFor="lesson-content"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Lesson Content
            </label>

            <textarea
              id="lesson-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Write the lesson content..."
              disabled={saving}
              required
              rows={8}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: "8px",
                border: "1px solid #444",
                background: "#111",
                color: "white",
                fontSize: "15px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          {message && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#ccc",
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: "white",
                color: "black",
                fontWeight: "700",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : editingLesson
                ? "Save Changes"
                : "Create Lesson"}
            </button>

            {editingLesson && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  padding: "11px 18px",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* LESSON LIST */}

        <section
          style={{
            marginTop: "45px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            Lessons ({lessons.length})
          </h2>

          <div
            style={{
              marginTop: "20px",
            }}
          >
            {lessons.length === 0 ? (
              <div
                style={{
                  padding: "30px",
                  border: "1px dashed #444",
                  borderRadius: "10px",
                  color: "#888",
                }}
              >
                No lessons added yet.
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <div
                  key={lesson.documentId}
                  style={{
                    border: "1px solid #333",
                    borderRadius: "12px",
                    padding: "22px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#777",
                          fontSize: "13px",
                        }}
                      >
                        Lesson {index + 1}
                      </p>

                      <h3
                        style={{
                          marginTop: "7px",
                          marginBottom: "10px",
                          fontSize: "21px",
                        }}
                      >
                        {lesson.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#aaa",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {lesson.content}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexShrink: 0,
                      }}
                    >
                      <Link
                        href={`/lessons/${lesson.documentId}`}
                        style={{
                          padding: "9px 13px",
                          border: "1px solid #444",
                          borderRadius: "7px",
                          color: "white",
                          textDecoration: "none",
                          fontSize: "14px",
                        }}
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(lesson)
                        }
                        style={{
                          padding: "9px 13px",
                          border: "none",
                          borderRadius: "7px",
                          background: "white",
                          color: "black",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteLesson(lesson)
                        }
                        style={{
                          padding: "9px 13px",
                          border: "1px solid #633",
                          borderRadius: "7px",
                          background:
                            "transparent",
                          color: "#ff7777",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}