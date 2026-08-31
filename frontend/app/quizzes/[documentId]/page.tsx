"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Question = {
  id: number;
  documentId?: string;
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
  description?: string;
  questions?: Question[];
};

type Answers = Record<
  number,
  "A" | "B" | "C" | "D"
>;

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const documentId =
    params?.documentId as string;

  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [answers, setAnswers] =
    useState<Answers>({});

  const [score, setScore] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ==========================================
  // LOAD QUIZ
  // ==========================================

  useEffect(() => {
    if (!documentId) {
      return;
    }

    async function loadQuiz() {
      setLoading(true);
      setMessage("");

      try {
        const token =
          localStorage.getItem("lms_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response =
          await fetch(
            `https://lms-learning-management-system-production-0ff5.up.railway.app/api/quizzes/${documentId}?populate[questions]=true`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        console.log(
          "QUIZ RESPONSE:",
          result
        );

        if (!response.ok) {
          setMessage(
            result?.error?.message ||
              "Failed to load quiz."
          );
          return;
        }

        const loadedQuiz =
          result?.data;

        if (!loadedQuiz) {
          setMessage(
            "Quiz not found."
          );
          return;
        }

        setQuiz(loadedQuiz);
      } catch (error) {
        console.error(
          "QUIZ LOAD ERROR:",
          error
        );

        setMessage(
          "Something went wrong while loading the quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [documentId, router]);

  // ==========================================
  // SELECT ANSWER
  // ==========================================

  function selectAnswer(
    questionId: number,
    answer: "A" | "B" | "C" | "D"
  ) {
    if (score !== null) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  function handleSubmit() {
    if (!quiz) {
      return;
    }

    const questions =
      quiz.questions || [];

    if (questions.length === 0) {
      setMessage(
        "This quiz has no questions."
      );
      return;
    }

    const unanswered =
      questions.filter(
        (question) =>
          !answers[question.id]
      );

    if (unanswered.length > 0) {
      setMessage(
        `Please answer all questions. ${unanswered.length} question${
          unanswered.length > 1
            ? "s are"
            : " is"
        } still unanswered.`
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    let correct = 0;

    questions.forEach(
      (question) => {
        if (
          answers[question.id] ===
          question.correctAnswer
        ) {
          correct += 1;
        }
      }
    );

    setScore(correct);
    setSubmitting(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================
  // RETRY
  // ==========================================

  function handleRetry() {
    setAnswers({});
    setScore(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-4 w-24 rounded bg-white/[0.06]" />

          <div className="mt-8 h-10 w-2/3 rounded bg-white/[0.06]" />

          <div className="mt-4 h-5 w-full max-w-xl rounded bg-white/[0.04]" />

          <div className="mt-8 h-40 rounded-2xl bg-white/[0.04]" />

          <div className="mt-4 h-40 rounded-2xl bg-white/[0.04]" />
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (message && !quiz) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f5f5f5] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
            Quiz
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Unable to load quiz
          </h1>

          <div className="mt-6 rounded-xl border border-[#292929] bg-[#0b0b0b] p-5 text-sm leading-6 text-[#999]">
            {message}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 rounded-lg border border-[#292929] bg-[#0b0b0b] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#f15a24]/40"
          >
            ← Back
          </button>

        </div>
      </main>
    );
  }

  if (!quiz) {
    return null;
  }

  const questions =
    quiz.questions || [];

  const percentage =
    score !== null &&
    questions.length > 0
      ? Math.round(
          (score / questions.length) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-4xl">

        {/* Back */}

        <button
          type="button"
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back to My Courses
        </button>

        {/* Header */}

        <header className="mt-7 border-b border-[#202020] pb-6">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
            Quiz
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-[-0.025em] text-[#f5f5f5] sm:text-4xl">
            {quiz.title}
          </h1>

          {quiz.description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#888] sm:text-base">
              {quiz.description}
            </p>
          )}

          {questions.length > 0 && (
            <p className="mt-4 text-xs text-[#666]">
              {questions.length}{" "}
              {questions.length === 1
                ? "question"
                : "questions"}
            </p>
          )}

        </header>

        {/* Result */}

        {score !== null && (
          <div className="mt-6 rounded-2xl border border-[#f15a24]/25 bg-[#0b0b0b] p-6 text-center sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
              Quiz Result
            </p>

            <h2 className="mt-3 text-4xl font-bold text-[#f5f5f5] sm:text-5xl">
              {score}{" "}
              <span className="text-[#666]">
                / {questions.length}
              </span>
            </h2>

            <p className="mt-2 text-sm text-[#888]">
              {percentage}% correct
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 rounded-lg bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Message */}

        {message && (
          <div className="mt-5 rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.04] p-4 text-sm leading-6 text-[#aaa]">
            {message}
          </div>
        )}

        {/* Empty */}

        {questions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-6 py-12 text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.05] text-[#f15a24]">
              ?
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              No questions available
            </h2>

            <p className="mt-2 text-sm text-[#777]">
              This quiz does not have any
              questions yet.
            </p>

          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {questions.map(
              (question, index) => {
                const selectedAnswer =
                  answers[question.id];

                const options = [
                  {
                    value: "A" as const,
                    label:
                      question.optionA,
                  },
                  {
                    value: "B" as const,
                    label:
                      question.optionB,
                  },
                  {
                    value: "C" as const,
                    label:
                      question.optionC,
                  },
                  {
                    value: "D" as const,
                    label:
                      question.optionD,
                  },
                ];

                return (
                  <section
                    key={
                      question.documentId ||
                      question.id
                    }
                    className="rounded-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:p-6"
                  >

                    {/* Question header */}

                    <div className="flex items-start gap-3">

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f15a24]/[0.08] text-xs font-semibold text-[#f15a24]">
                        {index + 1}
                      </span>

                      <h2 className="text-base font-semibold leading-7 text-[#f5f5f5] sm:text-lg">
                        {question.question}
                      </h2>

                    </div>

                    {/* Options */}

                    <div className="mt-5 space-y-2.5">

                      {options.map(
                        (option) => {
                          const isSelected =
                            selectedAnswer ===
                            option.value;

                          const isCorrect =
                            score !== null &&
                            question.correctAnswer ===
                              option.value;

                          const isWrongSelected =
                            score !== null &&
                            isSelected &&
                            !isCorrect;

                          let optionClass =
                            "border-[#292929] bg-[#080808] hover:border-[#f15a24]/35 hover:bg-[#0f0f0f]";

                          if (
                            isSelected &&
                            score === null
                          ) {
                            optionClass =
                              "border-[#f15a24]/60 bg-[#f15a24]/[0.07]";
                          }

                          if (isCorrect) {
                            optionClass =
                              "border-green-500/30 bg-green-500/[0.05]";
                          }

                          if (
                            isWrongSelected
                          ) {
                            optionClass =
                              "border-red-500/30 bg-red-500/[0.05]";
                          }

                          return (
                            <button
                              key={
                                option.value
                              }
                              type="button"
                              disabled={
                                score !== null
                              }
                              onClick={() =>
                                selectAnswer(
                                  question.id,
                                  option.value
                                )
                              }
                              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition sm:p-4 ${optionClass} ${
                                score !==
                                null
                                  ? "cursor-default"
                                  : "cursor-pointer"
                              }`}
                            >

                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                                  isCorrect
                                    ? "border-green-500/30 text-green-400"
                                    : isWrongSelected
                                    ? "border-red-500/30 text-red-400"
                                    : isSelected
                                    ? "border-[#f15a24]/50 text-[#f15a24]"
                                    : "border-[#292929] text-[#777]"
                                }`}
                              >
                                {
                                  option.value
                                }
                              </span>

                              <span className="min-w-0 flex-1 leading-6 text-[#aaa]">
                                {
                                  option.label
                                }
                              </span>

                              {isCorrect && (
                                <span className="shrink-0 text-xs font-medium text-green-400">
                                  Correct
                                </span>
                              )}

                              {isWrongSelected && (
                                <span className="shrink-0 text-xs font-medium text-red-400">
                                  Wrong
                                </span>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                    {/* Answer result */}

                    {score !== null && (
                      <div
                        className={`mt-4 border-t border-[#202020] pt-4 text-sm ${
                          selectedAnswer ===
                          question.correctAnswer
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {selectedAnswer ===
                        question.correctAnswer
                          ? "Correct answer."
                          : `Correct answer: ${question.correctAnswer}`}
                      </div>
                    )}

                  </section>
                );
              }
            )}

          </div>
        )}

        {/* Submit */}

        {questions.length > 0 &&
          score === null && (
            <div className="mt-6">

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-[#f15a24] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d94b1f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Checking..."
                  : "Submit Quiz"}
              </button>

              <p className="mt-3 text-center text-xs text-[#555]">
                Answer all questions before
                submitting.
              </p>

            </div>
          )}

      </div>
    </main>
  );
}