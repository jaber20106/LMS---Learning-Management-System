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
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

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
          user?.error?.message || "Failed to load user"
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

      const coursesResponse = await fetch(coursesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

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
              course: course,
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

    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setDeletingId(documentId);

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
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Link
            href="/instructor/dashboard"
            style={backStyle}
          >
            ← Dashboard
          </Link>

          <h1 style={headingStyle}>
            Manage Quizzes
          </h1>

          <p style={mutedStyle}>
            Loading quizzes...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Link
          href="/instructor/dashboard"
          style={backStyle}
        >
          ← Dashboard
        </Link>

        <div style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>
              Instructor
            </p>

            <h1 style={headingStyle}>
              Manage Quizzes
            </h1>

            <p style={mutedStyle}>
              Manage quizzes from your courses.
            </p>
          </div>

          <Link
            href="/instructor/dashboard/quizzes"
            style={createButtonStyle}
          >
            + Create Quiz
          </Link>
        </div>

        {message && (
          <div style={messageStyle}>
            {message}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div style={emptyStyle}>
            <h2
              style={{
                marginTop: 0,
                color: "white",
              }}
            >
              No quizzes found
            </h2>

            <p>
              No quizzes were found in your
              courses.
            </p>

            <Link
              href="/instructor/dashboard/quizzes"
              style={createButtonStyle}
            >
              Create Quiz
            </Link>
          </div>
        ) : (
          <div style={listStyle}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.documentId}
                style={quizCardStyle}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#777",
                      fontSize: "13px",
                    }}
                  >
                    COURSE
                  </div>

                  <div
                    style={{
                      color: "#aaa",
                      marginTop: "4px",
                      marginBottom: "15px",
                    }}
                  >
                    {quiz.course?.title ||
                      "Unknown course"}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "24px",
                    }}
                  >
                    {quiz.title}
                  </h2>

                  <p
                    style={{
                      color: "#999",
                    }}
                  >
                    {quiz.description ||
                      "No description"}
                  </p>

                  <p
                    style={{
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    Questions:{" "}
                    {quiz.questions?.length || 0}
                  </p>
                </div>

                <div style={actionsStyle}>
                  <Link
                    href={`/instructor/dashboard/quizzes/edit/${quiz.documentId}`}
                    style={editButtonStyle}
                  >
                    Edit
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
                    style={deleteButtonStyle}
                  >
                    {deletingId ===
                    quiz.documentId
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ==========================================
// STYLES
// ==========================================

const pageStyle = {
  minHeight: "100vh",
  padding: "55px 25px 100px",
};

const containerStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
};

const backStyle = {
  color: "#aaa",
  textDecoration: "none",
  fontSize: "14px",
};

const headerStyle = {
  marginTop: "30px",
  marginBottom: "30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  flexWrap: "wrap" as const,
};

const eyebrowStyle = {
  margin: 0,
  color: "#888",
};

const headingStyle = {
  margin: "8px 0",
  fontSize: "38px",
};

const mutedStyle = {
  color: "#999",
};

const createButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 18px",
  borderRadius: "8px",
  background: "white",
  color: "black",
  textDecoration: "none",
  fontWeight: "700",
};

const messageStyle = {
  marginBottom: "25px",
  padding: "13px 15px",
  border: "1px solid #444",
  borderRadius: "8px",
  color: "#ccc",
};

const emptyStyle = {
  marginTop: "35px",
  padding: "45px 25px",
  border: "1px dashed #444",
  borderRadius: "12px",
  textAlign: "center" as const,
  color: "#888",
};

const listStyle = {
  display: "grid",
  gap: "18px",
};

const quizCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "25px",
  padding: "25px",
  border: "1px solid #333",
  borderRadius: "12px",
  background: "#111",
  flexWrap: "wrap" as const,
};

const actionsStyle = {
  display: "flex",
  gap: "10px",
};

const editButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #444",
  borderRadius: "7px",
  background: "transparent",
  color: "white",
  textDecoration: "none",
};

const deleteButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #633",
  borderRadius: "7px",
  background: "transparent",
  color: "#ff7777",
  cursor: "pointer",
};