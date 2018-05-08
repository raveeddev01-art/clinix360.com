import REGEX from "lib/regex";
import {
  nestableFormatters,
  nonNestableFormatters,
  formatUnmatched,
  potentialFormatterMatch
} from "./message-content-formatters";

// =====================================================
// =====================================================
// Message Text to Components takes a basic string of
// text and converts it to a list of react nodes.
// It does this by iterating over each character, checking
// for a formatter that matches the remaining content
// starting from that character, calling the formatter to
// parse the content if so, and moving on to the remaining
// unformatted content.
// =====================================================
// =====================================================

// GET CONSTANTS
const allFormatters = nonNestableFormatters.concat(nestableFormatters);
const emojiRegex = REGEX.getEmoji();

// HELPERS
const isSolelyEmojis = messageContent => {
  return !messageContent.replace(emojiRegex, "").trim();
};

const getMatchingFormatter = (content, opts) => {
  const validFormatters = opts.nested ? nestableFormatters : allFormatters;

  // If not specific char, move onto next char
  if (!potentialFormatterMatch(content[0])) {
    return null;
  }

  return validFormatters.find(formatter => formatter.isMatch(content, opts));
};

const getUnformattedNode = (content, start, end) => {
  const unformattedString = content.slice(start, end + 1);
  return formatUnmatched(unformattedString, start);
};

// =====================================================
// getNodeList iterates over each character and compares
// the string from that character on to various formatters
// (bold, emoji, mention, etc). If a formatter matches,
// it adds a formatted node to a list and skips forward in
// the string. If no formatter matches, it moves on to the
// next character.
// =====================================================

const getNodeList = (messageContent, opts) => {
  const nodeList = [];
  let indexOfFirstUnformattedChar = 0;
  let currentIndex = 0;

  // START ITERATING THRU CHARACTERS
  while (currentIndex < messageContent.length) {
    const atEnd = currentIndex === messageContent.length - 1;
    const remainingMessageContent = messageContent.slice(currentIndex);
    const atStartOfLine =
      currentIndex === 0 || messageContent[currentIndex - 1] === "\n";

    const matchingFormatter = getMatchingFormatter(
      remainingMessageContent,
      Object.assign({}, opts, { atStartOfLine })
    );

    // CASE 1: AT END OF CONTENT
    // push any leftover unformatted content into the nodeList
    if (atEnd) {
      const unformattedNode = getUnformattedNode(
        messageContent,
        indexOfFirstUnformattedChar,
        currentIndex
      );

      nodeList.push(unformattedNode);

      currentIndex += 1;
    } else if (matchingFormatter) {
      // CASE 2: CURRENT CHAR MATCHES
      // get the formatted node and unformatted node (before
      // the current char), push both into the list, skip
      // to the end of the formatted content

      // get nodes to push to list
      const unformattedNode = getUnformattedNode(
        messageContent,
        indexOfFirstUnformattedChar,
        currentIndex - 1
      );

      const [
        nodeForMatchingContent,
        contentOffset
      ] = matchingFormatter.parseContent(
        remainingMessageContent,
        currentIndex,
        opts
      );

      // add nodes to the list
      nodeList.push(unformattedNode);
      nodeList.push(nodeForMatchingContent);

      // increment index to jump past formatted node
      currentIndex += contentOffset;
      indexOfFirstUnformattedChar = currentIndex;
    } else {
      // CASE 3: NO MATCH AND NOT AT END.
      // do nothing but continue to next char
      currentIndex += 1;
    }
  }

  return nodeList;
};

const messageTextToComponents = (messageContent, opts) => {
  const defaultOpts = {
    nested: false,
    isAllEmojis: isSolelyEmojis(messageContent)
  };

  const formattingOpts = Object.assign({}, defaultOpts, opts);
  return getNodeList(messageContent, formattingOpts);
};

export default messageTextToComponents;
