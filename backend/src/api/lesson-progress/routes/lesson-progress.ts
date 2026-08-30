export default {
  routes: [
    {
      method: "POST",
      path: "/lesson-progresses",
      handler:
        "lesson-progress.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "GET",
      path: "/lesson-progresses/my-progress",
      handler:
        "lesson-progress.myProgress",
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "GET",
      path: "/lesson-progresses",
      handler:
        "lesson-progress.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "GET",
      path: "/lesson-progresses/:id",
      handler:
        "lesson-progress.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "PUT",
      path: "/lesson-progresses/:id",
      handler:
        "lesson-progress.update",
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: "DELETE",
      path: "/lesson-progresses/:id",
      handler:
        "lesson-progress.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};