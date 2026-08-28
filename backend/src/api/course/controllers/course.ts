import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    // =========================
    // CREATE COURSE
    // =========================
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      const requestData = ctx.request.body?.data || {};

      try {
        const course = await strapi
          .documents("api::course.course")
          .create({
            data: {
              ...requestData,
              instructor: user.id,
            },
          });

        console.log("COURSE CREATED:", course);

        return {
          data: course,
        };
      } catch (error) {
        console.error("CREATE COURSE ERROR:", error);

        return ctx.internalServerError(
          "Failed to create course."
        );
      }
    },

    // =========================
    // UPDATE COURSE
    // =========================
    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      // Strapi core router uses :id.
      // In Strapi 5 this value is the documentId.
      const { id: documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          "Course documentId is required."
        );
      }

      try {
        console.log(
          "UPDATE DOCUMENT ID:",
          documentId
        );

        // Find the draft version first.
        let existingCourse = await strapi
          .documents("api::course.course")
          .findOne({
            documentId,
            status: "draft",
            populate: {
              instructor: true,
            },
          });

        // If draft does not exist, check published version.
        if (!existingCourse) {
          existingCourse = await strapi
            .documents("api::course.course")
            .findOne({
              documentId,
              status: "published",
              populate: {
                instructor: true,
              },
            });
        }

        console.log(
          "EXISTING COURSE:",
          existingCourse
        );

        if (!existingCourse) {
          return ctx.notFound(
            "Course not found."
          );
        }

        const instructorId =
          existingCourse.instructor?.id;

        console.log(
          "COURSE INSTRUCTOR ID:",
          instructorId
        );

        console.log(
          "LOGGED USER ID:",
          user.id
        );

        // Only the owner/instructor can edit the course.
        if (instructorId !== user.id) {
          return ctx.forbidden(
            "You can only update your own courses."
          );
        }

        const requestData =
          ctx.request.body?.data || {};

        const updatedCourse = await strapi
          .documents("api::course.course")
          .update({
            documentId,
            data: {
              title: requestData.title,
              description: requestData.description,
            },
          });

        console.log(
          "COURSE UPDATED:",
          updatedCourse
        );

        return {
          data: updatedCourse,
        };
      } catch (error) {
        console.error(
          "UPDATE COURSE ERROR:",
          error
        );

        return ctx.internalServerError(
          "Failed to update course."
        );
      }
    },

    // =========================
    // DELETE COURSE
    // =========================
    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Please login first.");
      }

      // Strapi core router uses :id.
      // In Strapi 5 this value is the documentId.
      const { id: documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          "Course documentId is required."
        );
      }

      try {
        console.log(
          "DELETE DOCUMENT ID:",
          documentId
        );

        // Find draft version first.
        let existingCourse = await strapi
          .documents("api::course.course")
          .findOne({
            documentId,
            status: "draft",
            populate: {
              instructor: true,
            },
          });

        // If draft does not exist, check published version.
        if (!existingCourse) {
          existingCourse = await strapi
            .documents("api::course.course")
            .findOne({
              documentId,
              status: "published",
              populate: {
                instructor: true,
              },
            });
        }

        console.log(
          "EXISTING COURSE FOR DELETE:",
          existingCourse
        );

        if (!existingCourse) {
          return ctx.notFound(
            "Course not found."
          );
        }

        const instructorId =
          existingCourse.instructor?.id;

        console.log(
          "COURSE INSTRUCTOR ID:",
          instructorId
        );

        console.log(
          "LOGGED USER ID:",
          user.id
        );

        // Only the owner/instructor can delete the course.
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

        console.log(
          "COURSE DELETED:",
          deletedCourse
        );

        return {
          data: deletedCourse,
        };
      } catch (error) {
        console.error(
          "DELETE COURSE ERROR:",
          error
        );

        return ctx.internalServerError(
          "Failed to delete course."
        );
      }
    },
  })
);