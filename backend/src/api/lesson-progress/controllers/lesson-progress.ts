import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({

    // ==========================================
    // CREATE / UPDATE PROGRESS
    // ==========================================

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const body =
        ctx.request.body?.data || {};

      const lessonDocumentId =
        body.lesson?.connect?.[0] ||
        body.lesson;

      if (!lessonDocumentId) {
        return ctx.badRequest(
          "Lesson is required."
        );
      }

      // ==========================================
      // FIND LESSON
      // ==========================================

      const lesson =
        await strapi
          .documents("api::lesson.lesson")
          .findOne({
            documentId:
              lessonDocumentId,
          });

      if (!lesson) {
        return ctx.notFound(
          "Lesson not found."
        );
      }

      // ==========================================
      // FIND EXISTING PROGRESS
      // ==========================================

      const existingProgress =
        await strapi.db
          .query(
            "api::lesson-progress.lesson-progress"
          )
          .findOne({
            where: {
              user: user.id,
              lesson: lesson.id,
            },
          });

      const completed =
        body.completed === true;

      const completedAt =
        completed
          ? body.completedAt ||
            new Date().toISOString()
          : null;

      // ==========================================
      // UPDATE EXISTING PROGRESS
      // ==========================================

      if (existingProgress) {
        const updatedProgress =
          await strapi.db
            .query(
              "api::lesson-progress.lesson-progress"
            )
            .update({
              where: {
                id: existingProgress.id,
              },

              data: {
                completed,
                completedAt,
              },
            });

        console.log(
          "PROGRESS UPDATED:",
          updatedProgress
        );

        return {
          data: updatedProgress,
        };
      }

      // ==========================================
      // CREATE NEW PROGRESS
      // ==========================================

      const progress =
        await strapi.db
          .query(
            "api::lesson-progress.lesson-progress"
          )
          .create({
            data: {
              completed,
              completedAt,

              // IMPORTANT:
              // Always use logged-in user
              user: user.id,

              // IMPORTANT:
              // Use database lesson ID
              lesson: lesson.id,
            },
          });

      console.log(
        "PROGRESS CREATED:",
        progress
      );

      return {
        data: progress,
      };
    },

    // ==========================================
    // GET MY COURSE PROGRESS
    // ==========================================

    async myProgress(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      // ========================================
      // GET QUERY PARAMETER
      // ========================================

      const courseDocumentId =
        String(
          ctx.query?.courseDocumentId || ""
        ).trim();

      console.log(
        "MY PROGRESS COURSE ID:",
        courseDocumentId
      );

      if (!courseDocumentId) {
        return ctx.badRequest(
          "courseDocumentId is required."
        );
      }

      // ========================================
      // FIND COURSE FIRST
      // ========================================

      const course =
        await strapi
          .documents("api::course.course")
          .findOne({
            documentId:
              courseDocumentId,
          });

      console.log(
        "MY PROGRESS COURSE:",
        course
      );

      if (!course) {
        return ctx.notFound(
          "Course not found."
        );
      }

      // ========================================
      // GET USER'S COMPLETED PROGRESS
      // ========================================

      const progresses =
        await strapi.db
          .query(
            "api::lesson-progress.lesson-progress"
          )
          .findMany({
            where: {
              user: user.id,
              completed: true,
            },

            populate: {
              lesson: {
                populate: {
                  course: true,
                },
              },
            },
          });

      console.log(
        "USER COMPLETED PROGRESS:",
        progresses
      );

      // ========================================
      // FILTER CURRENT COURSE
      // ========================================

      const completedLessonIds =
        progresses
          .filter((progress: any) => {
            const progressCourse =
              progress?.lesson?.course;

            if (!progressCourse) {
              return false;
            }

            return (
              progressCourse.id ===
                course.id ||
              progressCourse.documentId ===
                course.documentId
            );
          })
          .map((progress: any) => {
            return (
              progress?.lesson?.documentId
            );
          })
          .filter(Boolean);

      console.log(
        "COMPLETED LESSON IDS:",
        completedLessonIds
      );

      return {
        data: completedLessonIds,
      };
    },
  })
);