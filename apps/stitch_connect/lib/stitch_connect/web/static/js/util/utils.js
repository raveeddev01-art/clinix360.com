export function isAdmin() {
  return currentUser.roles && currentUser.roles.includes("admin");
}
