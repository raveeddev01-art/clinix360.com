import React from "react";
import { Emoji } from "emoji-mart";
import REGEX from "lib/regex";
import Linkify from "linkifyjs/react";
import UserMentionById from "../../common/components/messages/message-content/user-mention-by-id";
import messageTextToComponents from "./message-text-to-components";

const emojiRegex = REGEX.getEmoji();
const userMentionRegex = REGEX.getUserMentionDecode();
const groupMentionRegex = REGEX.getGroupMentionDecode();

// ============================
// ============================
// MATCHING AND PARSING HELPERS
// ============================
// ============================

const stringMatchingRegex = (string, regex) => {
  return string.match(regex)[0];
};

const stringAfterOccurance = (string, chars) => {
  return string.slice(string.indexOf(chars) + chars.length);
};

const getStringAfterRegex = regex => string => {
  const substring = string.match(regex)[0];
  return string.slice(substring.length);
};

const matchesAndStartsWithRegex = regex => string => {
  const match = string.match(regex);
  return match && string.startsWith(match[0]);
};

const startsWithAndHasAnother = chars => string => {
  return string.startsWith(chars) && string.slice(chars.length).includes(chars);
};

const stringBetweenOccurances = chars => string => {
  const withoutStartingOccurance = string.slice(chars.length);
  return withoutStartingOccurance.slice(
    0,
    withoutStartingOccurance.indexOf(chars)
  );
};

const stringAfterSecondOccurance = chars => string => {
  return stringAfterOccurance(stringAfterOccurance(string, chars), chars);
};

// ===============
// ===============
// FORMATTER RULES
// ===============
// ===============

// MISSING FORMATTERS
// - multiline quote (blue codeblock)
// - multiline blockquote

// OTHER TODOS:
// - stringBetweenOccurances breaks with a newline
// - Empty content causes, no match on various formatters
// - Implement isAllEmojis
// - Blockquote ends at newline or end of content
// - MOST IMPORTANT: add way to short circuit all of
//   this logic for speed purposes (if the char)
//   - will be done in message-text-to-components tho
// - ``` does not match ` rules
// - >>> does not match > rules

const bold = {
  getNode: (parsedContent, i) => (
    <b key={i}>
      {" "}
      {messageTextToComponents(parsedContent, {
        nested: true,
        isAllEmojis: false
      })}{" "}
    </b>
  ),
  getWrappedContent: stringBetweenOccurances("*"),
  getRemainingContent: stringAfterSecondOccurance("*"),
  isMatch: startsWithAndHasAnother("*")
};

const italics = {
  getNode: (parsedContent, i) => (
    <i key={i}>
      {" "}
      {messageTextToComponents(parsedContent, {
        nested: true,
        isAllEmojis: false
      })}{" "}
    </i>
  ),
  getWrappedContent: stringBetweenOccurances("_"),
  getRemainingContent: stringAfterSecondOccurance("_"),
  isMatch: startsWithAndHasAnother("_")
};

const strike = {
  getNode: (parsedContent, i) => (
    <s key={i}>
      {" "}
      {messageTextToComponents(parsedContent, {
        nested: true,
        isAllEmojis: false
      })}{" "}
    </s>
  ),
  getWrappedContent: stringBetweenOccurances("~"),
  getRemainingContent: stringAfterSecondOccurance("~"),
  isMatch: startsWithAndHasAnother("~")
};

const highlight = {
  getNode: (parsedContent, i) => (
    <code key={i}>
      {" "}
      {messageTextToComponents(parsedContent, {
        nested: true,
        isAllEmojis: false
      })}{" "}
    </code>
  ),
  getWrappedContent: stringBetweenOccurances("`"),
  getRemainingContent: stringAfterSecondOccurance("`"),
  isMatch: startsWithAndHasAnother("`")
};

// TODO: break at a newline OR at the end of the content
const blockQuote = {
  getNode: (parsedContent, i) => (
    <blockquote key={i}>
      {" "}
      {messageTextToComponents(parsedContent, {
        nested: true,
        isAllEmojis: false
      })}{" "}
    </blockquote>
  ),
  getWrappedContent: content => content.slice(1),
  getRemainingContent: () => "",
  isMatch: (content, opts) => opts.isFirstChar && content.startsWith(">")
};

const newline = {
  getNode: (parsedContent, i) => <br key={i} />,
  getWrappedContent: content => content,
  getRemainingContent: content => content.slice(1),
  isMatch: content => content.startsWith("\n")
};

const emoji = {
  getNode: (parsedContent, i, opts = {}) => {
    const size = opts.isAllEmojis ? 32 : 18;
    return <Emoji key={i} emoji={parsedContent} size={size} />;
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, emojiRegex).slice(1, -1),
  getRemainingContent: getStringAfterRegex(emojiRegex),
  isMatch: matchesAndStartsWithRegex(emojiRegex)
};

const userMention = {
  getNode: (parsedContent, i) => {
    return <UserMentionById key={i} id={parseInt(parsedContent, 10)} />;
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, userMentionRegex).slice(3, -1),
  getRemainingContent: getStringAfterRegex(userMentionRegex),
  isMatch: matchesAndStartsWithRegex(userMentionRegex)
};

const groupMention = {
  getNode: (parsedContent, i) => {
    return (
      <span key={i} className="group-mention">
        @{parsedContent}
      </span>
    );
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, groupMentionRegex).slice(3, -1),
  getRemainingContent: getStringAfterRegex(groupMentionRegex),
  isMatch: matchesAndStartsWithRegex(groupMentionRegex)
};

// ===============
// ===============
// MAKE FORMATTERS
// ===============
// ===============

const makeFormatter = rules => {
  return {
    matches: rules.isMatch,
    parseContent: (messageContent, i, opts = {}) => [
      rules.getNode(rules.getWrappedContent(messageContent), i, opts),
      rules.getRemainingContent(messageContent)
    ]
  };
};

// =============
// =============
//    EXPORTS
// =============
// =============

export const formatUnmatched = (content, i) => (
  <Linkify key={`link_${i}`}>{content}</Linkify>
);

export const nestableFormatters = [
  emoji,
  userMention,
  groupMention,
  newline
].map(makeFormatter);

export const nonNestableFormatters = [
  bold,
  italics,
  strike,
  highlight,
  blockQuote
].map(makeFormatter);
