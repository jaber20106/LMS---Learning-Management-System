/**
 * lesson router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::lesson.lesson",
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