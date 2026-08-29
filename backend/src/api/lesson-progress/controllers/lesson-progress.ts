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

      // Find lesson
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
      // FIND EXISTING USER + LESSON PROGRESS
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

      const completedAt = completed
        ? body.completedAt ||
          new Date().toISOString()
        : null;

      // ==========================================
      // UPDATE EXISTING
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
      // CREATE NEW
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

              // Always logged-in user
              user: user.id,

              // Current lesson
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
    // MY COURSE PROGRESS
    // ==========================================

    async myProgress(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const courseDocumentId =
        ctx.query.courseDocumentId;

      if (!courseDocumentId) {
        return ctx.badRequest(
          "courseDocumentId is required."
        );
      }

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

      const completedLessonIds =
        progresses
          .filter((progress: any) => {
            const course =
              progress?.lesson?.course;

            return (
              course?.documentId ===
              courseDocumentId
            );
          })
          .map((progress: any) => {
            return progress.lesson.documentId;
          });

      console.log(
        "MY COURSE PROGRESS:",
        completedLessonIds
      );

      return {
        data: completedLessonIds,
      };
    },
  })
);