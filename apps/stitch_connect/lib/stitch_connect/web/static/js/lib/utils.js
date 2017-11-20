import orderBy from "lodash/orderBy";
import uniq from "lodash/uniq";

export function isAdmin() {
  return currentUser.roles && currentUser.roles.includes("admin");
}

export function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

/**
 * Return url of group
 * 
 * @param {Object} group 
 */
export function getGroupUrl(group) {
  if (!group) {
    return "";
  }

  const { type, slug } = group;

  if (type === "regular") {
    return `/rooms/${slug}`;
  }

  let users = group.users.slice();

  // Remove currentUser from users
  if (users.length > 1) {
    users = users.filter(user => user.id !== currentUser.id);
  }

  if (type === "dm") {
    users = users.slice(0, 1);
  } else {
    users = orderBy(users, ["id"]);
  }

  return `/direct/${users.map(user => user.username).join(",")}`;
}

export function getSlugOfDMGroupByUsers(userIds) {
  return `__dm:${userIds.join(".")}`;
}

/**
 * Return group users that has current user added
 * 
 * @param {array} users 
 */
export function getGroupUserIdsThatHasCurrentUser(users) {
  return orderBy(uniq([...users.map(user => user.id), currentUser.id]));
}
