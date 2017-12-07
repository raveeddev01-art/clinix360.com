const MENTION_ENCODE = /@([a-z0-9]+)/g;
const MENTION_DECODE = /<@U([0-9]+)>/;
const EMOJI = /((?::[^:]+:)(?::skin-tone-\d:)?)/g;
const SPLITTER = /(<@U[0-9]+>)|((?::[^:]+:)(?::skin-tone-\d:)?)/g;

export default {
  MENTION_ENCODE,
  MENTION_DECODE,
  EMOJI,
  SPLITTER
};
