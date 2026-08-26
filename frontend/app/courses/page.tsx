import Link from "next/link";

type Course = {
  id: number;
  documentId: string;
  title: string;
  description: string;
};

type CoursesResponse = {
  data: Course[];
};

async function getCourses(): Promise<Course[]> {
  const response = await fetch("http://localhost:1337/api/courses", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  const result: CoursesResponse = await response.json();

  return result.data;
}

export default async function CoursesPage() {
  const courses = await getCourses();

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
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#aaa",
          }}
        >
          ← Back to Home
        </Link>

        <h1
          style={{
            fontSize: "42px",
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          Browse Courses
        </h1>

        <p
          style={{
            color: "#aaa",
            marginBottom: "40px",
          }}
        >
          Explore our available courses and start learning.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {courses.map((course) => (
            <div
              key={course.documentId}
              style={{
                border: "1px solid #333",
                borderRadius: "14px",
                padding: "24px",
                background: "#111",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  marginBottom: "12px",
                }}
              >
                {course.title}
              </h2>

              <p
                style={{
                  color: "#aaa",
                  lineHeight: "1.6",
                  minHeight: "70px",
                }}
              >
                {course.description}
              </p>

              <Link
                href={`/courses/${course.documentId}`}
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
                View Course →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}