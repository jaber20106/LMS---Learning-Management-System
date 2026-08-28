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
          "http://localhost:1337/api/enrollments",
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
    <main
      style={{
        minHeight: "100vh",
        padding: "30px 40px",
      }}
    >
      {/* Hero */}
      <section
        style={{
          maxWidth: "900px",
          margin: "120px auto 0",
          textAlign: "center",
        }}
      >
        {!loading && loggedIn && (
          <p
            style={{
              marginBottom: "20px",
              color: "#aaa",
            }}
          >
            Welcome back 👋
          </p>
        )}

        <h1
          style={{
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          Learn. Practice. Grow.
        </h1>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
            color: "#aaa",
          }}
        >
          Learn new skills with structured courses and
          practical lessons.
        </p>

        {/* Logged out */}
        {!loading && !loggedIn && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <Link
              href="/courses"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: "8px",
                background: "white",
                color: "black",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Browse Courses
            </Link>

            <Link
              href="/register"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid #555",
                color: "white",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Logged in but no enrollment */}
        {!loading && loggedIn && !hasCourses && (
          <Link
            href="/courses"
            style={{
              display: "inline-block",
              marginTop: "30px",
              padding: "12px 24px",
              borderRadius: "8px",
              background: "white",
              color: "black",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Browse Courses
          </Link>
        )}

        {/* Logged in and enrolled */}
        {!loading && loggedIn && hasCourses && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <Link
              href="/my-courses"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: "8px",
                background: "white",
                color: "black",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Continue Learning →
            </Link>

            <Link
              href="/courses"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid #555",
                color: "white",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Browse Courses
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}