"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  username?: string;
  email?: string;
  role?: {
    name?: string;
    type?: string;
  };
};

type Course = {
  id: number;
  documentId: string;
  title: string;
  description?: string;
};

type Lesson = {
  id: number;
  documentId: string;
  title: string;
};

type Quiz = {
  id: number;
  documentId: string;
  title: string;
  description?: string;
};

const API_URL = "http://localhost:1337";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("lms_token");
    const role = localStorage.getItem("lms_role");

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    if (role !== "admin") {
      setMessage("Access denied. Admin only.");
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        usersResponse,
        coursesResponse,
        lessonsResponse,
        quizzesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/users`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/courses?populate=*`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/lessons?populate=*`, {
          headers,
          cache: "no-store",
        }),

        fetch(`${API_URL}/api/quizzes?populate=*`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }

      if (!coursesResponse.ok) {
        throw new Error("Failed to fetch courses");
      }

      if (!lessonsResponse.ok) {
        throw new Error("Failed to fetch lessons");
      }

      if (!quizzesResponse.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const usersData = await usersResponse.json();
      const coursesData = await coursesResponse.json();
      const lessonsData = await lessonsResponse.json();
      const quizzesData = await quizzesResponse.json();

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : []
      );

      setCourses(
        coursesData?.data || []
      );

      setLessons(
        lessonsData?.data || []
      );

      setQuizzes(
        quizzesData?.data || []
      );
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      setMessage(
        "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(
    documentId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/courses/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete course."
        );
        return;
      }

      setCourses((current) =>
        current.filter(
          (course) =>
            course.documentId !==
            documentId
        )
      );

      setMessage(
        "Course deleted successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Something went wrong."
      );
    }
  }

  async function deleteLesson(
    documentId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) return;

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/lessons/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete lesson."
        );
        return;
      }

      setLessons((current) =>
        current.filter(
          (lesson) =>
            lesson.documentId !==
            documentId
        )
      );

      setMessage(
        "Lesson deleted successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Something went wrong."
      );
    }
  }

  async function deleteQuiz(
    documentId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/quizzes/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

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
            quiz.documentId !==
            documentId
        )
      );

      setMessage(
        "Quiz deleted successfully."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Something went wrong."
      );
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <p>
            Loading admin dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (
    message ===
    "Access denied. Admin only."
  ) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h1>Access Denied</h1>

          <p
            style={{
              color: "#aaa",
              marginTop: "10px",
            }}
          >
            Only administrators can
            access this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "10px",
          }}
        >
          <div>
            <p
              style={{
                color: "#aaa",
                marginBottom: "8px",
              }}
            >
              Administration
            </p>

            <h1
              style={{
                fontSize: "42px",
                margin: 0,
              }}
            >
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={loadDashboard}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border:
                "1px solid #444",
              background:
                "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        <p
          style={{
            color: "#aaa",
            marginBottom: "40px",
          }}
        >
          Manage users, courses,
          lessons and quizzes.
        </p>

        {message &&
          message !==
            "Access denied. Admin only." && (
            <div
              style={{
                marginBottom: "25px",
                padding: "14px",
                border:
                  "1px solid #333",
                borderRadius: "8px",
              }}
            >
              {message}
            </div>
          )}

        {/* STATISTICS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "45px",
          }}
        >
          <StatCard
            title="Total Users"
            value={users.length}
          />

          <StatCard
            title="Total Courses"
            value={courses.length}
          />

          <StatCard
            title="Total Lessons"
            value={lessons.length}
          />

          <StatCard
            title="Total Quizzes"
            value={quizzes.length}
          />
        </div>

        {/* COURSES */}

        <section
          style={{
            marginBottom: "50px",
          }}
        >
          <SectionHeader
            title="Courses"
          />

          {courses.length === 0 ? (
            <EmptyState text="No courses found." />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {courses.map(
                (course) => (
                  <div
                    key={
                      course.documentId
                    }
                    style={{
                      border:
                        "1px solid #333",
                      borderRadius:
                        "12px",
                      padding: "22px",
                      background:
                        "#111",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "22px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {course.title}
                    </h3>

                    <p
                      style={{
                        color: "#aaa",
                        lineHeight:
                          "1.5",
                        minHeight:
                          "45px",
                      }}
                    >
                      {course.description ||
                        "No description available."}
                    </p>

                    <button
                      onClick={() =>
                        deleteCourse(
                          course.documentId
                        )
                      }
                      style={deleteButtonStyle}
                    >
                      Delete Course
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* LESSONS */}

        <section
          style={{
            marginBottom: "50px",
          }}
        >
          <SectionHeader
            title="Lessons"
          />

          {lessons.length === 0 ? (
            <EmptyState text="No lessons found." />
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {lessons.map(
                (lesson, index) => (
                  <div
                    key={
                      lesson.documentId
                    }
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "20px",
                      border:
                        "1px solid #333",
                      borderRadius:
                        "10px",
                      padding:
                        "18px 20px",
                      background:
                        "#111",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "#777",
                          fontSize:
                            "14px",
                          marginBottom:
                            "5px",
                        }}
                      >
                        Lesson{" "}
                        {index + 1}
                      </p>

                      <h3
                        style={{
                          margin: 0,
                          fontSize:
                            "18px",
                        }}
                      >
                        {lesson.title}
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        deleteLesson(
                          lesson.documentId
                        )
                      }
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* QUIZZES */}

        <section
          style={{
            marginBottom: "50px",
          }}
        >
          <SectionHeader
            title="Quizzes"
            buttonText="Create Quiz"
            onButtonClick={() => {
              window.location.href =
                "/instructor/dashboard/quizzes";
            }}
          />

          {quizzes.length === 0 ? (
            <EmptyState text="No quizzes found." />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {quizzes.map(
                (quiz) => (
                  <div
                    key={
                      quiz.documentId
                    }
                    style={{
                      border:
                        "1px solid #333",
                      borderRadius:
                        "12px",
                      padding: "22px",
                      background:
                        "#111",
                    }}
                  >
                    <p
                      style={{
                        color: "#777",
                        fontSize:
                          "14px",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Quiz
                    </p>

                    <h3
                      style={{
                        fontSize: "22px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {quiz.title}
                    </h3>

                    <p
                      style={{
                        color: "#aaa",
                        lineHeight:
                          "1.5",
                        minHeight:
                          "45px",
                      }}
                    >
                      {quiz.description ||
                        "No description available."}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "18px",
                      }}
                    >
                      <button
                        onClick={() =>
                          window.location.href =
                            `/instructor/dashboard/quizzes/edit/${quiz.documentId}`
                        }
                        style={{
                          padding:
                            "9px 15px",
                          borderRadius:
                            "7px",
                          border:
                            "1px solid #444",
                          background:
                            "transparent",
                          color:
                            "white",
                          cursor:
                            "pointer",
                        }}
                      >
                        Edit Quiz
                      </button>

                      <button
                        onClick={() =>
                          window.location.href =
                            `/quizzes/${quiz.documentId}`
                        }
                        style={{
                          padding:
                            "9px 15px",
                          borderRadius:
                            "7px",
                          border:
                            "1px solid #444",
                          background:
                            "transparent",
                          color:
                            "#aaa",
                          cursor:
                            "pointer",
                        }}
                      >
                        View Quiz
                      </button>

                      <button
                        onClick={() =>
                          deleteQuiz(
                            quiz.documentId
                          )
                        }
                        style={
                          deleteButtonStyle
                        }
                      >
                        Delete Quiz
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "24px",
        background: "#111",
      }}
    >
      <p
        style={{
          color: "#888",
          marginBottom: "12px",
        }}
      >
        {title}
      </p>

      <strong
        style={{
          fontSize: "32px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function SectionHeader({
  title,
  buttonText,
  onButtonClick,
}: {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: "20px",
        gap: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          margin: 0,
        }}
      >
        {title}
      </h2>

      {buttonText &&
        onButtonClick && (
          <button
            onClick={onButtonClick}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "white",
              color: "black",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + {buttonText}
          </button>
        )}
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        border:
          "1px dashed #444",
        borderRadius: "10px",
        padding: "30px",
        color: "#888",
      }}
    >
      {text}
    </div>
  );
}

const deleteButtonStyle = {
  marginTop: "18px",
  padding: "9px 15px",
  borderRadius: "7px",
  border: "1px solid #733",
  background: "transparent",
  color: "#ff7777",
  cursor: "pointer",
};