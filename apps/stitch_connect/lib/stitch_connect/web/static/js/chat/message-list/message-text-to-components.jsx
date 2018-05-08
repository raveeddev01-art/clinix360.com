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

// =====================================================
// TODO: Add new explanation
// =====================================================

const getUnformattedNode = (content, start, end) => {
  const unformattedString = content.slice(start, end + 1);
  return formatUnmatched(unformattedString, start);
};

const getNodeList = (messageContent, opts) => {
  const nodeList = [];
  let indexOfFirstUnformattedChar = 0;
  let currentIndex = 0;
  let atEnd;
  let remainingMessageContent;

  // START ITERATING THRU CHARACTERS
  while (currentIndex < messageContent.length) {
    atEnd = currentIndex === messageContent.length - 1;
    remainingMessageContent = messageContent.slice(currentIndex);

    const matchingFormatter = getMatchingFormatter(
      remainingMessageContent,
      Object.assign({}, opts, { isFirstChar: currentIndex === 0 })
    );

    if (atEnd) {
      // CASE 1: AT END OF STRING, FORMAT UNFORMATTED CONTENT
      nodeList.push(
        getUnformattedNode(
          messageContent,
          indexOfFirstUnformattedChar,
          currentIndex
        )
      );

      currentIndex += 1;
    } else if (matchingFormatter) {
      // CASE 2: CURRENT CHAR MATCHES

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
        // TODO: make this nicer
        currentIndex + 5000,
        opts
      );

      // add nodes to the list
      nodeList.push(unformattedNode);
      nodeList.push(nodeForMatchingContent);

      currentIndex += contentOffset;
      indexOfFirstUnformattedChar = currentIndex;
    } else {
      // CASE 3: NO MATCH AND NOT AT END.
      // - continue to next char
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
