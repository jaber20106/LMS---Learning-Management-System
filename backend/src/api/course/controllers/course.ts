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
            status: "published",
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
    // FIND COURSES
    // =========================
    async find(ctx) {
      const user = ctx.state.user;

      try {
        const roleName =
          user?.role?.name?.trim().toLowerCase();

        // -----------------------------------
        // ADMIN
        // Show ALL courses
        // -----------------------------------
        if (user && roleName === "admin") {
          const courses = await strapi
            .documents("api::course.course")
            .findMany({
              status: "draft",
              populate: {
                lessons: true,
                instructor: true,
              },
            });

          console.log(
            "ADMIN COURSES:",
            courses
          );

          return {
            data: courses,
          };
        }

        // -----------------------------------
        // INSTRUCTOR
        // Show ONLY own courses
        // -----------------------------------
        if (
          user &&
          roleName === "instructor"
        ) {
          const courses = await strapi
            .documents("api::course.course")
            .findMany({
              filters: {
                instructor: {
                  id: {
                    $eq: user.id,
                  },
                },
              },

              status: "draft",

              populate: {
                lessons: true,
                instructor: true,
              },
            });

          console.log(
            "INSTRUCTOR COURSES:",
            courses
          );

          return {
            data: courses,
          };
        }

        // -----------------------------------
        // STUDENT / PUBLIC
        // Normal Strapi behaviour
        // -----------------------------------

        return await super.find(ctx);
      } catch (error) {
        console.error(
          "FIND COURSES ERROR:",
          error
        );

        return ctx.internalServerError(
          "Failed to fetch courses."
        );
      }
    },

    // =========================
    // UPDATE COURSE
    // =========================
    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const { id: documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          "Course documentId is required."
        );
      }

      try {
        const roleName =
          user.role?.name
            ?.trim()
            .toLowerCase();

        const isAdmin =
          roleName === "admin";

        console.log(
          "UPDATE DOCUMENT ID:",
          documentId
        );

        // -----------------------------------
        // FIND DRAFT
        // -----------------------------------

        let existingCourse =
          await strapi
            .documents("api::course.course")
            .findOne({
              documentId,
              status: "draft",
              populate: {
                instructor: true,
              },
            });

        // -----------------------------------
        // FIND PUBLISHED IF NO DRAFT
        // -----------------------------------

        if (!existingCourse) {
          existingCourse =
            await strapi
              .documents(
                "api::course.course"
              )
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

        console.log(
          "IS ADMIN:",
          isAdmin
        );

        // -----------------------------------
        // OWNERSHIP CHECK
        // Admin can edit everything
        // Instructor can edit own courses
        // -----------------------------------

        if (
          !isAdmin &&
          instructorId !== user.id
        ) {
          return ctx.forbidden(
            "You can only update your own courses."
          );
        }

        const requestData =
          ctx.request.body?.data || {};

        const updatedCourse =
          await strapi
            .documents(
              "api::course.course"
            )
            .update({
              documentId,

              data: {
                title:
                  requestData.title,
                description:
                  requestData.description,
              },

              status: "published",
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
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const { id: documentId } =
        ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          "Course documentId is required."
        );
      }

      try {
        const roleName =
          user.role?.name
            ?.trim()
            .toLowerCase();

        const isAdmin =
          roleName === "admin";

        console.log(
          "DELETE DOCUMENT ID:",
          documentId
        );

        // -----------------------------------
        // FIND DRAFT
        // -----------------------------------

        let existingCourse =
          await strapi
            .documents(
              "api::course.course"
            )
            .findOne({
              documentId,
              status: "draft",
              populate: {
                instructor: true,
              },
            });

        // -----------------------------------
        // FIND PUBLISHED
        // -----------------------------------

        if (!existingCourse) {
          existingCourse =
            await strapi
              .documents(
                "api::course.course"
              )
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

        console.log(
          "IS ADMIN:",
          isAdmin
        );

        // -----------------------------------
        // OWNERSHIP CHECK
        // Admin can delete everything
        // Instructor can delete own courses
        // -----------------------------------

        if (
          !isAdmin &&
          instructorId !== user.id
        ) {
          return ctx.forbidden(
            "You can only delete your own courses."
          );
        }

        // -----------------------------------
        // DELETE COURSE
        // -----------------------------------

        const deletedCourse =
          await strapi
            .documents(
              "api::course.course"
            )
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