"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: number;
  documentId: string;
  title: string;
};

type Question = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

const emptyQuestion: Question = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
};

export default function CreateQuizPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDocumentId, setCourseDocumentId] =
    useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<Question[]>([
    { ...emptyQuestion },
  ]);

  const [loadingCourses, setLoadingCourses] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const token =
      localStorage.getItem("lms_token");

    const role =
      localStorage.getItem("lms_role");

    if (!token) {
      setMessage("Please login first.");
      setLoadingCourses(false);
      return;
    }

    if (
  role !== "instructor" &&
  role !== "admin"
) {
  setMessage(
    "Only instructors and admins can create quizzes."
  );
  setLoadingCourses(false);
  return;
}

    try {
      const response = await fetch(
        "https://lms-learning-management-system-production-0ff5.up.railway.app/api/courses?status=draft&populate=lessons",
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

      console.log(
        "QUIZ COURSES RESPONSE:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to load courses."
        );
        return;
      }

      setCourses(result?.data || []);
    } catch (error) {
      console.error(
        "Load quiz courses error:",
        error
      );

      setMessage(
        "Something went wrong while loading courses."
      );
    } finally {
      setLoadingCourses(false);
    }
  }

  function updateQuestion(
    index: number,
    field: keyof Question,
    value: string
  ) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  }

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      { ...emptyQuestion },
    ]);
  }

  function removeQuestion(index: number) {
    if (questions.length === 1) {
      setMessage(
        "A quiz must have at least one question."
      );
      return;
    }

    setQuestions((current) =>
      current.filter(
        (_, questionIndex) =>
          questionIndex !== index
      )
    );
  }

  function validateQuiz() {
    if (!courseDocumentId) {
      return "Please select a course.";
    }

    if (!title.trim()) {
      return "Quiz title is required.";
    }

    if (!description.trim()) {
      return "Quiz description is required.";
    }

    if (questions.length === 0) {
      return "Add at least one question.";
    }

    for (
      let index = 0;
      index < questions.length;
      index++
    ) {
      const question = questions[index];

      if (!question.question.trim()) {
        return `Question ${index + 1} is required.`;
      }

      if (!question.optionA.trim()) {
        return `Question ${index + 1}: Option A is required.`;
      }

      if (!question.optionB.trim()) {
        return `Question ${index + 1}: Option B is required.`;
      }

      if (!question.optionC.trim()) {
        return `Question ${index + 1}: Option C is required.`;
      }

      if (!question.optionD.trim()) {
        return `Question ${index + 1}: Option D is required.`;
      }
    }

    return "";
  }

  async function handleCreateQuiz(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError = validateQuiz();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const token =
      localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // =========================
      // CREATE QUIZ
      // =========================

      const quizResponse = await fetch(
        "https://lms-learning-management-system-production-0ff5.up.railway.app/api/quizzes",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              title: title.trim(),
              description: description.trim(),
              course: {
                connect: [courseDocumentId],
              },
            },
            status: "published",
          }),
        }
      );

      const quizResult =
        await quizResponse.json();

      console.log(
        "CREATE QUIZ RESPONSE:",
        quizResult
      );

      if (!quizResponse.ok) {
        setMessage(
          quizResult?.error?.message ||
            "Failed to create quiz."
        );
        return;
      }

      const quizDocumentId =
        quizResult?.data?.documentId;

      if (!quizDocumentId) {
        setMessage(
          "Quiz was created but its documentId was not returned."
        );
        return;
      }

      // =========================
      // CREATE QUESTIONS
      // =========================

      for (
        let index = 0;
        index < questions.length;
        index++
      ) {
        const question = questions[index];

        const questionResponse =
          await fetch(
            "https://lms-learning-management-system-production-0ff5.up.railway.app/api/quiz-questions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  question:
                    question.question.trim(),

                  optionA:
                    question.optionA.trim(),

                  optionB:
                    question.optionB.trim(),

                  optionC:
                    question.optionC.trim(),

                  optionD:
                    question.optionD.trim(),

                  correctAnswer:
                    question.correctAnswer,

                  quiz: {
                    connect: [quizDocumentId],
                  },
                },
                status: "published",
              }),
            }
          );

        const questionResult =
          await questionResponse.json();

        console.log(
          `CREATE QUESTION ${index + 1}:`,
          questionResult
        );

        if (!questionResponse.ok) {
          setMessage(
            questionResult?.error?.message ||
              `Quiz created, but question ${
                index + 1
              } failed.`
          );
          return;
        }
      }

      setMessage(
        "Quiz created successfully."
      );

      setTitle("");
      setDescription("");
      setCourseDocumentId("");

      setQuestions([
        { ...emptyQuestion },
      ]);
    } catch (error) {
      console.error(
        "Create quiz error:",
        error
      );

      setMessage(
        "Something went wrong while creating the quiz."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 30px 100px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/instructor/dashboard"
          style={{
            color: "#aaa",
            textDecoration: "none",
          }}
        >
          ← Back to Dashboard
        </Link>

        <div
          style={{
            marginTop: "35px",
          }}
        >
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
              margin: 0,
              fontSize: "38px",
            }}
          >
            Create Quiz
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#999",
            }}
          >
            Create an MCQ quiz for one of your courses.
          </p>
        </div>

        <form
          onSubmit={handleCreateQuiz}
          style={{
            marginTop: "35px",
          }}
        >
          {/* BASIC QUIZ INFO */}

          <section
            style={{
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "28px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "24px",
              }}
            >
              Quiz Information
            </h2>

            <div
              style={{
                marginTop: "22px",
                marginBottom: "20px",
              }}
            >
              <label
                htmlFor="course"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Course
              </label>

              <select
                id="course"
                value={courseDocumentId}
                onChange={(event) =>
                  setCourseDocumentId(
                    event.target.value
                  )
                }
                disabled={
                  saving || loadingCourses
                }
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  background: "#111",
                  color: "white",
                  fontSize: "15px",
                }}
              >
                <option value="">
                  {loadingCourses
                    ? "Loading courses..."
                    : "Select a course"}
                </option>

                {courses.map((course) => (
                  <option
                    key={course.documentId}
                    value={course.documentId}
                  >
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label
                htmlFor="quiz-title"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Quiz Title
              </label>

              <input
                id="quiz-title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. React Fundamentals Quiz"
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

            <div>
              <label
                htmlFor="quiz-description"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Description
              </label>

              <textarea
                id="quiz-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what this quiz covers..."
                disabled={saving}
                required
                rows={5}
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
          </section>

          {/* QUESTIONS */}

          <section
            style={{
              marginTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "28px",
                  }}
                >
                  Questions ({questions.length})
                </h2>

                <p
                  style={{
                    color: "#888",
                    marginTop: "8px",
                  }}
                >
                  Add multiple-choice questions.
                </p>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                disabled={saving}
                style={{
                  padding: "11px 16px",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                + Add Question
              </button>
            </div>

            {questions.map(
              (question, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #333",
                    borderRadius: "12px",
                    padding: "28px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "21px",
                      }}
                    >
                      Question {index + 1}
                    </h3>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeQuestion(index)
                        }
                        disabled={saving}
                        style={{
                          padding:
                            "8px 12px",
                          border:
                            "1px solid #633",
                          borderRadius:
                            "7px",
                          background:
                            "transparent",
                          color: "#ff7777",
                          cursor:
                            "pointer",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Question
                    </label>

                    <textarea
                      value={question.question}
                      onChange={(event) =>
                        updateQuestion(
                          index,
                          "question",
                          event.target.value
                        )
                      }
                      placeholder="Enter the question..."
                      disabled={saving}
                      required
                      rows={4}
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                        padding: "13px",
                        borderRadius:
                          "8px",
                        border:
                          "1px solid #444",
                        background:
                          "#111",
                        color: "white",
                        resize:
                          "vertical",
                        fontFamily:
                          "inherit",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    {(
                      [
                        ["optionA", "Option A"],
                        ["optionB", "Option B"],
                        ["optionC", "Option C"],
                        ["optionD", "Option D"],
                      ] as const
                    ).map(
                      ([field, label]) => (
                        <div key={field}>
                          <label
                            style={{
                              display:
                                "block",
                              marginBottom:
                                "8px",
                              fontWeight:
                                "600",
                            }}
                          >
                            {label}
                          </label>

                          <input
                            value={
                              question[field]
                            }
                            onChange={(
                              event
                            ) =>
                              updateQuestion(
                                index,
                                field,
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder={`Enter ${label}`}
                            disabled={
                              saving
                            }
                            required
                            style={{
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                              padding:
                                "13px",
                              borderRadius:
                                "8px",
                              border:
                                "1px solid #444",
                              background:
                                "#111",
                              color:
                                "white",
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Correct Answer
                    </label>

                    <select
                      value={
                        question.correctAnswer
                      }
                      onChange={(event) =>
                        updateQuestion(
                          index,
                          "correctAnswer",
                          event.target.value
                        )
                      }
                      disabled={saving}
                      style={{
                        width: "100%",
                        padding: "13px",
                        borderRadius: "8px",
                        border:
                          "1px solid #444",
                        background: "#111",
                        color: "white",
                      }}
                    >
                      <option value="A">
                        Option A
                      </option>

                      <option value="B">
                        Option B
                      </option>

                      <option value="C">
                        Option C
                      </option>

                      <option value="D">
                        Option D
                      </option>
                    </select>
                  </div>
                </div>
              )
            )}
          </section>

          {/* MESSAGE */}

          {message && (
            <div
              style={{
                marginTop: "25px",
                padding: "14px 16px",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#ccc",
              }}
            >
              {message}
            </div>
          )}

          {/* SUBMIT */}

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "13px 22px",
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
                ? "Creating Quiz..."
                : "Create Quiz"}
            </button>

            <Link
              href="/instructor/dashboard"
              style={{
                padding: "12px 18px",
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