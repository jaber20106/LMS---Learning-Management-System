import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      const requestData = ctx.request.body?.data || {};

      const course = await strapi
        .documents("api::course.course")
        .create({
          data: {
            ...requestData,
            instructor: user.id,
          },
        });

      return {
        data: course,
      };
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      const { documentId } = ctx.params;

      const existingCourse = await strapi
        .documents("api::course.course")
        .findFirst({
          filters: {
            documentId: {
              $eq: documentId,
            },
          },
          populate: {
            instructor: true,
          },
        });

      if (!existingCourse) {
        return ctx.notFound("Course not found.");
      }

      const instructorId =
        existingCourse.instructor?.id;

      if (instructorId !== user.id) {
        return ctx.forbidden(
          "You can only update your own courses."
        );
      }

      const requestData = ctx.request.body?.data || {};

      const updatedCourse = await strapi
        .documents("api::course.course")
        .update({
          documentId,
          data: requestData,
        });

      return {
        data: updatedCourse,
      };
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      const { documentId } = ctx.params;

      const existingCourse = await strapi
        .documents("api::course.course")
        .findFirst({
          filters: {
            documentId: {
              $eq: documentId,
            },
          },
          populate: {
            instructor: true,
          },
        });

      if (!existingCourse) {
        return ctx.notFound("Course not found.");
      }

      const instructorId =
        existingCourse.instructor?.id;

      if (instructorId !== user.id) {
        return ctx.forbidden(
          "You can only delete your own courses."
        );
      }

      const deletedCourse = await strapi
        .documents("api::course.course")
        .delete({
          documentId,
        });

      return {
        data: deletedCourse,
      };
    },
  })
);