"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage(
        "Please login as an instructor first."
      );
      return;
    }

    if (!title.trim()) {
      setMessage(
        "Course title is required."
      );
      return;
    }

    if (!description.trim()) {
      setMessage(
        "Course description is required."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://lms-learning-management-system-production-0ff5.up.railway.app/api/courses",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              title: title.trim(),
              description:
                description.trim(),
            },
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "CREATE COURSE RESPONSE:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to create course."
        );
        return;
      }

      setMessage(
        "Course created successfully."
      );

      setTitle("");
      setDescription("");

      setTimeout(() => {
        router.push(
          "/instructor/dashboard"
        );
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Create course error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12">

      <div className="mx-auto max-w-3xl">

        {/* Back */}

        <Link
          href="/instructor/dashboard"
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back to Dashboard
        </Link>

        {/* Header */}

        <div className="mt-8 border-b border-[#202020] pb-6">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
            Instructor
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Create Course
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
            Create a new course for your
            students.
          </p>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:p-7"
        >

          {/* Title */}

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-[#ddd]"
            >
              Course Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. Advanced React"
              disabled={loading}
              required
              className="w-full rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/60 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Description */}

          <div className="mt-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[#ddd]"
            >
              Course Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe what students will learn..."
              disabled={loading}
              required
              rows={7}
              className="w-full resize-y rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/60 focus:ring-1 focus:ring-[#f15a24]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Message */}

          {message && (
            <div className="mt-5 rounded-xl border border-[#292929] bg-[#070707] px-4 py-3 text-sm leading-6 text-[#aaa]">
              {message}
            </div>
          )}

          {/* Actions */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

            <Link
              href="/instructor/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[#292929] bg-[#070707] px-5 py-3 text-sm font-medium text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Course"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}