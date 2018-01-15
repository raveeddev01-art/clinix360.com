const USER_MENTION_ENCODE = /@([a-z0-9]+)/g;
const USER_MENTION_DECODE = /<@U([0-9]+)>/;
const GROUP_MENTION_DECODE = /<@G(everyone|room|here)/;
const EMOJI = /((?::[^:]+:)(?::skin-tone-\d:)?)/g;
const SPLITTER = /(<@G[a-z]+>)|(<@U[0-9]+>)|((?::[^:]+:)(?::skin-tone-\d:)?)/g;

export default {
  USER_MENTION_ENCODE,
  USER_MENTION_DECODE,
  GROUP_MENTION_DECODE,
  EMOJI,
  SPLITTER
};
