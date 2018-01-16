import orderBy from "lodash/orderBy";
import uniq from "lodash/uniq";
import { UNICODE_PATTERN } from "lib/constants";

export function isAdmin() {
  return currentUser.roles && currentUser.roles.includes("admin");
}

export function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

export function dataURItoBlob(dataURI) {
  const binary = atob(dataURI.split(",")[1]);
  const array = [];
  for (let i = 0; i < binary.length; i += 1) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/png" });
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
  const uniqUserIds = uniq(users.map(user => user.id));

  return orderBy([...uniqUserIds, currentUser.id]);
}

/**
 * Filter users
 *
 * @param {array} users
 * @param {string} filter
 */
export function filterUsers(users, filter) {
  const re = new RegExp(filter, "i");

  return users.filter(
    user => re.test(user.full_name) || re.test(user.username)
  );
}

/**
 * Check if string contains only characters ()
 *
 * @param {string} text
 */
export function isValidUnicodeString(text) {
  const matched = text.match(UNICODE_PATTERN);
  return matched && matched.length === 1 && matched[0] === text;
}
