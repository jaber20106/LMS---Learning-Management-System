import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson.lesson",
  ({ strapi }) => ({
    async findOne(ctx: any) {
      const user = ctx.state.user;

      // User must be logged in
      if (!user) {
        return ctx.unauthorized(
          "You must be logged in to access this lesson."
        );
      }

      const { documentId } = ctx.params;

      // Find lesson and its course
      const lesson = await strapi.db
        .query("api::lesson.lesson")
        .findOne({
          where: {
            documentId,
          },
          populate: {
            course: true,
          },
        });

      if (!lesson) {
        return ctx.notFound("Lesson not found.");
      }

      // Lesson must belong to a course
      if (!lesson.course) {
        return ctx.forbidden(
          "This lesson is not connected to a course."
        );
      }

      // Check whether current user is enrolled
      const enrollment = await strapi.db
        .query("api::enrollment.enrollment")
        .findOne({
          where: {
            user: user.id,
            course: lesson.course.id,
          },
        });

      if (!enrollment) {
        return ctx.forbidden(
          "You are not enrolled in this course."
        );
      }

      // Return lesson
      return {
        data: lesson,
      };
    },
  })
);