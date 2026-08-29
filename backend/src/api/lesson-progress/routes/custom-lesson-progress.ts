export default {
  routes: [
    {
      method: "GET",
      path: "/lesson-progresses/my-progress",
      handler: "lesson-progress.myProgress",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};