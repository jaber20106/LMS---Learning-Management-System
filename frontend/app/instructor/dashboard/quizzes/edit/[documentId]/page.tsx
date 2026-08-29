"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: number;
  documentId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
};

type Quiz = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  questions?: Question[];
};

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();

  const documentId = params?.documentId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<Question[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!documentId) return;

    loadQuiz();
  }, [documentId]);

  async function loadQuiz() {
    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1337/api/quizzes/${documentId}?populate[questions]=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      console.log("EDIT QUIZ RESPONSE:", result);

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to load quiz."
        );
        return;
      }

      const loadedQuiz = result?.data;

      if (!loadedQuiz) {
        setMessage("Quiz not found.");
        return;
      }

      setQuiz(loadedQuiz);
      setTitle(loadedQuiz.title || "");
      setDescription(
        loadedQuiz.description || ""
      );
      setQuestions(
        loadedQuiz.questions || []
      );
    } catch (error) {
      console.error(
        "LOAD EDIT QUIZ ERROR:",
        error
      );

      setMessage(
        "Something went wrong while loading the quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateQuestion(
    index: number,
    field: keyof Question,
    value: string
  ) {
    setQuestions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addQuestion() {
    const newQuestion: Question = {
      id: 0,
      documentId: "",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    };

    setQuestions((current) => [
      ...current,
      newQuestion,
    ]);
  }

  async function removeQuestion(
    index: number
  ) {
    const question = questions[index];

    if (!question.documentId) {
      setQuestions((current) =>
        current.filter(
          (_, questionIndex) =>
            questionIndex !== index
        )
      );

      return;
    }

    const confirmed = window.confirm(
      "Delete this question?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1337/api/quiz-questions/${question.documentId}`,
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
        "DELETE QUESTION:",
        result
      );

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete question."
        );
        return;
      }

      setQuestions((current) =>
        current.filter(
          (_, questionIndex) =>
            questionIndex !== index
        )
      );

      setMessage(
        "Question deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE QUESTION ERROR:",
        error
      );

      setMessage(
        "Failed to delete question."
      );
    }
  }

  function validate() {
    if (!title.trim()) {
      return "Quiz title is required.";
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
        return `Question ${
          index + 1
        }: Option A is required.`;
      }

      if (!question.optionB.trim()) {
        return `Question ${
          index + 1
        }: Option B is required.`;
      }

      if (!question.optionC.trim()) {
        return `Question ${
          index + 1
        }: Option C is required.`;
      }

      if (!question.optionD.trim()) {
        return `Question ${
          index + 1
        }: Option D is required.`;
      }
    }

    return "";
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const token = localStorage.getItem("lms_token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // =========================
      // UPDATE QUIZ
      // =========================

      const quizResponse = await fetch(
        `http://localhost:1337/api/quizzes/${documentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              title: title.trim(),
              description: description.trim(),
            },
          }),
        }
      );

      const quizResult =
        await quizResponse.json();

      console.log(
        "UPDATE QUIZ RESPONSE:",
        quizResult
      );

      if (!quizResponse.ok) {
        setMessage(
          quizResult?.error?.message ||
            "Failed to update quiz."
        );
        return;
      }

      // =========================
      // UPDATE / CREATE QUESTIONS
      // =========================

      for (const question of questions) {
        const questionData = {
          question: question.question.trim(),
          optionA: question.optionA.trim(),
          optionB: question.optionB.trim(),
          optionC: question.optionC.trim(),
          optionD: question.optionD.trim(),
          correctAnswer: question.correctAnswer,
          quiz: {
            connect: [documentId],
          },
        };

        // Existing question
        if (question.documentId) {
          const response = await fetch(
            `http://localhost:1337/api/quiz-questions/${question.documentId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: questionData,
              }),
            }
          );

          const result = await response.json();

          console.log(
            "UPDATE QUESTION:",
            result
          );

          if (!response.ok) {
            setMessage(
              result?.error?.message ||
                "Failed to update a question."
            );
            return;
          }
        } else {
          // New question
          const response = await fetch(
            "http://localhost:1337/api/quiz-questions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: questionData,
                status: "published",
              }),
            }
          );

          const result = await response.json();

          console.log(
            "CREATE NEW QUESTION:",
            result
          );

          if (!response.ok) {
            setMessage(
              result?.error?.message ||
                "Failed to create new question."
            );
            return;
          }
        }
      }

      setMessage(
        "Quiz updated successfully."
      );

      await loadQuiz();
    } catch (error) {
      console.error(
        "SAVE QUIZ ERROR:",
        error
      );

      setMessage(
        "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={mutedStyle}>
            Loading quiz...
          </p>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={messageStyle}>
            {message || "Quiz not found."}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/instructor/dashboard/quizzes/manage"
              )
            }
            style={secondaryButtonStyle}
          >
            ← Back to Quizzes
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={() =>
            router.push(
              "/instructor/dashboard/quizzes/manage"
            )
          }
          style={backButtonStyle}
        >
          ← Back to Manage Quizzes
        </button>

        <div style={headerStyle}>
          <p style={eyebrowStyle}>
            Instructor
          </p>

          <h1 style={titleStyle}>
            Edit Quiz
          </h1>

          <p style={descriptionStyle}>
            Update quiz information and questions.
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* QUIZ INFORMATION */}

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Quiz Information
            </h2>

            <div style={fieldStyle}>
              <label style={labelStyle}>
                Quiz Title
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                disabled={saving}
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                disabled={saving}
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "vertical" as const,
                  fontFamily: "inherit",
                }}
              />
            </div>
          </section>

          {/* QUESTIONS */}

          <section
            style={{
              marginTop: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={sectionTitleStyle}>
                  Questions ({questions.length})
                </h2>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                disabled={saving}
                style={addButtonStyle}
              >
                + Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div style={emptyStyle}>
                No questions yet. Click{" "}
                <strong>
                  Add Question
                </strong>{" "}
                to create one.
              </div>
            ) : (
              questions.map(
                (question, index) => (
                  <div
                    key={
                      question.documentId ||
                      `new-${index}`
                    }
                    style={cardStyle}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "15px",
                        marginBottom: "20px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                        }}
                      >
                        Question {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          removeQuestion(
                            index
                          )
                        }
                        disabled={saving}
                        style={
                          deleteButtonStyle
                        }
                      >
                        Delete
                      </button>
                    </div>

                    <div style={fieldStyle}>
                      <label style={labelStyle}>
                        Question
                      </label>

                      <textarea
                        value={
                          question.question
                        }
                        onChange={(event) =>
                          updateQuestion(
                            index,
                            "question",
                            event.target.value
                          )
                        }
                        disabled={saving}
                        rows={4}
                        style={{
                          ...inputStyle,
                          resize:
                            "vertical" as const,
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
                        gap: "15px",
                      }}
                    >
                      <div style={fieldStyle}>
                        <label
                          style={labelStyle}
                        >
                          Option A
                        </label>

                        <input
                          value={
                            question.optionA
                          }
                          onChange={(event) =>
                            updateQuestion(
                              index,
                              "optionA",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          style={inputStyle}
                        />
                      </div>

                      <div style={fieldStyle}>
                        <label
                          style={labelStyle}
                        >
                          Option B
                        </label>

                        <input
                          value={
                            question.optionB
                          }
                          onChange={(event) =>
                            updateQuestion(
                              index,
                              "optionB",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          style={inputStyle}
                        />
                      </div>

                      <div style={fieldStyle}>
                        <label
                          style={labelStyle}
                        >
                          Option C
                        </label>

                        <input
                          value={
                            question.optionC
                          }
                          onChange={(event) =>
                            updateQuestion(
                              index,
                              "optionC",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          style={inputStyle}
                        />
                      </div>

                      <div style={fieldStyle}>
                        <label
                          style={labelStyle}
                        >
                          Option D
                        </label>

                        <input
                          value={
                            question.optionD
                          }
                          onChange={(event) =>
                            updateQuestion(
                              index,
                              "optionD",
                              event.target
                                .value
                            )
                          }
                          disabled={saving}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                      }}
                    >
                      <label style={labelStyle}>
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
                        style={inputStyle}
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
              )
            )}
          </section>

          {message && (
            <div style={messageStyle}>
              {message}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "25px",
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={saveButtonStyle}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/instructor/dashboard/quizzes/manage"
                )
              }
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "55px 25px 100px",
};

const containerStyle = {
  maxWidth: "950px",
  margin: "0 auto",
};

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#aaa",
  padding: 0,
  cursor: "pointer",
  fontSize: "14px",
};

const headerStyle = {
  marginTop: "30px",
  marginBottom: "30px",
};

const eyebrowStyle = {
  color: "#888",
  margin: 0,
};

const titleStyle = {
  fontSize: "38px",
  margin: "8px 0",
};

const descriptionStyle = {
  color: "#999",
  margin: 0,
};

const cardStyle = {
  border: "1px solid #333",
  borderRadius: "12px",
  padding: "25px",
  background: "#111",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: "20px",
  fontSize: "23px",
};

const fieldStyle = {
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
  fontSize: "15px",
};

const addButtonStyle = {
  padding: "10px 15px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "8px 12px",
  borderRadius: "7px",
  border: "1px solid #633",
  background: "transparent",
  color: "#ff7777",
  cursor: "pointer",
};

const saveButtonStyle = {
  padding: "13px 20px",
  border: "none",
  borderRadius: "8px",
  background: "white",
  color: "black",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  border: "1px solid #444",
  borderRadius: "8px",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "20px",
  padding: "13px 15px",
  border: "1px solid #444",
  borderRadius: "8px",
  color: "#ccc",
};

const emptyStyle = {
  border: "1px dashed #444",
  borderRadius: "10px",
  padding: "30px",
  color: "#888",
};

const mutedStyle = {
  color: "#999",
};