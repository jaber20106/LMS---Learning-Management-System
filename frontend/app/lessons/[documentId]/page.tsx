"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    id?: number;
    documentId?: string;
  } | null;
  user?: {
    id?: number;
    documentId?: string;
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
        const { documentId } =
          await params;

        const token =
          localStorage.getItem("lms_token");

        if (!token) {
          if (!cancelled) {
            setMessage(
              "Please login first."
            );
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
                Authorization:
                  `Bearer ${token}`,
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
        // 3. GET ALL PROGRESS
        //
        // Don't use the old nested filter.
        // We filter current user + lesson
        // on the client side.
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

        if (!progressResponse.ok) {
          console.error(
            "PROGRESS GET ERROR:",
            progressResult
          );

          // Don't stop lesson page.
          // User can still try Mark Complete.
          if (!cancelled) {
            setProgress(null);
          }

          return;
        }

        const progressList: Progress[] =
          Array.isArray(
            progressResult?.data
          )
            ? progressResult.data
            : [];

        console.log(
          "ALL PROGRESS:",
          progressList
        );

        // ======================================
        // FIND PROGRESS FOR THIS USER + LESSON
        // ======================================

        const currentProgress =
          progressList.find(
            (item) => {
              const progressUserId =
  item?.user?.id ||
  item?.user?.data?.id;

              const progressLessonId =
  item?.lesson?.documentId ||
  item?.lesson?.data?.documentId;

              return (
                progressUserId ===
                  currentUserId &&
                progressLessonId ===
                  documentId
              );
            }
          ) || null;

        console.log(
          "CURRENT LESSON PROGRESS:",
          currentProgress
        );

        if (!cancelled) {
          setProgress(
            currentProgress
          );
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
        setMessage(
          "Please login first."
        );
        return;
      }

      if (!lesson) {
        setMessage(
          "Lesson not found."
        );
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
        "MARK COMPLETE USER:",
        userResult
      );

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

      if (progress?.documentId) {
        console.log(
          "UPDATING PROGRESS:",
          progress.documentId
        );

        const updateResponse =
          await fetch(
            `http://localhost:1337/api/lesson-progresses/${encodeURIComponent(
              progress.documentId
            )}`,
            {
              method: "PUT",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
              body: JSON.stringify({
                data: {
                  completed: true,
                  completedAt,
                },
              }),
            }
          );

        const updateResult =
          await updateResponse.json();

        console.log(
          "UPDATE PROGRESS RESULT:",
          updateResult
        );

        if (!updateResponse.ok) {
          throw new Error(
            updateResult?.error?.message ||
              `Failed to update progress. Status: ${updateResponse.status}`
          );
        }

        setProgress(
          updateResult?.data ||
            progress
        );

        setMessage(
          "Lesson marked as complete! ✓"
        );

        return;
      }

      // ======================================
      // CREATE NEW PROGRESS
      // ======================================

      console.log(
        "CREATING NEW PROGRESS"
      );

      const createResponse =
        await fetch(
          "http://localhost:1337/api/lesson-progresses",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
              data: {
                completed: true,
                completedAt,

                user: {
                  connect: [
                    currentUserId,
                  ],
                },

                lesson: {
                  connect: [
                    lesson.documentId,
                  ],
                },
              },
            }),
          }
        );

      const createResult =
        await createResponse.json();

      console.log(
        "CREATE PROGRESS RESULT:",
        createResult
      );

      if (!createResponse.ok) {
        throw new Error(
          createResult?.error?.message ||
            `Failed to create progress. Status: ${createResponse.status}`
        );
      }

      setProgress(
        createResult?.data || {
          id: 0,
          documentId: "",
          completed: true,
          completedAt,
          user: {
            id: currentUserId,
          },
          lesson: {
            documentId:
              lesson.documentId,
          },
        }
      );

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
          <p
            style={{
              color: "#999",
            }}
          >
            Loading lesson...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
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

  // ==========================================
  // LESSON PAGE
  // ==========================================

  const isCompleted =
    progress?.completed === true;

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
          onClick={() =>
            router.back()
          }
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
              margin: 0,
              color: "#888",
              fontSize: "14px",
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

          <p
            style={{
              marginTop: "20px",
              lineHeight: "1.8",
              color: "#aaa",
              whiteSpace: "pre-wrap",
            }}
          >
            {lesson.content}
          </p>

          {/* COMPLETE AREA */}

          <div
            style={{
              marginTop: "40px",
              paddingTop: "25px",
              borderTop:
                "1px solid #333",
            }}
          >
            {isCompleted ? (
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#22c55e",
                  }}
                >
                  ✓ Lesson Completed
                </h3>

                {progress?.completedAt && (
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#999",
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
                  padding:
                    "12px 20px",
                  border:
                    "1px solid #444",
                  borderRadius: "7px",
                  background:
                    completing
                      ? "#222"
                      : "white",
                  color:
                    completing
                      ? "#888"
                      : "black",
                  cursor:
                    completing
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "700",
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
                  marginTop: "18px",
                  color:
                    message.includes(
                      "complete"
                    )
                      ? "#22c55e"
                      : "#ff7777",
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