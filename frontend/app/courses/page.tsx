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
  const response = await fetch(
    "http://localhost:1337/api/courses",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  const result: CoursesResponse =
    await response.json();

  return result.data;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#f5f5f5] sm:px-8 sm:py-10 lg:px-12">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-220px] h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-[#f15a24]/[0.04] blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#f15a24]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>

          Back to Home
        </Link>

        {/* Header */}
        <div className="mt-8 max-w-3xl sm:mt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#f15a24]">
            Courses
          </p>

          <h1 className="text-4xl font-bold tracking-[-0.04em] text-[#f5f5f5] sm:text-5xl md:text-6xl">
            Browse Courses
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#888] sm:text-base">
            Explore our courses and start learning
            practical skills.
          </p>
        </div>

        {/* Course Count */}
        <div className="mt-7 border-b border-[#202020] pb-4">
          <p className="text-sm text-[#666]">
            {courses.length}{" "}
            {courses.length === 1
              ? "course"
              : "courses"}{" "}
            available
          </p>
        </div>

        {/* Course Grid */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.documentId}
              className="group flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-[#292929] bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-1 hover:border-[#f15a24]/40"
            >
              {/* Card Visual */}
              <div className="relative flex h-24 items-center justify-center border-b border-[#202020] bg-[#090909]">
                <div className="absolute inset-0 bg-[#f15a24]/[0.035] opacity-0 transition group-hover:opacity-100" />

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.07] text-lg text-[#f15a24]">
                  ◈
                </div>
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f15a24]">
                  Course
                </p>

                <h2 className="mt-2 text-xl font-semibold leading-7 text-[#f5f5f5]">
                  {course.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#777]">
                  {course.description}
                </p>

                {/* Button */}
                <div className="mt-auto pt-5">
                  <Link
                    href={`/courses/${course.documentId}`}
                    className="group/button flex w-full items-center justify-center rounded-xl bg-[#f15a24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b1f]"
                  >
                    View Course

                    <span className="ml-2 transition-transform group-hover/button:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[#292929] bg-[#0b0b0b] px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#f15a24]/20 bg-[#f15a24]/[0.06] text-[#f15a24]">
              ◈
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#f5f5f5]">
              No courses available
            </h2>

            <p className="mt-2 text-sm text-[#777]">
              Please check back later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}