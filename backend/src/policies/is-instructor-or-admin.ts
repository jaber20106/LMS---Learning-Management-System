export default async (
  policyContext: any,
  config: any,
  { strapi }: any
) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  const roleName =
    user.role?.name?.toLowerCase() || "";

  return (
    roleName === "instructor" ||
    roleName === "admin"
  );
};