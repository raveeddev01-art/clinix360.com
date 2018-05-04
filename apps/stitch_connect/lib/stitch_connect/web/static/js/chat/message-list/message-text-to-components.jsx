import {
  nestableFormatters,
  nonNestableFormatters
} from "./message-content-formatters";

const allFormatters = nonNestableFormatters.concat(nestableFormatters);

// TODO: does this need to exist?
const unmatchedNode = text => {
  return text;
};

const getMatchingFormatter = (content, opts) => {
  const validFormatters = opts.nested ? nestableFormatters : allFormatters;
  return validFormatters.find(formatter => formatter.matches(content));
};

const getNodesForRest = (
  currentNodeList,
  unmatchedCharacters,
  remainingMessageContent,
  opts,
  index = 0
) => {
  // CASE 1: END OF THE CHARACTER LIST (EXITS RECURSION)
  if (remainingMessageContent === "") {
    const nodeForUnmatchedChars = unmatchedNode(unmatchedCharacters);
    return currentNodeList.concat([nodeForUnmatchedChars]);
  }

  const matchingFormatter = getMatchingFormatter(remainingMessageContent, opts);

  // CASE 2: CURRENT SPOT IN STRING MATCHES A FORMATTER (CONTINUE RECURSION)
  if (matchingFormatter) {
    const nodeForUnmatchedChars = unmatchedNode(unmatchedCharacters);
    const newBlankUnmatchedChars = "";

    const [
      nodeForMatchingContent,
      newRemainingContent
    ] = matchingFormatter.parseContent(remainingMessageContent, index);

    const newNodeList = currentNodeList.concat([
      nodeForUnmatchedChars,
      nodeForMatchingContent
    ]);

    return getNodesForRest(
      newNodeList,
      newBlankUnmatchedChars,
      newRemainingContent,
      opts,
      index + 1
    );
  }

  // CASE 3: CURRENT SPOT DOES NOT MATCH, BUT MORE CHARACTERS REMAIN (CONTINUE RECURSION)
  const newUnmatchedCaracters =
    unmatchedCharacters + remainingMessageContent.slice(0, 1);
  const newRemainingContent = remainingMessageContent.slice(1);

  return getNodesForRest(
    currentNodeList,
    newUnmatchedCaracters,
    newRemainingContent,
    opts,
    index + 1
  );
};

const messageTextToComponents = messageContent => {
  const listOfChildNodes = getNodesForRest([], "", messageContent, {
    nested: false
  });
  return listOfChildNodes;
};

export default messageTextToComponents;
