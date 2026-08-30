"use client";

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
          progressList.find((item) => {
            const progressUserId =
              item?.user?.id;

            const progressLessonId =
              item?.lesson?.documentId;

            return (
              progressUserId === currentUserId &&
              progressLessonId === documentId
            );
        }) || null;

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
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-4 w-20 rounded bg-white/[0.06]" />
            <div className="mt-8 h-10 w-2/3 rounded bg-white/[0.06]" />
            <div className="mt-4 h-4 w-full max-w-2xl rounded bg-white/[0.04]" />
            <div className="mt-8 h-48 rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
            Lesson
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Lesson Access
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#999]">
            {message ||
              "Lesson not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mt-6 rounded-lg border border-[#292929] bg-[#0b0b0b] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#f15a24]/40"
          >
            ← Back
          </button>

        </div>
      </main>
    );
  }

  const isCompleted =
    progress?.completed === true;

  // ==========================================
  // LESSON PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12">

      <div className="mx-auto max-w-4xl">

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

        {/* Lesson Content */}

        <article className="mt-7 rounded-2xl border border-[#292929] bg-[#0b0b0b]">

          <div className="p-5 sm:p-8 lg:p-10">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
              Lesson
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] text-[#f5f5f5] sm:text-4xl">
              {lesson.title}
            </h1>

            <div className="mt-7 border-t border-[#202020] pt-7">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#999] sm:text-base sm:leading-8">
                {lesson.content}
              </p>
            </div>

            {/* Complete Area */}

            <div className="mt-9 border-t border-[#202020] pt-6">

              {isCompleted ? (
                <div className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4 sm:p-5">

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/[0.1] text-sm text-green-400">
                      ✓
                    </span>

                    <div>
                      <h3 className="text-sm font-semibold text-green-400">
                        Lesson Completed
                      </h3>

                      {progress?.completedAt && (
                        <p className="mt-1 text-xs text-[#666]">
                          Completed{" "}
                          {new Date(
                            progress.completedAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <button
                  type="button"
                  onClick={markComplete}
                  disabled={completing}
                  className="rounded-lg bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {completing
                    ? "Saving..."
                    : "Mark as Complete ✓"}
                </button>
              )}

              {message &&
                !isCompleted && (
                  <p className="mt-4 text-sm text-red-400">
                    {message}
                  </p>
                )}

            </div>
          </div>
        </article>

      </div>
    </main>
  );
}