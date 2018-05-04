// Applies pseudo-markdown to string of html

const tagsToReplacements = {
  "*": ["<b>", "</b>"],
  _: ["<i>", "</i>"],
  "~": ["<s>", "</s>"],
  "`": ["<code>", "</code>"]
};

const wrapResult = str => {
  return `<span>${str}</span>`;
};

const containsTagAtFirstChar = substr => {
  return Object.keys(tagsToReplacements).includes(substr[0]);
};

// TODO:
// - allow for multi-character tags
//   and tags with different opening
//   and closing chars
// - Make this much more clear (the indexes)
// - Handle empty strings between tags ("**")
// - Handle new lines

const applyFormatUntilClosingTag = string => {
  const tagChar = string[0];
  const rest = string.slice(1);

  const closingTagIndex = rest.indexOf(tagChar);
  const restIncludesClosingTag = closingTagIndex > 0;

  if (restIncludesClosingTag) {
    const opener = tagsToReplacements[tagChar][0];
    const closer = tagsToReplacements[tagChar][1];

    const toFormat = string.slice(0, closingTagIndex + 1);
    const unformattedRest = string.slice(closingTagIndex + 2);

    const formattedStart = toFormat
      .replace(tagChar, opener)
      .replace(tagChar, closer);

    return [formattedStart, unformattedRest];
  }

  return [tagChar, rest];
};

const formatString = (alreadyFormatted, toFormat) => {
  if (toFormat === "") {
    return alreadyFormatted;
  }

  if (containsTagAtFirstChar(toFormat)) {
    const [formattedBeginning, unformattedRest] = applyFormatUntilClosingTag(
      toFormat
    );

    const newAlreadyFormatted = alreadyFormatted + formattedBeginning;
    return formatString(newAlreadyFormatted, unformattedRest);
  }

  const newAlreadyFormatted = alreadyFormatted + toFormat[0];
  const newToFormat = toFormat.slice(1);
  return formatString(newAlreadyFormatted, newToFormat);
};

const formatMessageText = messageString => {
  return wrapResult(formatString("", messageString));
};

export default formatMessageText;
