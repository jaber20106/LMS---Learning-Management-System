"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Lesson = {
  id: number;
  documentId: string;
  title: string;
  content: string;
};

type Progress = {
  id: number;
  documentId: string;
  completed: boolean;
  completedAt?: string | null;
  lesson?: {
    documentId?: string;
  } | null;
  user?: {
    id?: number;
  } | null;
};

export default function LessonDetailsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const router = useRouter();

  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [progress, setProgress] =
    useState<Progress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [completing, setCompleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ==========================================
  // LOAD LESSON + CURRENT USER PROGRESS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadLesson() {
      try {
        const { documentId } = await params;

        const token =
          localStorage.getItem("lms_token");

        if (!token) {
          if (!cancelled) {
            setMessage("Please login first.");
            setLoading(false);
          }

          return;
        }

        console.log(
          "LESSON DOCUMENT ID:",
          documentId
        );

        // ======================================
        // 1. GET LESSON
        // ======================================

        const lessonResponse =
          await fetch(
            `http://localhost:1337/api/lessons/${encodeURIComponent(
              documentId
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

        const lessonResult =
          await lessonResponse.json();

        console.log(
          "LESSON API:",
          lessonResult
        );

        if (!lessonResponse.ok) {
          if (!cancelled) {
            setMessage(
              lessonResult?.error?.message ||
                `Failed to fetch lesson. Status: ${lessonResponse.status}`
            );
            setLoading(false);
          }

          return;
        }

        if (!lessonResult?.data) {
          if (!cancelled) {
            setMessage(
              "Lesson not found."
            );
            setLoading(false);
          }

          return;
        }

        const currentLesson: Lesson =
          lessonResult.data;

        if (cancelled) {
          return;
        }

        setLesson(currentLesson);

        // ======================================
        // 2. GET CURRENT USER
        // ======================================

        const userResponse =
          await fetch(
            "http://localhost:1337/api/users/me",
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

        console.log(
          "CURRENT USER:",
          userResult
        );

        if (!userResponse.ok) {
          if (!cancelled) {
            setMessage(
              userResult?.error?.message ||
                "Failed to get current user."
            );
          }

          return;
        }

        const currentUserId =
          userResult?.id;

        if (!currentUserId) {
          if (!cancelled) {
            setMessage(
              "Current user could not be identified."
            );
          }

          return;
        }

        // ======================================
        // 3. GET CURRENT USER'S PROGRESS
        // FOR CURRENT LESSON ONLY
        // ======================================

        const progressResponse =
          await fetch(
            `http://localhost:1337/api/lesson-progresses?filters[lesson][documentId][$eq]=${encodeURIComponent(
              documentId
            )}&filters[user][id][$eq]=${currentUserId}&populate=lesson&populate=user`,
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
          "CURRENT LESSON PROGRESS:",
          progressResult
        );

        if (
          progressResponse.ok &&
          Array.isArray(
            progressResult?.data
          )
        ) {
          const currentProgress =
            progressResult.data[0] ||
            null;

          if (!cancelled) {
            setProgress(
              currentProgress
            );
          }
        } else {
          if (!cancelled) {
            setProgress(null);
          }
        }
      } catch (error) {
        console.error(
          "LESSON LOAD ERROR:",
          error
        );

        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLesson();

    return () => {
      cancelled = true;
    };
  }, [params]);

  // ==========================================
  // MARK LESSON COMPLETE
  // ==========================================

  async function markComplete() {
    try {
      setCompleting(true);
      setMessage("");

      const token =
        localStorage.getItem("lms_token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      if (!lesson) {
        setMessage("Lesson not found.");
        return;
      }

      // ======================================
      // GET CURRENT USER
      // ======================================

      const userResponse =
        await fetch(
          "http://localhost:1337/api/users/me",
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
        throw new Error(
          userResult?.error?.message ||
            "Failed to get current user."
        );
      }

      const currentUserId =
        userResult?.id;

      if (!currentUserId) {
        throw new Error(
          "Current user could not be identified."
        );
      }

      const completedAt =
        new Date().toISOString();

      // ======================================
      // UPDATE EXISTING PROGRESS
      // ======================================

      if (progress) {
        console.log(
          "UPDATING PROGRESS:",
          progress.documentId
        );

        const response =
          await fetch(
            `http://localhost:1337/api/lesson-progresses/${encodeURIComponent(
              progress.documentId
            )}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                data: {
                  completed: true,
                  completedAt,
                },
              }),
            }
          );

        const result =
          await response.json();

        console.log(
          "UPDATE PROGRESS RESULT:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              "Failed to update lesson progress."
          );
        }

        setProgress(result.data);

        setMessage(
          "Lesson marked as complete! ✓"
        );

        return;
      }

      // ======================================
      // CREATE NEW PROGRESS
      // ======================================

      console.log(
        "CREATING PROGRESS"
      );

      const response =
        await fetch(
          "http://localhost:1337/api/lesson-progresses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              data: {
                completed: true,
                completedAt,

                user: currentUserId,

                lesson:
                  lesson.documentId,
              },
            }),
          }
        );

      const result =
        await response.json();

      console.log(
        "CREATE PROGRESS RESULT:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            "Failed to create lesson progress."
        );
      }

      setProgress(result.data);

      setMessage(
        "Lesson marked as complete! ✓"
      );
    } catch (error) {
      console.error(
        "MARK COMPLETE ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete lesson."
      );
    } finally {
      setCompleting(false);
    }
  }

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
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <p style={{ color: "#999" }}>
            Loading lesson...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR / LESSON NOT FOUND
  // ==========================================

  if (!lesson) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 30px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1>Lesson Access</h1>

          <p
            style={{
              marginTop: "20px",
              color: "#aaa",
            }}
          >
            {message ||
              "Lesson not found."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
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

  // ==========================================
  // LESSON PAGE
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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* BACK */}

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: "inline-block",
            marginBottom: "30px",
            padding: 0,
            border: "none",
            background: "transparent",
            color: "#aaa",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        {/* LESSON */}

        <div
          style={{
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "30px",
          }}
        >
          <p
            style={{
              color: "#777",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Lesson
          </p>

          <h1
            style={{
              marginTop: "10px",
            }}
          >
            {lesson.title}
          </h1>

          <div
            style={{
              marginTop: "30px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              color: "#ccc",
            }}
          >
            {lesson.content}
          </div>

          {/* COMPLETE */}

          <div
            style={{
              marginTop: "40px",
              paddingTop: "25px",
              borderTop: "1px solid #333",
            }}
          >
            {progress?.completed ? (
              <div>
                <p
                  style={{
                    color: "#22c55e",
                    fontWeight: "600",
                    fontSize: "18px",
                  }}
                >
                  ✓ Lesson Completed
                </p>

                {progress.completedAt && (
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    Completed at:{" "}
                    {new Date(
                      progress.completedAt
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={markComplete}
                disabled={completing}
                style={{
                  padding: "12px 20px",
                  border: "1px solid white",
                  borderRadius: "7px",
                  background: completing
                    ? "#333"
                    : "white",
                  color: completing
                    ? "#999"
                    : "black",
                  cursor: completing
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                {completing
                  ? "Saving..."
                  : "Mark as Complete ✓"}
              </button>
            )}

            {message && (
              <p
                style={{
                  marginTop: "15px",
                  color: message.includes(
                    "complete"
                  )
                    ? "#22c55e"
                    : "#aaa",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}