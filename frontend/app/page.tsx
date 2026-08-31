"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Enrollment = {
  id: number;
  documentId: string;
  course?: {
    id: number;
    documentId: string;
    title: string;
    description: string;
  } | null;
};

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasCourses, setHasCourses] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const token = localStorage.getItem("lms_token");

      if (!token) {
        setLoggedIn(false);
        setHasCourses(false);
        setLoading(false);
        return;
      }

      setLoggedIn(true);

      try {
        const response = await fetch(
          "https://lms-learning-management-system-production-0ff5.up.railway.app/api/enrollments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          localStorage.removeItem("lms_token");
          setLoggedIn(false);
          setHasCourses(false);
          return;
        }

        const result = await response.json();

        const enrollments: Enrollment[] =
          result.data || [];

        setHasCourses(enrollments.length > 0);
      } catch (error) {
        console.error(
          "Failed to check enrollment:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-[#f5f5f5]">

      {/* ============================= */}
      {/* BACKGROUND */}
      {/* ============================= */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-280px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-[#f15a24]/[0.08] blur-[140px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-[#f15a24]/[0.035] blur-[120px]" />
      </div>

      {/* ============================= */}
      {/* HERO */}
      {/* ============================= */}

      <section className="relative px-5 pb-20 pt-24 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-5xl text-center">

            <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-[#f5f5f5] sm:text-6xl md:text-7xl lg:text-8xl">
              Build skills.
              <br />

              <span className="text-[#f15a24]">
                Build your future.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-[#a1a1a1] sm:text-lg sm:leading-8">
              Learn practical skills through
              structured courses, hands-on lessons,
              and interactive quizzes designed to
              help you move forward.
            </p>

            {/* ============================= */}
            {/* CTA */}
            {/* ============================= */}

            {!loading && !loggedIn && (
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/courses"
                  className="group flex min-w-[180px] items-center justify-center rounded-xl bg-[#f15a24] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#f15a24]/10 transition-all duration-200 hover:-translate-y-1 hover:bg-[#d94b1f] hover:shadow-[#f15a24]/20"
                >
                  Explore Courses

                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/register"
                  className="flex min-w-[180px] items-center justify-center rounded-xl border border-[#292929] bg-[#0b0b0b] px-7 py-4 text-sm font-semibold text-[#f5f5f5] transition-all duration-200 hover:-translate-y-1 hover:border-[#f15a24]/50 hover:bg-[#f15a24]/[0.06]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {!loading &&
              loggedIn &&
              !hasCourses && (
                <div className="mt-10">
                  <Link
                    href="/courses"
                    className="group inline-flex min-w-[190px] items-center justify-center rounded-xl bg-[#f15a24] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#f15a24]/10 transition-all duration-200 hover:-translate-y-1 hover:bg-[#d94b1f]"
                  >
                    Explore Courses

                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              )}

            {!loading &&
              loggedIn &&
              hasCourses && (
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/my-courses"
                    className="group flex min-w-[200px] items-center justify-center rounded-xl bg-[#f15a24] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#f15a24]/10 transition-all duration-200 hover:-translate-y-1 hover:bg-[#d94b1f]"
                  >
                    Continue Learning

                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/courses"
                    className="flex min-w-[180px] items-center justify-center rounded-xl border border-[#292929] bg-[#0b0b0b] px-7 py-4 text-sm font-semibold text-[#f5f5f5] transition-all duration-200 hover:-translate-y-1 hover:border-[#f15a24]/50 hover:bg-[#f15a24]/[0.06]"
                  >
                    Browse Courses
                  </Link>
                </div>
              )}
          </div>

          {/* ============================= */}
          {/* FEATURE STRIP */}
          {/* ============================= */}

          <div className="mx-auto mt-24 grid max-w-6xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#292929] bg-[#292929] sm:grid-cols-3">

            <div className="bg-[#0b0b0b] p-7 sm:p-8">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.08] text-xl text-[#f15a24]">
                ◈
              </div>

              <h3 className="text-lg font-semibold text-[#f5f5f5]">
                Structured Learning
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#777]">
                Follow organized courses and lessons
                designed to make learning simple.
              </p>
            </div>

            <div className="bg-[#0b0b0b] p-7 sm:p-8">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.08] text-xl text-[#f15a24]">
                ✓
              </div>

              <h3 className="text-lg font-semibold text-[#f5f5f5]">
                Practice Your Skills
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#777]">
                Test what you learn with practical
                lessons and interactive quizzes.
              </p>
            </div>

            <div className="bg-[#0b0b0b] p-7 sm:p-8">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.08] text-xl text-[#f15a24]">
                ↗
              </div>

              <h3 className="text-lg font-semibold text-[#f5f5f5]">
                Keep Growing
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#777]">
                Keep learning, complete lessons, and
                build confidence step by step.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* LEARNING SECTION */}
      {/* ============================= */}

      <section className="border-t border-[#1c1c1c] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">

            {/* Left */}

            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#f15a24]">
                Your learning journey
              </p>

              <h2 className="max-w-xl text-4xl font-bold tracking-[-0.03em] text-[#f5f5f5] sm:text-5xl">
                Learn at your pace.
                <br />

                <span className="text-[#f15a24]">
                  Grow with purpose.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#777]">
                Start with a course, work through
                practical lessons, test your knowledge,
                and keep moving forward.
              </p>

              <Link
                href="/courses"
                className="mt-8 inline-flex items-center rounded-xl border border-[#292929] bg-[#0b0b0b] px-6 py-3.5 text-sm font-semibold text-[#f5f5f5] transition hover:border-[#f15a24]/50 hover:bg-[#f15a24]/[0.06]"
              >
                View all courses

                <span className="ml-2 text-[#f15a24]">
                  →
                </span>
              </Link>
            </div>

            {/* Right */}

            <div className="space-y-3">

              <div className="group rounded-2xl border border-[#292929] bg-[#0b0b0b] p-6 transition hover:border-[#f15a24]/30 hover:bg-[#f15a24]/[0.035]">
                <div className="flex items-start gap-5">
                  <span className="text-sm text-[#f15a24]">
                    01
                  </span>

                  <div>
                    <h3 className="font-semibold text-[#f5f5f5]">
                      Choose a course
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#777]">
                      Find a course that matches
                      what you want to learn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-[#292929] bg-[#0b0b0b] p-6 transition hover:border-[#f15a24]/30 hover:bg-[#f15a24]/[0.035]">
                <div className="flex items-start gap-5">
                  <span className="text-sm text-[#f15a24]">
                    02
                  </span>

                  <div>
                    <h3 className="font-semibold text-[#f5f5f5]">
                      Complete the lessons
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#777]">
                      Learn step by step with
                      structured lessons.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-[#292929] bg-[#0b0b0b] p-6 transition hover:border-[#f15a24]/30 hover:bg-[#f15a24]/[0.035]">
                <div className="flex items-start gap-5">
                  <span className="text-sm text-[#f15a24]">
                    03
                  </span>

                  <div>
                    <h3 className="font-semibold text-[#f5f5f5]">
                      Practice with quizzes
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#777]">
                      Check your understanding and
                      reinforce what you learned.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* FINAL CTA */}
      {/* ============================= */}

      <section className="px-5 pb-12 sm:px-8 lg:px-12 lg:pb-16">
        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-3xl border border-[#292929] bg-[#0b0b0b] px-6 py-16 text-center sm:px-12 sm:py-20">

            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-[#f15a24]/[0.07] blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f15a24]">
                Start today
              </p>

              <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-[-0.03em] text-[#f5f5f5] sm:text-5xl">
                Ready to start learning?
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#777] sm:text-base">
                Explore the available courses and
                take the next step in your learning
                journey.
              </p>

              <Link
                href="/courses"
                className="mt-8 inline-flex items-center rounded-xl bg-[#f15a24] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#f15a24]/10 transition hover:-translate-y-1 hover:bg-[#d94b1f]"
              >
                Explore Courses

                <span className="ml-2">
                  →
                </span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}