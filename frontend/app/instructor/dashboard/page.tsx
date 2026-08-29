"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Role = {
  id: number;
  name: string;
  type?: string;
};

type User = {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: Role | null;
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
};

type CourseResponse = {
  data: Course[];
};

export default function InstructorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("lms_token");

    console.log("========== INSTRUCTOR DASHBOARD ==========");
    console.log("TOKEN EXISTS:", !!token);

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    try {
      // -----------------------------------
      // Get logged-in user
      // -----------------------------------

      const userResponse = await fetch(
        "http://localhost:1337/api/users/me?populate=*",
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

      console.log("USER STATUS:", userResponse.status);
      console.log("USER RESPONSE:", userResult);
      console.log("USER ROLE:", userResult?.role);
      console.log("USER ROLE NAME:", userResult?.role?.name);

      if (!userResponse.ok) {
        setMessage(
          userResult?.error?.message ||
            "Could not load user information."
        );
        setLoading(false);
        return;
      }

      setUser(userResult);

      // -----------------------------------
      // Load courses
      // -----------------------------------

      const courseResponse = await fetch(
        "http://localhost:1337/api/courses?populate=lessons",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const courseResult: CourseResponse | {
        error?: {
          message?: string;
        };
      } = await courseResponse.json();

      console.log(
        "COURSE STATUS:",
        courseResponse.status
      );

      console.log(
        "COURSE RESPONSE:",
        courseResult
      );

      if (!courseResponse.ok) {
        setMessage(
          "error" in courseResult
            ? courseResult.error?.message ||
                "Failed to load courses."
            : "Failed to load courses."
        );

        setLoading(false);
        return;
      }

      if (!("data" in courseResult)) {
        setMessage("Invalid course response.");
        setLoading(false);
        return;
      }

      setCourses(courseResult.data || []);
    } catch (error) {
      console.error(
        "Instructor dashboard error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------
  // Delete Course
  // -----------------------------------

  async function handleDeleteCourse(
    documentId: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
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
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:1337/api/courses/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log(
        "DELETE COURSE STATUS:",
        response.status
      );

      console.log(
        "DELETE COURSE RESPONSE:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete course."
        );
        return;
      }

      // Remove deleted course immediately
      setCourses((currentCourses) =>
        currentCourses.filter(
          (course) =>
            course.documentId !== documentId
        )
      );

      setMessage(
        "Course deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete course error:",
        error
      );

      setMessage(
        "Something went wrong while deleting the course."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // -----------------------------------
  // Loading
  // -----------------------------------

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "50px 30px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#999",
            }}
          >
            Loading instructor dashboard...
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------------
  // Dashboard
  // -----------------------------------

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 30px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "30px",
            marginBottom: "45px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#888",
                fontSize: "14px",
              }}
            >
              Instructor Dashboard
            </p>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "38px",
                lineHeight: "1.2",
              }}
            >
              Welcome, {user?.username || "Instructor"}
            </h1>

            <p
              style={{
                marginTop: "12px",
                color: "#aaa",
                fontSize: "16px",
              }}
            >
              Manage your courses and lessons from here.
            </p>
          </div>

          <Link
            href="/instructor/dashboard/create-course"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 18px",
              borderRadius: "8px",
              background: "white",
              color: "black",
              textDecoration: "none",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            + Create Course
          </Link>
          <Link
  href="/instructor/dashboard/quizzes"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "1px solid #444",
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    whiteSpace: "nowrap",
  }}
>
  Quizzes
</Link>
<Link
  href="/instructor/dashboard/quizzes/manage"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "1px solid #444",
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    whiteSpace: "nowrap",
  }}
>
  Manage Quizzes
</Link>
        </div>

        {/* Message */}

        {message && (
          <div
            style={{
              marginBottom: "30px",
              padding: "16px 18px",
              border: "1px solid #444",
              borderRadius: "10px",
              color: "#ddd",
            }}
          >
            {message}
          </div>
        )}

        {/* Stats */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "45px",
          }}
        >
          <div
            style={{
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "22px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#888",
                fontSize: "14px",
              }}
            >
              Total Courses
            </p>

            <h2
              style={{
                margin: "10px 0 0",
                fontSize: "32px",
              }}
            >
              {courses.length}
            </h2>
          </div>

          <div
            style={{
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "22px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#888",
                fontSize: "14px",
              }}
            >
              Account
            </p>

            <h2
              style={{
                margin: "10px 0 0",
                fontSize: "22px",
              }}
            >
              Instructor
            </h2>
          </div>

          <div
            style={{
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "22px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#888",
                fontSize: "14px",
              }}
            >
              Email
            </p>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: "15px",
                wordBreak: "break-word",
              }}
            >
              {user?.email || "—"}
            </p>
          </div>
        </div>

        {/* Courses Section */}

        <section>
          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
              }}
            >
              My Courses
            </h2>

            <p
              style={{
                marginTop: "8px",
                color: "#888",
              }}
            >
              Courses available in your account.
            </p>
          </div>

          {courses.length === 0 ? (
            <div
              style={{
                border: "1px dashed #444",
                borderRadius: "12px",
                padding: "55px 30px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                No courses yet
              </h3>

              <p
                style={{
                  marginTop: "10px",
                  color: "#888",
                }}
              >
                Create your first course to start teaching.
              </p>

              <Link
                href="/instructor/dashboard/create-course"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  padding: "11px 18px",
                  borderRadius: "8px",
                  background: "white",
                  color: "black",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {courses.map((course) => (
                <article
                  key={course.documentId}
                  style={{
                    border: "1px solid #333",
                    borderRadius: "12px",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "21px",
                    }}
                  >
                    {course.title}
                  </h3>

                  <p
                    style={{
                      marginTop: "12px",
                      color: "#aaa",
                      lineHeight: "1.6",
                    }}
                  >
                    {course.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "22px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href={`/courses/${course.documentId}`}
                      style={{
                        padding: "10px 15px",
                        border: "1px solid #444",
                        borderRadius: "7px",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      View
                    </Link>
                    <Link
  href={`/instructor/dashboard/lessons/${course.documentId}`}
  style={{
    padding: "10px 15px",
    border: "1px solid #444",
    borderRadius: "7px",
    color: "inherit",
    textDecoration: "none",
  }}
>
  Lessons
</Link>

                    <Link
                      href={`/instructor/dashboard/edit/${course.documentId}`}
                      style={{
                        padding: "10px 15px",
                        borderRadius: "7px",
                        background: "white",
                        color: "black",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCourse(
                          course.documentId,
                          course.title
                        )
                      }
                      disabled={
                        deletingId ===
                        course.documentId
                      }
                      style={{
                        padding: "10px 15px",
                        borderRadius: "7px",
                        border: "1px solid #663333",
                        background: "transparent",
                        color: "#ff8a8a",
                        cursor:
                          deletingId ===
                          course.documentId
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          deletingId ===
                          course.documentId
                            ? 0.6
                            : 1,
                      }}
                    >
                      {deletingId ===
                      course.documentId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}