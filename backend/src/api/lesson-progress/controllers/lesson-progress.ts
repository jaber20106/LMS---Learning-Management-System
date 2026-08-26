import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson-progress.lesson-progress",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      const data = ctx.request.body?.data || {};
      const lessonDocumentId = data.lesson;

      if (!lessonDocumentId) {
        return ctx.badRequest("Lesson is required.");
      }

      const lesson = await strapi
        .documents("api::lesson.lesson")
        .findFirst({
          filters: {
            documentId: {
              $eq: lessonDocumentId,
            },
          },
        });

      if (!lesson) {
        return ctx.notFound("Lesson not found.");
      }

      const existingProgress = await strapi
        .documents("api::lesson-progress.lesson-progress")
        .findFirst({
          filters: {
            user: {
              id: {
                $eq: user.id,
              },
            },
            lesson: {
              documentId: {
                $eq: lesson.documentId,
              },
            },
          },
        });

      const progressData = {
        completed: true,
        completedAt: data.completedAt || new Date().toISOString(),
        user: user.id,
        lesson: lesson.documentId,
      };

      let progress;

      if (existingProgress) {
        progress = await strapi
          .documents("api::lesson-progress.lesson-progress")
          .update({
            documentId: existingProgress.documentId,
            data: {
              completed: true,
              completedAt: progressData.completedAt,
            },
          });
      } else {
        progress = await strapi
          .documents("api::lesson-progress.lesson-progress")
          .create({
            data: progressData,
          });
      }

      return { data: progress };
    },
  })
);