export default {
  register() {},

  async bootstrap({ strapi }: any) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],

      async afterCreate(event: any) {
        const user = event.result;

        if (!user?.id) {
          return;
        }

        try {
          const studentRole = await strapi.db
            .query("plugin::users-permissions.role")
            .findOne({
              where: {
                name: "Student",
              },
            });

          if (!studentRole) {
            strapi.log.error("Student role not found.");
            return;
          }

          await strapi.db
            .query("plugin::users-permissions.user")
            .update({
              where: {
                id: user.id,
              },
              data: {
                role: studentRole.id,
              },
            });

          strapi.log.info(
            `New user ${user.id} assigned to Student role.`
          );
        } catch (error) {
          strapi.log.error(
            "Failed to assign Student role:",
            error
          );
        }
      },
    });
  },
};