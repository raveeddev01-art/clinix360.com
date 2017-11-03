export function isAdmin() {
  return currentUser.roles.includes("admin");
}
