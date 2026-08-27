import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::enrollment.enrollment",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      const data = ctx.request.body?.data || {};
      const courseDocumentId = data.course;

      if (!courseDocumentId) {
        return ctx.badRequest("Course is required.");
      }

      // Find the course
      const course = await strapi
        .documents("api::course.course")
        .findFirst({
          filters: {
            documentId: {
              $eq: courseDocumentId,
            },
          },
        });

      if (!course) {
        return ctx.notFound("Course not found.");
      }

      // Check if this user already enrolled
      const existingEnrollment = await strapi
        .documents("api::enrollment.enrollment")
        .findFirst({
          filters: {
            user: {
              id: {
                $eq: user.id,
              },
            },
            course: {
              documentId: {
                $eq: course.documentId,
              },
            },
          },
        });

      if (existingEnrollment) {
        return ctx.badRequest(
          "You are already enrolled in this course."
        );
      }

      // Create enrollment and attach CURRENT logged-in user
      const enrollment = await strapi
        .documents("api::enrollment.enrollment")
        .create({
          data: {
            user: user.id,
            course: course.documentId,
          },
        });

      return {
        data: enrollment,
      };
    },
  })
);