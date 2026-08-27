export default (plugin: any) => {
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

  return plugin;
};