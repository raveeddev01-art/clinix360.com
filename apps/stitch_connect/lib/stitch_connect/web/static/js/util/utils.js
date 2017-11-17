export function isAdmin() {
  return currentUser.roles && currentUser.roles.includes("admin");
}

export function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}
