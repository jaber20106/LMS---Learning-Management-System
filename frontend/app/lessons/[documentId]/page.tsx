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

type ProgressUser = {
  id: number;
};

type Progress = {
  id: number;
  documentId: string;
  completed: boolean;
  completedAt?: string | null;
  user?: ProgressUser;
};

export default function LessonDetailsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
   const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD LESSON + PROGRESS
  // =========================

  useEffect(() => {
    async function loadLesson() {
      try {
        const { documentId } = await params;

        console.log("Lesson documentId:", documentId);

        const token = localStorage.getItem("lms_token");

        if (!token) {
          setMessage("Please login first.");
          setLoading(false);
          return;
        }

        // =========================
        // 1. GET LESSON
        // =========================

        const lessonResponse = await fetch(
          `http://localhost:1337/api/lessons?filters[documentId][$eq]=${encodeURIComponent(
            documentId
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const lessonResult = await lessonResponse.json();

        console.log("Lesson API:", lessonResult);

        if (!lessonResponse.ok) {
          setMessage(
            lessonResult?.error?.message ||
              `Failed to fetch lesson. Status: ${lessonResponse.status}`
          );
          setLoading(false);
          return;
        }

        if (
          !lessonResult?.data ||
          !Array.isArray(lessonResult.data) ||
          lessonResult.data.length === 0
        ) {
          setMessage("Lesson not found.");
          setLoading(false);
          return;
        }

        const currentLesson: Lesson = lessonResult.data[0];

        setLesson(currentLesson);

        // =========================
        // 2. GET CURRENT USER
        // =========================

        const userResponse = await fetch(
          "http://localhost:1337/api/users/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const userResult = await userResponse.json();

        console.log("Current User:", userResult);

        if (!userResponse.ok) {
          setMessage(
            userResult?.error?.message ||
              "Failed to get current user."
          );
          setLoading(false);
          return;
        }

        const currentUserId = userResult.id;

        // =========================
        // 3. GET LESSON PROGRESS
        // =========================
        //
        // IMPORTANT:
        // We are NOT using:
        // filters[user][id]
        //
        // because that was causing the
        // Invalid key user / 400 error.
        //
        // Instead, get progress for this lesson
        // and populate the user relation.
        //

        const progressResponse = await fetch(
          `http://localhost:1337/api/lesson-progresses?filters[lesson][documentId][$eq]=${encodeURIComponent(
            currentLesson.documentId
          )}&populate=user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const progressResult = await progressResponse.json();

        console.log("Lesson Progress API:", progressResult);

        if (progressResponse.ok) {
  const progressList = Array.isArray(progressResult?.data)
    ? progressResult.data
    : [];

  const currentUserProgress = progressList[0] || null;

  console.log(
    "Current User Progress:",
    currentUserProgress
  );

  setProgress(currentUserProgress);
} else {
  console.error(
    "Progress API error:",
    progressResult
  );

  setProgress(null);
}
      } 
      catch (error) {
        console.error("Lesson error:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [params]);

  // =========================
  // MARK LESSON COMPLETE
  // =========================

  async function markComplete() {
    try {
      setCompleting(true);
      setMessage("");

      const token = localStorage.getItem("lms_token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      if (!lesson) {
        setMessage("Lesson not found.");
        return;
      }

      const completedAt = new Date().toISOString();

      // =========================
      // UPDATE EXISTING PROGRESS
      // =========================

      if (progress) {
        const response = await fetch(
          `http://localhost:1337/api/lesson-progresses/${progress.documentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                completed: true,
                completedAt,
              },
            }),
          }
        );

        const result = await response.json();

        console.log("Update Progress:", result);

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              "Failed to update lesson progress."
          );
        }

        setProgress(result.data);
      }

      // =========================
      // CREATE NEW PROGRESS
      // =========================

      else {
        const response = await fetch(
          "http://localhost:1337/api/lesson-progresses",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                completed: true,
                completedAt,
                lesson: lesson.documentId,
              },
            }),
          }
        );

        const result = await response.json();

        console.log("Create Progress:", result);

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              "Failed to create lesson progress."
          );
        }

        setProgress(result.data);
      }
    } catch (error) {
      console.error("Complete lesson error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to complete lesson."
      );
    } finally {
      setCompleting(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Lesson</h1>

        <p style={{ marginTop: "20px" }}>
          Loading lesson...
        </p>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (!lesson) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Lesson Access</h1>

        <p style={{ marginTop: "20px" }}>
          {message || "Lesson not found."}
        </p>

        <Link
          href="/courses"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 18px",
            border: "1px solid white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Browse Courses
        </Link>
      </main>
    );
  }

  // =========================
  // LESSON PAGE
  // =========================

  return (
    <main style={{ padding: "40px" }}>
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

      <h1>{lesson.title}</h1>

      <p
        style={{
          marginTop: "20px",
          lineHeight: "1.8",
          maxWidth: "900px",
        }}
      >
        {lesson.content}
      </p>

      <div style={{ marginTop: "40px" }}>
        {progress?.completed ? (
          <div>
            <h3>✓ Lesson Completed</h3>

            {progress.completedAt && (
              <p style={{ marginTop: "10px" }}>
                Completed at:{" "}
                {new Date(
                  progress.completedAt
                ).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={markComplete}
            disabled={completing}
            style={{
              padding: "12px 20px",
              border: "1px solid white",
              borderRadius: "6px",
              background: "transparent",
              color: "white",
              cursor: completing
                ? "not-allowed"
                : "pointer",
            }}
          >
            {completing
              ? "Saving..."
              : "Mark as Complete ✓"}
          </button>
        )}
      </div>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </main>
  );
}