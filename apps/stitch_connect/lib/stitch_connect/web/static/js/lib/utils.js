import sortBy from "lodash/sortBy";

export function isAdmin() {
  return currentUser.roles && currentUser.roles.includes("admin");
}

export function getRoomNavLink(room) {
  const { slug, type, users } = room;

  if (type === "regular") {
    return `/rooms/${slug}`;
  }

  let dmUsers = users;

  if (dmUsers.length > 1) {
    dmUsers = dmUsers.filter(user => user.id !== currentUser.id);
  }

  if (type === "dm") {
    dmUsers = dmUsers.length ? dmUsers : [currentUser];
  } else {
    dmUsers = sortBy(dmUsers, "id");
  }

  return `/direct/${dmUsers.map(user => user.username).join(",")}`;
}

export function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}
