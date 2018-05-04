import React from "react";
import { Emoji } from "emoji-mart";
import REGEX from "lib/regex";
import UserMentionById from "../../common/components/messages/message-content/user-mention-by-id";
import messageTextToComponents from "./message-text-to-components";

const emojiRegex = REGEX.getEmoji();
const userMentionRegex = REGEX.getUserMentionEncode();
const groupMentionRegex = REGEX.getGroupMentionDecode();

// ============================
// ============================
// MATCHING AND PARSING HELPERS
// ============================
// ============================

const stringMatchingRegex = (string, regex) => {
  return string.match(regex)[0];
};

const stringAfterRegex = (string, regex) => {
  const substring = string.match(regex)[0];
  return string.slice(substring.length);
};

const startsWithAndHasAnother = (string, chars) => {
  return string.startsWith(chars) && string.slice(chars.length).includes(chars);
};

const stringBetweenOccurances = (string, chars) => {
  const withoutStartingOccurance = string.slice(chars.length);
  return withoutStartingOccurance.slice(
    0,
    withoutStartingOccurance.indexOf(chars)
  );
};

const stringAfterOccurance = (string, chars) => {
  return string.slice(string.indexOf(chars) + chars.length);
};

const stringAfterSecondOccurance = (string, chars) => {
  return stringAfterOccurance(stringAfterOccurance(string, chars), chars);
};

// ===============
// ===============
// FORMATTER RULES
// ===============
// ===============

const bold = {
  getNode: (parsedContent, i) => (
    <b key={i}> {messageTextToComponents(parsedContent, { nested: true })} </b>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "*"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "*"),
  isMatch: content => startsWithAndHasAnother(content, "*")
};

const italics = {
  getNode: (parsedContent, i) => (
    <i key={i}> {messageTextToComponents(parsedContent, { nested: true })} </i>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "_"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "_"),
  isMatch: content => startsWithAndHasAnother(content, "_")
};

const strike = {
  getNode: (parsedContent, i) => (
    <s key={i}> {messageTextToComponents(parsedContent, { nested: true })} </s>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "~"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "~"),
  isMatch: content => startsWithAndHasAnother(content, "~")
};

const highlight = {
  getNode: (parsedContent, i) => (
    <code key={i}>
      {" "}
      {messageTextToComponents(parsedContent, { nested: true })}{" "}
    </code>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "`"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "`"),
  isMatch: content => startsWithAndHasAnother(content, "`")
};

const blockQuote = {
  getNode: (parsedContent, i) => (
    <blockquote key={i}>
      {" "}
      {messageTextToComponents(parsedContent, { nested: true })}{" "}
    </blockquote>
  ),
  // TODO: break at a newline (or at the end!)
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

// TODO:
// - Properly get remaining
// - Properly check if matches
const emoji = {
  getNode: (parsedContent, i, opts = {}) => {
    const size = opts.allEmojis ? 32 : 18;
    return <Emoji key={i} emoji={parsedContent} size={size} />;
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, emojiRegex).slice(1, -1),
  getRemainingContent: content => stringAfterRegex(content, emojiRegex),
  isMatch: content => {
    const match = content.match(emojiRegex);
    return match && content.startsWith(match[0]);
  }
};

// TODO:
// - Properly get remaining
// - Properly check if matches
const userMention = {
  getNode: (parsedContent, i) => {
    return <UserMentionById key={i} id={parseInt(parsedContent, 10)} />;
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, userMentionRegex).slice(3, -1),
  getRemainingContent: content => stringAfterRegex(content, userMentionRegex),
  isMatch: content => {
    const match = content.match(userMentionRegex);
    return match && content.startsWith(match[0]);
  }
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
  getRemainingContent: content => stringAfterRegex(content, groupMentionRegex),
  isMatch: content => {
    const match = content.match(groupMentionRegex);
    return match && content.startsWith(match[0]);
  }
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
