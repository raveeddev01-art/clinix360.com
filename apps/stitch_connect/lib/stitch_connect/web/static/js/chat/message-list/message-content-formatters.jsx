import React from "react";
import { Emoji } from "emoji-mart";
import { getData as getEmoji } from "emoji-mart/dist/utils";
import REGEX from "lib/regex";
import Linkify from "linkifyjs/react";
import UserMentionById from "../../common/components/messages/message-content/user-mention-by-id";
import messageTextToComponents from "./message-text-to-components";

// =====================================================
// =====================================================
// Message content formatters are given the a string of
// content starting at some specific character. (not the
// entire content string)

// isMatch checks if the substring matches at that char
// if so, they call parseContent on the substring

// parseContent returns two things:
// - a react node with the formatted content
// - the length of the formatted substring
//   so that the parent can jump past it

// EXAMPLE USAGE:
// const givenContent = "*this* is important"
// boldFormatter.isMatch(givenContent)
//   => true
// boldFormatter.parseContent(givenContent)
//   ==> [nodeForBoldedContent, 6]
// =====================================================
// =====================================================

// GET CONSTANTS
const emojiRegex = REGEX.getEmoji();
const userMentionRegex = REGEX.getUserMentionDecode();
const groupMentionRegex = REGEX.getGroupMentionDecode();
const searchDelimiter = "%&$&%";

// ============================
// ============================
// MATCHING AND PARSING HELPERS
// ============================
// ============================

// substring getters

const getStringMatchingRegex = (string, regex) => {
  return string.match(regex)[0];
};

const regexStringLength = regex => string => {
  return getStringMatchingRegex(string, regex).length;
};

const getContentUntilNewline = string => {
  return string.split("\n")[0];
};

const getStringBetweenOccurances = tag => string => {
  const withoutStartingOccurance = string.slice(tag.length);
  return withoutStartingOccurance.slice(
    0,
    withoutStartingOccurance.indexOf(tag)
  );
};

const lengthTilSecondOccurance = tag => string => {
  const withoutStartingOccurance = string.slice(tag.length);
  return withoutStartingOccurance.indexOf(tag) + tag.length * 2;
};

const trimFirstCharIfNewline = string => {
  return string[0] === "\n" ? string.slice(1) : string;
};

const getStringBetweenOccurancesAndTrimNewLines = tag => string => {
  const contentBetweenTags = getStringBetweenOccurances(tag)(string);
  return trimFirstCharIfNewline(contentBetweenTags);
};

// boolean checks

const matchesAndStartsWithRegex = regex => string => {
  const match = string.match(regex);
  return match && string.startsWith(match[0]);
};

const startsWithAndHasAnother = (tag, string) => {
  return string.startsWith(tag) && string.slice(tag.length).includes(tag);
};

const newLineIsBetweenOccurances = (tag, string) => {
  return getStringBetweenOccurances(tag)(string).includes("\n");
};

const blankIsBetweenOccurances = (tag, string) => {
  return !getStringBetweenOccurances(tag)(string).trim();
};

const firstCharNotSpace = (tag, string) => {
  return !!getStringBetweenOccurances(tag)(string)[0].trim();
};

const standardTagRules = tag => (string, opts) => {
  return (
    startsWithAndHasAnother(tag, string) &&
    !newLineIsBetweenOccurances(tag, string) &&
    !blankIsBetweenOccurances(tag, string) &&
    firstCharNotSpace(tag, string) &&
    opts.followingSpaceOrNewline
  );
};

const hasEmoji = content => {
  const emoji = getEmoji(content);
  return emoji && emoji.name;
};

// recall the formatter on content within tags
const renderNestedContent = (content, opts) => {
  const nestedOpts = {
    nested: true,
    isAllEmojis: false,
    inSearch: opts.inSearch
  };

  return messageTextToComponents(content, nestedOpts);
};

// ===============
// ===============
// FORMATTER RULES
// ===============
// ===============

// getNode: return react node with formatted content
// getWrappedContent: parse given content for interior
// of formatted node (usually remove tag character, ie "*"s)
// getContentOffset: lenght of formatted string (so called can
// jump past the now-formatted content)
// isMatch: return true or false depending on whether string
// should be formatted

// Formatters with inner content

const bold = {
  getNode: (parsedContent, i, opts) => (
    <b key={i}> {renderNestedContent(parsedContent, opts)} </b>
  ),
  getWrappedContent: getStringBetweenOccurances("*"),
  getContentOffset: lengthTilSecondOccurance("*"),
  isMatch: standardTagRules("*")
};

const italics = {
  getNode: (parsedContent, i, opts) => (
    <i key={i}> {renderNestedContent(parsedContent, opts)} </i>
  ),
  getWrappedContent: getStringBetweenOccurances("_"),
  getContentOffset: lengthTilSecondOccurance("_"),
  isMatch: standardTagRules("_")
};

const strike = {
  getNode: (parsedContent, i, opts) => (
    <s key={i}> {renderNestedContent(parsedContent, opts)} </s>
  ),
  getWrappedContent: getStringBetweenOccurances("~"),
  getContentOffset: lengthTilSecondOccurance("~"),
  isMatch: standardTagRules("~")
};

const multilineHighlight = {
  getNode: (parsedContent, i, opts) => (
    <div className="message-body-highlight full-width" key={i}>
      {renderNestedContent(parsedContent, opts)}
    </div>
  ),
  getWrappedContent: getStringBetweenOccurancesAndTrimNewLines("```"),
  getContentOffset: lengthTilSecondOccurance("```"),
  isMatch: content => {
    return (
      startsWithAndHasAnother("```", content) &&
      !blankIsBetweenOccurances("```", content)
    );
  }
};

const highlight = {
  getNode: (parsedContent, i, opts) => (
    <div className="message-body-highlight" key={i}>
      {renderNestedContent(parsedContent, opts)}
    </div>
  ),
  getWrappedContent: getStringBetweenOccurances("`"),
  getContentOffset: lengthTilSecondOccurance("`"),
  isMatch: string => {
    return (
      startsWithAndHasAnother("`", string) &&
      !newLineIsBetweenOccurances("`", string) &&
      !blankIsBetweenOccurances("`", string)
    );
  }
};

const multilineBlockquote = {
  getNode: (parsedContent, i, opts) => (
    <blockquote key={i}>
      {" "}
      {renderNestedContent(parsedContent.trim(), opts)}{" "}
    </blockquote>
  ),
  getWrappedContent: content => trimFirstCharIfNewline(content.slice(3)),
  getContentOffset: content => content.length, // go all the way to end
  isMatch: (content, opts) => {
    return (
      opts.atStartOfLine &&
      content.startsWith(">>>") &&
      !!content.slice(3).trim()
    );
  }
};

const blockQuote = {
  getNode: (parsedContent, i, opts) => (
    <blockquote key={i}>
      {" "}
      {renderNestedContent(parsedContent.trimRight(), opts)}{" "}
    </blockquote>
  ),
  getWrappedContent: content => getContentUntilNewline(content).slice(1),
  getContentOffset: content => {
    return getContentUntilNewline(content).length + 1; // 1 == "\n".length
  },
  isMatch: (content, opts) =>
    opts.atStartOfLine &&
    content.startsWith(">") &&
    getContentUntilNewline(content)
      .slice(1)
      .trim() &&
    content.trim() !== ">>>"
};

// Formatters without inner content

const newline = {
  getNode: (parsedContent, i) => <br key={i} />,
  getWrappedContent: content => content,
  getContentOffset: () => 1, // "\n".length
  isMatch: content => content.startsWith("\n")
};

const emoji = {
  getNode: (parsedContent, i, opts = {}) => {
    const size = opts.isAllEmojis ? 32 : 18;
    return <Emoji key={i} emoji={parsedContent} size={size} />;
  },
  getWrappedContent: content =>
    getStringMatchingRegex(content, emojiRegex).slice(1, -1),
  getContentOffset: regexStringLength(emojiRegex),
  isMatch: content =>
    matchesAndStartsWithRegex(emojiRegex)(content) &&
    hasEmoji(getStringMatchingRegex(content, emojiRegex).slice(1, -1))
};

const userMention = {
  getNode: (parsedContent, i) => {
    return <UserMentionById key={i} id={parseInt(parsedContent, 10)} />;
  },
  getWrappedContent: content =>
    getStringMatchingRegex(content, userMentionRegex).slice(3, -1),
  getContentOffset: regexStringLength(userMentionRegex),
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
    getStringMatchingRegex(content, groupMentionRegex).slice(3, -1),
  getContentOffset: regexStringLength(groupMentionRegex),
  isMatch: matchesAndStartsWithRegex(groupMentionRegex)
};

const searchHighlight = {
  getNode: (parsedContent, i) => {
    return (
      <span key={i} className="message-body-search-highlight">
        {parsedContent}
      </span>
    );
  },
  getWrappedContent: getStringBetweenOccurances(searchDelimiter),
  getContentOffset: lengthTilSecondOccurance(searchDelimiter),
  isMatch: (content, opts) => {
    return opts.inSearch && startsWithAndHasAnother(searchDelimiter, content);
  }
};

// ===============
// ===============
// MAKE FORMATTERS
// ===============
// ===============

const makeFormatter = rules => {
  return {
    isMatch: rules.isMatch,
    parseContent: (messageContent, i, opts = {}) => [
      rules.getNode(rules.getWrappedContent(messageContent), i, opts),
      rules.getContentOffset(messageContent)
    ]
  };
};

// =============
// =============
//    EXPORTS
// =============
// =============

// used to bypass all formatter checks for speed improvement
const potentialFormatterChars = new Set([
  "*",
  "_",
  "~",
  "`",
  "\n",
  ">",
  "<",
  ":",
  "%"
]);
export const potentialFormatterMatch = char => {
  return potentialFormatterChars.has(char);
};

export const formatUnmatched = (content, i) => (
  <Linkify key={`link_${i}`}>{content}</Linkify>
);

export const nestableFormatters = [
  emoji,
  userMention,
  groupMention,
  newline,
  searchHighlight
].map(makeFormatter);

// note: multilines must precede single-line versions
export const nonNestableFormatters = [
  multilineBlockquote,
  multilineHighlight,
  bold,
  italics,
  strike,
  highlight,
  blockQuote
].map(makeFormatter);
