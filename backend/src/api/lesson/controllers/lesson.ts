import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::lesson.lesson",
  ({ strapi }) => ({

    // ==========================================
    // FIND LESSONS
    // ==========================================

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const roleName =
        user.role?.name?.trim().toLowerCase();

      // ==========================================
      // ADMIN
      // Show ALL lessons
      // ==========================================

      if (roleName === "admin") {
        const lessons =
          await strapi
            .documents("api::lesson.lesson")
            .findMany({
              status: "draft",

              populate: {
                course: {
                  populate: {
                    instructor: true,
                  },
                },
              },
            });

        console.log(
          "ADMIN LESSONS:",
          lessons
        );

        return {
          data: lessons,
        };
      }

      // ==========================================
      // INSTRUCTOR
      // Show only lessons from own courses
      // ==========================================

      if (roleName === "instructor") {
        const lessons =
          await strapi
            .documents("api::lesson.lesson")
            .findMany({
              filters: {
                course: {
                  instructor: {
                    id: {
                      $eq: user.id,
                    },
                  },
                },
              },

              status: "draft",

              populate: {
                course: {
                  populate: {
                    instructor: true,
                  },
                },
              },
            });

        console.log(
          "INSTRUCTOR LESSONS:",
          lessons
        );

        return {
          data: lessons,
        };
      }

      // ==========================================
      // STUDENT / PUBLIC
      // Use normal Strapi behaviour
      // Published lessons only
      // ==========================================

      return await super.find(ctx);
    },

    // ==========================================
    // FIND ONE LESSON
    // ==========================================

    async findOne(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "You must be logged in to access this lesson."
        );
      }

      const { id: documentId } =
        ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          "Lesson documentId is required."
        );
      }

      const lesson =
        await strapi
          .documents("api::lesson.lesson")
          .findOne({
            documentId,

            populate: {
              course: {
                populate: {
                  instructor: true,
                },
              },
            },
          });

      if (!lesson) {
        return ctx.notFound(
          "Lesson not found."
        );
      }

      if (!lesson.course) {
        return ctx.forbidden(
          "This lesson is not connected to a course."
        );
      }

      const roleName =
        user.role?.name?.trim().toLowerCase();

      // ==========================================
      // ADMIN
      // ==========================================

      if (roleName === "admin") {
        return {
          data: lesson,
        };
      }

      // ==========================================
      // INSTRUCTOR
      // ==========================================

      if (roleName === "instructor") {
        const ownerId =
          lesson.course?.instructor?.id;

        if (ownerId !== user.id) {
          return ctx.forbidden(
            "You can only access lessons from your own courses."
          );
        }

        return {
          data: lesson,
        };
      }

      // ==========================================
      // STUDENT
      // ==========================================

      if (roleName === "student") {
        const enrollment =
          await strapi.db
            .query(
              "api::enrollment.enrollment"
            )
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

        return {
          data: lesson,
        };
      }

      return {
        data: lesson,
      };
    },

    // ==========================================
    // CREATE LESSON
    // ==========================================

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const roleName =
        user.role?.name?.trim().toLowerCase();

      // ==========================================
      // ROLE CHECK
      // ==========================================

      if (
        roleName !== "instructor" &&
        roleName !== "admin"
      ) {
        return ctx.forbidden(
          "You are not allowed to create lessons."
        );
      }

      const body =
        ctx.request.body?.data || {};

      const courseDocumentId =
        body.course?.connect?.[0] ||
        body.course;

      if (!courseDocumentId) {
        return ctx.badRequest(
          "Course is required."
        );
      }

      // ==========================================
      // FIND COURSE
      // ==========================================

      const course =
        await strapi
          .documents("api::course.course")
          .findFirst({
            filters: {
              documentId: {
                $eq: courseDocumentId,
              },
            },

            populate: {
              instructor: true,
            },
          });

      if (!course) {
        return ctx.notFound(
          "Course not found."
        );
      }

      // ==========================================
      // INSTRUCTOR OWNERSHIP
      // ==========================================

      if (roleName === "instructor") {
        const ownerId =
          course.instructor?.id;

        if (ownerId !== user.id) {
          return ctx.forbidden(
            "You can only add lessons to your own courses."
          );
        }
      }

      // ==========================================
      // CREATE PUBLISHED LESSON
      // ==========================================

      const data = {
        ...body,

        // Always connect to correct course
        course: course.documentId,
      };

      const lesson =
        await strapi
          .documents("api::lesson.lesson")
          .create({
            data,

            // IMPORTANT:
            // Automatically publish lesson
            status: "published",
          });

      console.log(
        "LESSON CREATED:",
        lesson
      );

      return {
        data: lesson,
      };
    },

    // ==========================================
    // UPDATE LESSON
    // ==========================================

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized(
          "Please login first."
        );
      }

      const roleName =
        user.role?.name?.trim().toLowerCase();

      if (
        roleName !== "instructor" &&
        roleName !== "admin"
      ) {
        return ctx.forbidden(
          "You are not allowed to edit lessons."
        );
      }

      const { id: documentId } =
        ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          "Lesson documentId is required."
        );
      }

      try {
        console.log(
          "UPDATE LESSON DOCUMENT ID:",
          documentId
        );

        // ========================================
        // FIND LESSON
        // ========================================

        let lesson =
          await strapi
            .documents("api::lesson.lesson")
            .findOne({
              documentId,

              status: "draft",

              populate: {
                course: {
                  populate: {
                    instructor: true,
                  },
                },
              },
            });

        // If no draft, check published
        if (!lesson) {
          lesson =
            await strapi
              .documents("api::lesson.lesson")
              .findOne({
                documentId,

                status: "published",

                populate: {
                  course: {
                    populate: {
                      instructor: true,
                    },
                  },
                },
              });
        }

        console.log(
          "EXISTING LESSON:",
          lesson
        );

        if (!lesson) {
          return ctx.notFound(
            "Lesson not found."
          );
        }

        if (!lesson.course) {
          return ctx.forbidden(
            "This lesson is not connected to a course."
          );
        }

        // ========================================
        // INSTRUCTOR OWNERSHIP
        // ========================================

        if (roleName === "instructor") {
          const ownerId =
            lesson.course?.instructor?.id;

          if (ownerId !== user.id) {
            return ctx.forbidden(
              "You can only edit lessons from your own courses."
            );
          }
        }

        const requestData =
          ctx.request.body?.data || {};

        // Instructor cannot move lesson
        // to another course
        if (roleName === "instructor") {
          delete requestData.course;
        }

        // ========================================
        // UPDATE + PUBLISH
        // ========================================

        const updatedLesson =
          await strapi
            .documents("api::lesson.lesson")
            .update({
              documentId,

              data: requestData,

              status: "published",
            });

        console.log(
          "LESSON UPDATED:",
          updatedLesson
        );

        return {
          data: updatedLesson,
        };
      } catch (error) {
        console.error(
          "UPDATE LESSON ERROR:",
          error
        );

        return ctx.internalServerError(
          "Failed to update lesson."
        );
      }
    },

    // ==========================================
    // DELETE LESSON
    // ==========================================

    async delete(ctx) {
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized("Please login first.");
  }

  const { id: documentId } = ctx.params;

  if (!documentId) {
    return ctx.badRequest(
      "Lesson documentId is required."
    );
  }

  try {
    // ========================================
    // GET ACTUAL USER ROLE FROM DATABASE
    // ========================================

    const fullUser = await strapi
      .db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          id: user.id,
        },
        populate: {
          role: true,
        },
      });

    const roleName =
      fullUser?.role?.name?.trim().toLowerCase();

    console.log("DELETE USER ID:", user.id);
    console.log("DELETE USER ROLE:", roleName);
    console.log("DELETE DOCUMENT ID:", documentId);

    // ========================================
    // ONLY ADMIN / INSTRUCTOR
    // ========================================

    if (
      roleName !== "admin" &&
      roleName !== "instructor"
    ) {
      return ctx.forbidden(
        "You are not allowed to delete lessons."
      );
    }

    // ========================================
    // FIND LESSON
    // ========================================

    let lesson = await strapi
      .documents("api::lesson.lesson")
      .findOne({
        documentId,
        status: "draft",
        populate: {
          course: {
            populate: {
              instructor: true,
            },
          },
        },
      });

    // Check published version
    if (!lesson) {
      lesson = await strapi
        .documents("api::lesson.lesson")
        .findOne({
          documentId,
          status: "published",
          populate: {
            course: {
              populate: {
                instructor: true,
              },
            },
          },
        });
    }

    console.log(
      "EXISTING LESSON FOR DELETE:",
      lesson
    );

    if (!lesson) {
      return ctx.notFound(
        "Lesson not found."
      );
    }

    // ========================================
    // INSTRUCTOR OWNERSHIP
    // ========================================
    //
    // IMPORTANT:
    // Admin does NOT need course ownership.
    //
    // This also allows Admin to delete
    // old/orphan lessons whose course was
    // already deleted.
    // ========================================

    if (roleName === "instructor") {
      if (!lesson.course) {
        return ctx.forbidden(
          "This lesson is not connected to a course."
        );
      }

      const ownerId =
        lesson.course?.instructor?.id;

      console.log(
        "LESSON COURSE OWNER:",
        ownerId
      );

      console.log(
        "LOGGED USER:",
        user.id
      );

      if (ownerId !== user.id) {
        return ctx.forbidden(
          "You can only delete lessons from your own courses."
        );
      }
    }

    // ========================================
    // ADMIN
    // ========================================
    //
    // Admin can delete ANY lesson,
    // including orphan lessons.
    // ========================================

    const deletedLesson =
      await strapi
        .documents("api::lesson.lesson")
        .delete({
          documentId,
        });

    console.log(
      "LESSON DELETED:",
      deletedLesson
    );

    return {
      data: deletedLesson,
    };
  } catch (error) {
    console.error(
      "DELETE LESSON ERROR:",
      error
    );

    return ctx.internalServerError(
      "Failed to delete lesson."
    );
  }
}
  })
);