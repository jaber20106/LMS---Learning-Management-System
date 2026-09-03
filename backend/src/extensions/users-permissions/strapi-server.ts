export default (plugin: any) => {
  // =========================
  // Override /me
  // =========================
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx: any) => {
    await originalMe(ctx);

    if (!ctx.state.user || !ctx.body) {
      return;
    }

    try {
      const user = await strapi
        .plugin("users-permissions")
        .service("user")
        .fetch(ctx.state.user.id, {
          populate: ["role"],
        });

      if (user?.role) {
        ctx.body.role = {
          id: user.role.id,
          name: user.role.name,
          type: user.role.type,
        };
      }
    } catch (error) {
      strapi.log.error(
        "Could not load user role:",
        error
      );
    }
  };

  // =========================
  // Override Register
  // New users -> Student
  // =========================
  const originalRegister =
    plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx: any) => {
    await originalRegister(ctx);

    try {
      const registeredUser = ctx.body?.user;

      if (!registeredUser?.id) {
        return;
      }

      // Find Student role
      const studentRole = await strapi
        .db
        .query("plugin::users-permissions.role")
        .findOne({
          where: {
            name: "Student",
          },
        });

      if (!studentRole) {
        strapi.log.error(
          'Student role not found. New user remains Authenticated.'
        );
        return;
      }

      // Change newly registered user's role to Student
      await strapi
        .db
        .query("plugin::users-permissions.user")
        .update({
          where: {
            id: registeredUser.id,
          },
          data: {
            role: studentRole.id,
          },
        });

      strapi.log.info(
        `New user ${registeredUser.id} assigned to Student role.`
      );
    } catch (error) {
      strapi.log.error(
        "Could not assign Student role to new user:",
        error
      );
    }
  };

  return plugin;
};