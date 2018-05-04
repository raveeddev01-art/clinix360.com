import React from "react";
import { Emoji } from "emoji-mart";
import REGEX from "lib/regex";
import UserMentionById from "../../common/components/messages/message-content/user-mention-by-id";
import messageTextToComponents from "./message-text-to-components";

const emojiRegex = REGEX.getEmoji();
const userMentionRegex = REGEX.getUserMentionEncode();
const groupMentionRegex = REGEX.getGroupMentionDecode();

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

const bold = {
  getNode: toWrap => (
    <b> {messageTextToComponents(toWrap, { nested: true })} </b>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "*"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "*"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "*")
};

const italics = {
  getNode: toWrap => (
    <i> {messageTextToComponents(toWrap, { nested: true })} </i>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "_"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "_"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "_")
};

const strike = {
  getNode: toWrap => (
    <s> {messageTextToComponents(toWrap, { nested: true })} </s>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "~"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "~"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "~")
};

const highlight = {
  getNode: toWrap => (
    <code> {messageTextToComponents(toWrap, { nested: true })} </code>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "`"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "`"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "`")
};

const newline = {
  getNode: () => <br />,
  getWrappedContent: content => content,
  getRemainingContent: content => content.slice(1),
  matchesBeginningOfContent: content => content.startsWith("\n")
};

// TODO:
// - Properly get remaining
// - Properly check if matches
const emoji = {
  getNode: (parsedContent, i, opts = {}) => {
    const size = opts.allEmojis ? 32 : 18;
    return <Emoji key={`emoji_${i}`} emoji={parsedContent} size={size} />;
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, emojiRegex).slice(1, -1),
  getRemainingContent: content => stringAfterRegex(content, emojiRegex),
  matchesBeginningOfContent: content => {
    const match = content.match(emojiRegex);
    return match && content.startsWith(match[0]);
  }
};

// TODO:
// - Properly get remaining
// - Properly check if matches
const userMention = {
  getNode: (parsedContent, i) => {
    return (
      <UserMentionById
        key={`usermention_${i}`}
        id={parseInt(parsedContent, 10)}
      />
    );
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, userMentionRegex).slice(3, -1),
  getRemainingContent: content => stringAfterRegex(content, userMentionRegex),
  matchesBeginningOfContent: content => {
    const match = content.match(userMentionRegex);
    return match && content.startsWith(match[0]);
  }
};

const groupMention = {
  getNode: (parsedContent, i) => {
    return (
      <span key={`group_mention_${i}`} className="group-mention">
        @{parsedContent}
      </span>
    );
  },
  getWrappedContent: content =>
    stringMatchingRegex(content, groupMentionRegex).slice(3, -1),
  getRemainingContent: content => stringAfterRegex(content, groupMentionRegex),
  matchesBeginningOfContent: content => {
    const match = content.match(groupMentionRegex);
    return match && content.startsWith(match[0]);
  }
};

const makeFormatter = rules => {
  return {
    matches: rules.matchesBeginningOfContent,
    parseContent: (messageContent, i) => [
      rules.getNode(rules.getWrappedContent(messageContent), i),
      rules.getRemainingContent(messageContent)
    ]
  };
};

export const nestableFormatters = [
  emoji,
  userMention,
  groupMention,
  newline
].map(makeFormatter);

export const nonNestableFormatters = [bold, italics, strike, highlight].map(
  makeFormatter
);
