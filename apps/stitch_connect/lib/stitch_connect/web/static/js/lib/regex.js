const getUserMentionEncode = () => /@([a-z0-9]+)/g;
const getUserMentionDecode = () => /<@U([0-9]+)>/;
const getGroupMentionDecode = () => /<@G(everyone|room|here)/;
const getEmoji = () => /((?::[^:]+:)(?::skin-tone-\d:)?)/g;
const getSplitter = () =>
  /(<@G[a-z]+>)|(<@U[0-9]+>)|((?::[^:]+:)(?::skin-tone-\d:)?)/g;

export default {
  getUserMentionDecode,
  getUserMentionEncode,
  getGroupMentionDecode,
  getEmoji,
  getSplitter
};
