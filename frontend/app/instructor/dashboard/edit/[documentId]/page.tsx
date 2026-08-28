"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();

  const documentId = params?.documentId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const token = localStorage.getItem("lms_token");

      if (!token) {
        setMessage("Please login as an instructor first.");
        setLoading(false);
        return;
      }

      if (!documentId) {
        setMessage("Course ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:1337/api/courses/${documentId}`,
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

        console.log("EDIT COURSE RESPONSE:", result);

        if (!response.ok) {
          setMessage(
            result?.error?.message ||
              "Failed to load course."
          );
          setLoading(false);
          return;
        }

        const course: Course = result?.data;

        if (!course) {
          setMessage("Course was not found.");
          setLoading(false);
          return;
        }

        setTitle(course.title || "");
        setDescription(course.description || "");
      } catch (error) {
        console.error(
          "Load course error:",
          error
        );

        setMessage(
          "Something went wrong while loading the course."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [documentId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login as an instructor first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Course title is required.");
      return;
    }

    if (!description.trim()) {
      setMessage("Course description is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:1337/api/courses/${documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              title: title.trim(),
              description: description.trim(),
            },
          }),
        }
      );

      const result = await response.json();

      console.log("UPDATE COURSE RESPONSE:", result);

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to update course."
        );
        return;
      }

      setMessage("Course updated successfully.");

      setTimeout(() => {
        router.push("/instructor/dashboard");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Update course error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          padding: "60px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          <p style={{ color: "#aaa" }}>
            Loading course...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "60px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/instructor/dashboard"
          style={{
            color: "#aaa",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Back to Dashboard
        </Link>

        <div style={{ marginTop: "35px" }}>
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
              fontSize: "38px",
              margin: 0,
            }}
          >
            Edit Course
          </h1>

          <p
            style={{
              color: "#999",
              marginTop: "10px",
            }}
          >
            Update your course information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "35px",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="title"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Course Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Course title"
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

          {/* Description */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="description"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Course Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Course description"
              disabled={saving}
              required
              rows={7}
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

          {/* Message */}
          {message && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #333",
                color: "#ccc",
              }}
            >
              {message}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
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
                : "Save Changes"}
            </button>

            <Link
              href="/instructor/dashboard"
              style={{
                padding: "11px 18px",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "white",
                textDecoration: "none",
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}