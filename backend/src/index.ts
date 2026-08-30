import type { Core } from '@strapi/strapi';

const rolePermissions: Record<string, string[]> = {
  Student: [
    'api::course.course.find',
    'api::course.course.findOne',
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    'api::enrollment.enrollment.create',
    'api::lesson.lesson.findOne',
    'api::lesson.lesson.find',
    'api::lesson-progress.lesson-progress.find',
    'api::lesson-progress.lesson-progress.create',
    'api::lesson-progress.lesson-progress.findOne',
    'plugin::users-permissions.user.me',
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    'api::quiz-question.quiz-question.find',
    'api::quiz-question.quiz-question.findOne',
    'api::lesson-progress.lesson-progress.update',
  ],
  Instructor: [
    'api::course.course.find',
    'api::course.course.findOne',
    'api::course.course.create',
    'api::course.course.update',
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    'api::lesson.lesson.findOne',
    'api::lesson.lesson.find',
    'api::lesson.lesson.create',
    'api::lesson.lesson.update',
    'api::lesson-progress.lesson-progress.find',
    'api::lesson-progress.lesson-progress.findOne',
    'plugin::users-permissions.user.me',
    'api::course.course.delete',
    'api::lesson.lesson.delete',
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    'api::quiz.quiz.create',
    'api::quiz-question.quiz-question.find',
    'api::quiz-question.quiz-question.findOne',
    'api::quiz-question.quiz-question.create',
    'api::quiz.quiz.update',
    'api::quiz.quiz.delete',
    'api::quiz-question.quiz-question.update',
    'api::quiz-question.quiz-question.delete',
  ],
  Admin: [
    'api::course.course.create',
    'api::course.course.find',
    'api::course.course.update',
    'api::course.course.delete',
    'api::course.course.findOne',
    'api::enrollment.enrollment.create',
    'api::enrollment.enrollment.find',
    'api::enrollment.enrollment.findOne',
    'api::enrollment.enrollment.update',
    'api::enrollment.enrollment.delete',
    'api::lesson.lesson.find',
    'api::lesson.lesson.findOne',
    'api::lesson.lesson.create',
    'api::lesson.lesson.update',
    'api::lesson.lesson.delete',
    'api::lesson-progress.lesson-progress.create',
    'api::lesson-progress.lesson-progress.myProgress',
    'api::lesson-progress.lesson-progress.find',
    'api::lesson-progress.lesson-progress.findOne',
    'api::lesson-progress.lesson-progress.update',
    'api::lesson-progress.lesson-progress.delete',
    'plugin::users-permissions.user.me',
    'api::quiz.quiz.find',
    'api::quiz.quiz.findOne',
    'api::quiz.quiz.create',
    'api::quiz-question.quiz-question.find',
    'api::quiz-question.quiz-question.findOne',
    'api::quiz.quiz.update',
    'api::quiz.quiz.delete',
    'api::quiz-question.quiz-question.create',
    'api::quiz-question.quiz-question.update',
    'api::quiz-question.quiz-question.delete',
    'plugin::users-permissions.auth.callback',
    'plugin::users-permissions.auth.changePassword',
    'plugin::users-permissions.auth.resetPassword',
    'plugin::users-permissions.auth.refresh',
    'plugin::users-permissions.auth.logout',
    'plugin::users-permissions.auth.getSessions',
    'plugin::users-permissions.auth.revokeSession',
    'plugin::users-permissions.auth.connect',
    'plugin::users-permissions.auth.forgotPassword',
    'plugin::users-permissions.auth.register',
    'plugin::users-permissions.auth.emailConfirmation',
    'plugin::users-permissions.auth.sendEmailConfirmation',
    'plugin::users-permissions.user.create',
    'plugin::users-permissions.user.update',
    'plugin::users-permissions.user.find',
    'plugin::users-permissions.user.findOne',
    'plugin::users-permissions.user.count',
    'plugin::users-permissions.user.destroy',
    'plugin::users-permissions.role.createRole',
    'plugin::users-permissions.role.findOne',
    'plugin::users-permissions.role.find',
    'plugin::users-permissions.role.updateRole',
    'plugin::users-permissions.role.deleteRole',
    'plugin::users-permissions.permissions.getPermissions',
  ],
};

const roleTypes: Record<string, string> = {
  Student: 'student',
  Instructor: 'instructor',
  Admin: 'admin',
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const roleQuery = strapi.db.query('plugin::users-permissions.role');
    const permissionQuery = strapi.db.query(
      'plugin::users-permissions.permission'
    );

    for (const [name, actions] of Object.entries(rolePermissions)) {
      let role = await roleQuery.findOne({ where: { name } });

      if (!role) {
        role = await roleQuery.create({
          data: {
            name,
            type: roleTypes[name],
            description: `${name} role for the LMS`,
          },
        });
      }

      const existingPermissions = await permissionQuery.findMany({
        where: { role: role.id },
      });
      const existingActions = new Set(
        existingPermissions.map((permission) => permission.action)
      );

      for (const action of actions) {
        if (!existingActions.has(action)) {
          await permissionQuery.create({
            data: { action, role: role.id },
          });
        }
      }
    }

    const studentRole = await roleQuery.findOne({
      where: { type: roleTypes.Student },
    });

    if (studentRole) {
      const advancedStore = strapi.store({
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      });
      const advancedSettings = (await advancedStore.get()) || {};

      await strapi
        .store({
          type: 'plugin',
          name: 'users-permissions',
          key: 'advanced',
        })
        .set({
          value: {
            ...advancedSettings,
            default_role: studentRole.type,
          },
        });
    }
  },
};
