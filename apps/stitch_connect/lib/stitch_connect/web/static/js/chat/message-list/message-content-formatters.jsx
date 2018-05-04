import React from "react";
import { Emoji } from "emoji-mart";
import UserMentionById from "../../common/components/messages/message-content/user-mention-by-id";
import messageTextToComponents from "./message-text-to-components";

// FORMATTERS

// public interface

// IMPORTANT! - the render method of each formatter
// passes its formatted message content into messageTextToComponents
// but with nested == true!

// render - renders the wrapper around
// {messageTextToComponents(contentToChildContent(props.content), {nested: true})}

// TODO: import this
const emojiRegex = /((?::[^\s:]+:)(?::skin-tone-\d:)?)/g;
const userMentionRegex = /<@U([0-9]+)>/;
const groupMentionRegex = /<@G(everyone|room|here)>/;

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
  wrap: toWrap => <b> {messageTextToComponents(toWrap, { nested: true })} </b>,
  getWrappedContent: content => stringBetweenOccurances(content, "*"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "*"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "*")
};

const italics = {
  wrap: toWrap => <i> {messageTextToComponents(toWrap, { nested: true })} </i>,
  getWrappedContent: content => stringBetweenOccurances(content, "_"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "_"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "_")
};

const strike = {
  wrap: toWrap => <s> {messageTextToComponents(toWrap, { nested: true })} </s>,
  getWrappedContent: content => stringBetweenOccurances(content, "~"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "~"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "~")
};

const highlight = {
  wrap: toWrap => (
    <code> {messageTextToComponents(toWrap, { nested: true })} </code>
  ),
  getWrappedContent: content => stringBetweenOccurances(content, "`"),
  getRemainingContent: content => stringAfterSecondOccurance(content, "`"),
  matchesBeginningOfContent: content => startsWithAndHasAnother(content, "`")
};

// TODO:
// - Wrap with key and size
// - Properly get remaining
// - Properly check if matches
const emoji = {
  wrap: emojiName => <Emoji key={`emoji_1`} emoji={emojiName} size={18} />,
  getWrappedContent: content =>
    stringMatchingRegex(content, emojiRegex).slice(1, -1),
  getRemainingContent: content => stringAfterRegex(content, emojiRegex),
  matchesBeginningOfContent: content => {
    const match = content.match(emojiRegex);
    return match && content.startsWith(match[0]);
  }
};

// TODO:
// - Wrap with key and size
// - Properly get remaining
// - Properly check if matches
const userMention = {
  wrap: parsedContent => {
    return (
      <UserMentionById key={`usermention_1`} id={parseInt(parsedContent, 10)} />
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
  wrap: parsedContent => {
    return (
      <GroupMentionById
        key={`usermention_1`}
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

const makeFormatter = rules => {
  return {
    matches: rules.matchesBeginningOfContent,
    parseContent: messageContent => [
      rules.wrap(rules.getWrappedContent(messageContent)),
      rules.getRemainingContent(messageContent)
    ]
  };
};

export const nestableFormatters = [emoji, userMention].map(makeFormatter);
export const nonNestableFormatters = [bold, italics, strike, highlight].map(
  makeFormatter
);
