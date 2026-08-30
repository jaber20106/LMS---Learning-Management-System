/**
 * quiz router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::quiz.quiz",
  {
    config: {
      create: {
        policies: [
          "global::is-instructor-or-admin",
        ],
      },

      update: {
        policies: [
          "global::is-instructor-or-admin",
        ],
      },

      delete: {
        policies: [
          "global::is-instructor-or-admin",
        ],
      },
    },
  }
);