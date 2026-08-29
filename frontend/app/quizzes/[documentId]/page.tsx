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

type Answers = Record<number, "A" | "B" | "C" | "D">;

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const documentId = params?.documentId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [score, setScore] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!documentId) {
      return;
    }

    async function loadQuiz() {
      setLoading(true);
      setMessage("");

      try {
        const token = localStorage.getItem("lms_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:1337/api/quizzes/${documentId}?populate[questions]=true`,
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

        console.log("QUIZ RESPONSE:", result);

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
      } catch (error) {
        console.error("QUIZ LOAD ERROR:", error);

        setMessage(
          "Something went wrong while loading the quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [documentId, router]);

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

  function handleSubmit() {
    if (!quiz) {
      return;
    }

    const questions = quiz.questions || [];

    if (questions.length === 0) {
      setMessage("This quiz has no questions.");
      return;
    }

    const unanswered = questions.filter(
      (question) => !answers[question.id]
    );

    if (unanswered.length > 0) {
      setMessage(
        `Please answer all questions. ${unanswered.length} question${
          unanswered.length > 1 ? "s are" : " is"
        } still unanswered.`
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    let correct = 0;

    questions.forEach((question) => {
      if (
        answers[question.id] ===
        question.correctAnswer
      ) {
        correct += 1;
      }
    });

    setScore(correct);
    setSubmitting(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleRetry() {
    setAnswers({});
    setScore(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={mutedStyle}>Loading quiz...</p>
        </div>
      </main>
    );
  }

  if (message && !quiz) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={messageStyle}>
            {message}
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            style={secondaryButtonStyle}
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

  const questions = quiz.questions || [];

  const percentage =
    score !== null && questions.length > 0
      ? Math.round(
          (score / questions.length) * 100
        )
      : 0;

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={() => router.back()}
          style={backButtonStyle}
        >
          ← Back to My Courses
        </button>

        <div style={headerStyle}>
          <p style={eyebrowStyle}>Quiz</p>

          <h1 style={titleStyle}>
            {quiz.title}
          </h1>

          {quiz.description && (
            <p style={descriptionStyle}>
              {quiz.description}
            </p>
          )}
        </div>

        {score !== null && (
          <div style={resultStyle}>
            <p style={resultLabelStyle}>
              Quiz Result
            </p>

            <h2 style={resultTitleStyle}>
              {score} / {questions.length}
            </h2>

            <p style={resultPercentageStyle}>
              {percentage}% correct
            </p>

            <button
              type="button"
              onClick={handleRetry}
              style={primaryButtonStyle}
            >
              Try Again
            </button>
          </div>
        )}

        {message && (
          <div style={messageStyle}>
            {message}
          </div>
        )}

        {questions.length === 0 ? (
          <div style={emptyStyle}>
            No questions available for this quiz.
          </div>
        ) : (
          <div>
            {questions.map(
              (question, index) => {
                const selectedAnswer =
                  answers[question.id];

                const options = [
                  {
                    value: "A" as const,
                    label: question.optionA,
                  },
                  {
                    value: "B" as const,
                    label: question.optionB,
                  },
                  {
                    value: "C" as const,
                    label: question.optionC,
                  },
                  {
                    value: "D" as const,
                    label: question.optionD,
                  },
                ];

                return (
                  <section
                    key={
                      question.documentId ||
                      question.id
                    }
                    style={questionCardStyle}
                  >
                    <p style={questionNumberStyle}>
                      Question {index + 1}
                    </p>

                    <h2 style={questionStyle}>
                      {question.question}
                    </h2>

                    <div>
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
                              style={{
                                ...optionStyle,
                                ...(isSelected
                                  ? selectedOptionStyle
                                  : {}),
                                ...(isCorrect
                                  ? correctOptionStyle
                                  : {}),
                                ...(isWrongSelected
                                  ? wrongOptionStyle
                                  : {}),
                              }}
                            >
                              <span
                                style={
                                  optionLetterStyle
                                }
                              >
                                {
                                  option.value
                                }
                              </span>

                              <span>
                                {
                                  option.label
                                }
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>

                    {score !== null && (
                      <div
                        style={{
                          marginTop: "18px",
                          color:
                            selectedAnswer ===
                            question.correctAnswer
                              ? "#8ee6a8"
                              : "#ff8d8d",
                          fontSize: "14px",
                        }}
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

        {questions.length > 0 &&
          score === null && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={primaryButtonStyle}
            >
              {submitting
                ? "Checking..."
                : "Submit Quiz"}
            </button>
          )}
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 20px 80px",
};

const containerStyle = {
  width: "100%",
  maxWidth: "900px",
  margin: "0 auto",
};

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#aaa",
  padding: 0,
  marginBottom: "30px",
  cursor: "pointer",
  fontSize: "14px",
};

const headerStyle = {
  marginBottom: "35px",
};

const eyebrowStyle = {
  color: "#888",
  marginBottom: "8px",
  fontSize: "14px",
};

const titleStyle = {
  fontSize: "40px",
  margin: 0,
};

const descriptionStyle = {
  color: "#999",
  marginTop: "12px",
  lineHeight: 1.6,
};

const questionCardStyle = {
  border: "1px solid #333",
  borderRadius: "12px",
  padding: "26px",
  marginBottom: "22px",
  background: "#111",
};

const questionNumberStyle = {
  color: "#888",
  fontSize: "14px",
  marginBottom: "10px",
};

const questionStyle = {
  fontSize: "21px",
  lineHeight: 1.5,
  marginTop: 0,
  marginBottom: "22px",
};

const optionStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  textAlign: "left" as const,
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "9px",
  border: "1px solid #333",
  background: "#181818",
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
};

const selectedOptionStyle = {
  border: "1px solid #777",
  background: "#252525",
};

const correctOptionStyle = {
  border: "1px solid #4caf70",
  background: "#142219",
};

const wrongOptionStyle = {
  border: "1px solid #d55",
  background: "#251515",
};

const optionLetterStyle = {
  minWidth: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
  border: "1px solid #444",
  fontWeight: "700",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "15px",
  border: "none",
  borderRadius: "9px",
  background: "white",
  color: "black",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
  marginTop: "10px",
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
  padding: "14px 16px",
  border: "1px solid #444",
  borderRadius: "9px",
  color: "#ccc",
  marginBottom: "22px",
};

const mutedStyle = {
  color: "#999",
};

const emptyStyle = {
  border: "1px dashed #444",
  borderRadius: "10px",
  padding: "30px",
  color: "#888",
};

const resultStyle = {
  border: "1px solid #444",
  borderRadius: "12px",
  padding: "28px",
  marginBottom: "30px",
  textAlign: "center" as const,
};

const resultLabelStyle = {
  color: "#888",
  margin: 0,
};

const resultTitleStyle = {
  fontSize: "42px",
  margin: "10px 0",
};

const resultPercentageStyle = {
  color: "#aaa",
  marginBottom: "22px",
};