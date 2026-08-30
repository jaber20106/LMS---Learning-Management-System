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

  const [questions, setQuestions] = useState<Question[]>([]);

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
        `https://lms-learning-management-system-syom.onrender.com/api/quizzes/${documentId}?populate[questions]=true`,
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
          result?.error?.message || "Failed to load quiz."
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
      setDescription(loadedQuiz.description || "");
      setQuestions(loadedQuiz.questions || []);
    } catch (error) {
      console.error("LOAD EDIT QUIZ ERROR:", error);

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

  async function removeQuestion(index: number) {
    const question = questions[index];

    if (!question.documentId) {
      setQuestions((current) =>
        current.filter(
          (_, questionIndex) => questionIndex !== index
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
        `https://lms-learning-management-system-syom.onrender.com/api/quiz-questions/${question.documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("DELETE QUESTION:", result);

      if (!response.ok) {
        setMessage(
          result?.error?.message ||
            "Failed to delete question."
        );
        return;
      }

      setQuestions((current) =>
        current.filter(
          (_, questionIndex) => questionIndex !== index
        )
      );

      setMessage("Question deleted successfully.");
    } catch (error) {
      console.error("DELETE QUESTION ERROR:", error);

      setMessage("Failed to delete question.");
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
        `https://lms-learning-management-system-syom.onrender.com/api/quizzes/${documentId}`,
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

      const quizResult = await quizResponse.json();

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
            `https://lms-learning-management-system-syom.onrender.com/api/quiz-questions/${question.documentId}`,
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
            "https://lms-learning-management-system-syom.onrender.com/api/quiz-questions",
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

      setMessage("Quiz updated successfully.");

      await loadQuiz();
    } catch (error) {
      console.error("SAVE QUIZ ERROR:", error);

      setMessage(
        "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl animate-pulse">

          <div className="h-4 w-36 rounded bg-white/[0.06]" />

          <div className="mt-7 h-10 w-60 max-w-full rounded bg-white/[0.06]" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.04]" />

          <div className="mt-8 h-64 rounded-2xl bg-white/[0.04]" />

        </div>
      </main>
    );
  }

  // ==========================================
  // QUIZ NOT FOUND
  // ==========================================

  if (!quiz) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-6 sm:p-8">

            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-sm text-red-300">
              {message || "Quiz not found."}
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/instructor/dashboard/quizzes/manage"
                )
              }
              className="mt-5 rounded-lg border border-[#303030] px-4 py-2.5 text-sm text-[#aaa] transition hover:border-[#f15a24]/40 hover:text-white"
            >
              ← Back to Quizzes
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-7 pb-20 text-white sm:px-8 sm:py-10 lg:px-12">

      <div className="mx-auto max-w-4xl">

        {/* =====================================
            BACK
        ===================================== */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/instructor/dashboard/quizzes/manage"
            )
          }
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back to Manage Quizzes
        </button>

        {/* =====================================
            HEADER
        ===================================== */}

        <header className="mt-7">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#f15a24]/20 bg-[#f15a24]/[0.06] px-3 py-1.5">

            <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
              Instructor
            </span>

          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Edit Quiz
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#777] sm:text-base">
            Update quiz information and manage
            its questions.
          </p>

        </header>

        <form
          onSubmit={handleSave}
          className="mt-8"
        >

          {/* ===================================
              QUIZ INFORMATION
          =================================== */}

          <section className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:p-7">

            <div className="border-b border-[#202020] pb-5">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                Details
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Quiz Information
              </h2>

            </div>

            <div className="mt-6 space-y-5">

              {/* Title */}

              <div>

                <label
                  htmlFor="quiz-title"
                  className="mb-2 block text-sm font-medium text-[#ddd]"
                >
                  Quiz Title
                </label>

                <input
                  id="quiz-title"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

              {/* Description */}

              <div>

                <label
                  htmlFor="quiz-description"
                  className="mb-2 block text-sm font-medium text-[#ddd]"
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
                  disabled={saving}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-[#303030] bg-[#070707] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

            </div>

          </section>

          {/* ===================================
              QUESTIONS
          =================================== */}

          <section className="mt-7">

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f15a24]">
                  Assessment
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Questions
                  <span className="ml-2 text-sm font-normal text-[#555]">
                    ({questions.length})
                  </span>
                </h2>

              </div>

              <button
                type="button"
                onClick={addQuestion}
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-xl border border-[#303030] bg-[#0b0b0b] px-4 py-3 text-sm font-medium text-[#ccc] transition hover:border-[#f15a24]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                + Add Question
              </button>

            </div>

            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-5 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-[#f15a24]">
                  ?
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  No questions yet
                </h3>

                <p className="mt-2 text-sm text-[#666]">
                  Add a question to start
                  building this quiz.
                </p>

              </div>
            ) : (
              <div className="space-y-5">

                {questions.map(
                  (question, index) => (
                    <article
                      key={
                        question.documentId ||
                        `new-${index}`
                      }
                      className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:p-7"
                    >

                      {/* Question Header */}

                      <div className="flex items-center justify-between gap-4 border-b border-[#202020] pb-5">

                        <div className="flex items-center gap-3">

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-xs font-semibold text-[#f15a24]">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666]">
                              Question
                            </p>

                            <h3 className="mt-0.5 text-base font-semibold">
                              Question{" "}
                              {index + 1}
                            </h3>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              index
                            )
                          }
                          disabled={saving}
                          className="shrink-0 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>

                      </div>

                      {/* Question Text */}

                      <div className="mt-6">

                        <label
                          htmlFor={`question-${index}`}
                          className="mb-2 block text-sm font-medium text-[#ddd]"
                        >
                          Question Text
                        </label>

                        <textarea
                          id={`question-${index}`}
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
                          placeholder="Write your question..."
                          className="w-full resize-y rounded-xl border border-[#303030] bg-[#070707] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                      </div>

                      {/* Options */}

                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {(
                          [
                            [
                              "A",
                              "optionA",
                            ],
                            [
                              "B",
                              "optionB",
                            ],
                            [
                              "C",
                              "optionC",
                            ],
                            [
                              "D",
                              "optionD",
                            ],
                          ] as const
                        ).map(
                          ([
                            option,
                            field,
                          ]) => (
                            <div
                              key={option}
                            >

                              <label
                                htmlFor={`question-${index}-option-${option}`}
                                className="mb-2 flex items-center gap-2 text-sm font-medium text-[#ddd]"
                              >

                                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#151515] text-[10px] text-[#aaa]">
                                  {option}
                                </span>

                                Option{" "}
                                {option}

                              </label>

                              <input
                                id={`question-${index}-option-${option}`}
                                value={
                                  question[
                                    field
                                  ]
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
                                disabled={
                                  saving
                                }
                                placeholder={`Option ${option}`}
                                className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#555] focus:border-[#f15a24]/50 disabled:cursor-not-allowed disabled:opacity-60"
                              />

                            </div>
                          )
                        )}

                      </div>

                      {/* Correct Answer */}

                      <div className="mt-5">

                        <label
                          htmlFor={`correct-answer-${index}`}
                          className="mb-2 block text-sm font-medium text-[#ddd]"
                        >
                          Correct Answer
                        </label>

                        <select
                          id={`correct-answer-${index}`}
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
                          className="w-full rounded-xl border border-[#303030] bg-[#070707] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f15a24]/50 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs"
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

                    </article>
                  )
                )}

              </div>
            )}

          </section>

          {/* ===================================
              MESSAGE
          =================================== */}

          {message && (
            <div className="mt-6 rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-[#aaa]">
              {message}
            </div>
          )}

          {/* ===================================
              ACTIONS
          =================================== */}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/instructor/dashboard/quizzes/manage"
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-[#303030] bg-transparent px-5 py-3 text-sm font-medium text-[#aaa] transition hover:border-[#444] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}