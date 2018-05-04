import {
  nestableFormatters,
  nonNestableFormatters
} from "./message-content-formatters";

const allFormatters = nonNestableFormatters.concat(nestableFormatters);

const unmatchedNode = text => {
  // return some react node
  // make this its own "formatter?"
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
  opts = {}
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
    ] = matchingFormatter.parseContent(remainingMessageContent, opts);

    const newNodeList = currentNodeList.concat([
      nodeForUnmatchedChars,
      nodeForMatchingContent
    ]);

    return getNodesForRest(
      newNodeList,
      newBlankUnmatchedChars,
      newRemainingContent,
      opts
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
    opts
  );
};

const messageTextToComponents = messageContent => {
  const listOfChildNodes = getNodesForRest([], "", messageContent, {
    nested: false
  });
  return listOfChildNodes;
};

export default messageTextToComponents;

messageTextToComponents("wrap me in bold");
