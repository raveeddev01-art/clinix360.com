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
// for a formatter that matches the reamining content
// starting from that character, and returning calling
// the formatter to parse the content if so (returning
// a formatted node).
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
// getRemainingNodes EXAMPLE:
// input: "this is *bold* and _italicized_ stuff"

// HALF WAY THRU ITERATION (at the first "_"):
// remainingMessageContent: "_italicized_ stuff"
// currentNodeList: [unformattedNode, boldNode]
// unmatchedCharacters: " and " <-- will eventually be an unformattedNode

// END OF ITERATION:
// remainingMessageContent: ""
// currentNodeList:
//   [unformattedNode1, boldNode, unformattedNode2, italicedNode, unformattedNode3]
// unmatchedCharacters: ""
// =====================================================

const getRemainingNodes = (
  remainingMessageContent,
  opts = {},
  currentNodeList = [],
  unmatchedCharacters = "",
  keyIndex = 0
) => {
  // CASE 1: END OF THE CONTENT (EXITS)
  if (remainingMessageContent === "") {
    const nodeForUnmatchedChars = formatUnmatched(
      unmatchedCharacters,
      keyIndex + 1
    );
    return currentNodeList.concat([nodeForUnmatchedChars]);
  }

  const isFirstChar = !currentNodeList[0] && !unmatchedCharacters[0];

  const matchingFormatter = getMatchingFormatter(
    remainingMessageContent,
    Object.assign({}, opts, { isFirstChar })
  );

  // CASE 2: CURRENT SPOT IN STRING MATCHES A FORMATTER (CONTINUES)
  // -> Add new nodes to list. Skip to content after the new node.
  if (matchingFormatter) {
    const nodeForUnmatchedChars = formatUnmatched(
      unmatchedCharacters,
      keyIndex + 1
    );
    const newBlankUnmatchedChars = "";

    const [
      nodeForMatchingContent,
      newRemainingContent
    ] = matchingFormatter.parseContent(remainingMessageContent, keyIndex, opts);

    const newNodeList = currentNodeList.concat([
      nodeForUnmatchedChars,
      nodeForMatchingContent
    ]);

    return getRemainingNodes(
      newRemainingContent,
      opts,
      newNodeList,
      newBlankUnmatchedChars,
      keyIndex + 2
    );
  }

  // CASE 3: CURRENT SPOT DOES NOT MATCH,
  // BUT MORE CHARACTERS REMAIN (CONTINUES)
  const newUnmatchedCaracters =
    unmatchedCharacters + remainingMessageContent.slice(0, 1);
  const newRemainingContent = remainingMessageContent.slice(1);

  return getRemainingNodes(
    newRemainingContent,
    opts,
    currentNodeList,
    newUnmatchedCaracters,
    keyIndex + 2
  );
};

const messageTextToComponents = (messageContent, opts) => {
  const defaultOpts = {
    nested: false,
    isAllEmojis: isSolelyEmojis(messageContent)
  };

  const formattingOpts = Object.assign({}, defaultOpts, opts);
  return getRemainingNodes(messageContent, formattingOpts);
};

export default messageTextToComponents;
