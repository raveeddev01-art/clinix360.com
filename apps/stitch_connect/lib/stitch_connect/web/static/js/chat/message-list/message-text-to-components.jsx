import {
  nestableFormatters,
  nonNestableFormatters,
  formatUnmatched
} from "./message-content-formatters";
import REGEX from "lib/regex";

const emojiRegex = REGEX.getEmoji();

const messageSolelyEmojis = messageContent => {
  return !messageContent.replace(emojiRegex, "").trim();
};

const allFormatters = nonNestableFormatters.concat(nestableFormatters);

const unmatchedNode = (text, i) => formatUnmatched(text, i);

const getMatchingFormatter = (content, opts) => {
  const validFormatters = opts.nested ? nestableFormatters : allFormatters;
  return validFormatters.find(formatter => formatter.matches(content, opts));
};

const getRemainingNodes = (
  currentNodeList,
  unmatchedCharacters,
  remainingMessageContent,
  opts,
  index = 0
) => {
  // CASE 1: END OF THE CHARACTER LIST (EXITS RECURSION)
  if (remainingMessageContent === "") {
    const nodeForUnmatchedChars = unmatchedNode(unmatchedCharacters, index + 1);
    return currentNodeList.concat([nodeForUnmatchedChars]);
  }

  const isFirstChar = !currentNodeList[0] && !unmatchedCharacters[0];

  const matchingFormatter = getMatchingFormatter(
    remainingMessageContent,
    Object.assign({}, opts, { isFirstChar })
  );

  // CASE 2: CURRENT SPOT IN STRING MATCHES A FORMATTER (CONTINUE RECURSION)
  if (matchingFormatter) {
    const nodeForUnmatchedChars = unmatchedNode(unmatchedCharacters, index + 1);
    const newBlankUnmatchedChars = "";

    const [
      nodeForMatchingContent,
      newRemainingContent
    ] = matchingFormatter.parseContent(remainingMessageContent, index, opts);

    const newNodeList = currentNodeList.concat([
      nodeForUnmatchedChars,
      nodeForMatchingContent
    ]);

    return getRemainingNodes(
      newNodeList,
      newBlankUnmatchedChars,
      newRemainingContent,
      opts,
      index + 2
    );
  }

  // CASE 3: CURRENT SPOT DOES NOT MATCH, BUT MORE CHARACTERS REMAIN (CONTINUE RECURSION)
  const newUnmatchedCaracters =
    unmatchedCharacters + remainingMessageContent.slice(0, 1);
  const newRemainingContent = remainingMessageContent.slice(1);

  return getRemainingNodes(
    currentNodeList,
    newUnmatchedCaracters,
    newRemainingContent,
    opts,
    index + 2
  );
};

const messageTextToComponents = (messageContent, opts) => {
  const initialNodeList = [];
  const initialUnmatchedChars = "";
  const topLevelOpts = {
    nested: false,
    isAllEmojis: messageSolelyEmojis(messageContent)
  };

  return getRemainingNodes(
    initialNodeList,
    initialUnmatchedChars,
    messageContent,
    Object.assign({}, topLevelOpts, opts)
  );
};

export default messageTextToComponents;
