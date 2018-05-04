// takes plain message content
// - applies pseudo-markdown formatting
// - and converts it into renderable html

const hasNewlineBeforeClose = closingTag => str => {
  const rest = str.slice(1);
  const newLineIndex = rest.indexOf("\n");
  return newLineIndex > -1 && newLineIndex < rest.indexOf("\n");
};

const hasMultiLineBlock = str => {
  return str.slice(0, 3) === "```";
};

const addNewlineToEndIfNone = str => {
  return str.slice(2).indexOf("\n") > -1 ? str : `${str}\n`;
};

const emptyBetweenTags = closingTag => str => {
  const rest = str.slice(1);
  return rest.replace(closingTag, "").trim() === "";
};

const formattingTags = {
  "```\n": {
    open: '<pre><code class="codeblock">',
    close: "</code></pre>",
    closingTag: "```",
    shortCircuits: []
  },
  ">": {
    open: "<blockquote>",
    close: "</blockquote> \n",
    closingTag: "\n",
    stringFormatter: addNewlineToEndIfNone,
    shortCircuits: [emptyBetweenTags("\n")]
  },
  "*": {
    open: "<b>",
    close: "</b>",
    shortCircuits: [hasNewlineBeforeClose("*"), emptyBetweenTags("*")]
  },
  _: {
    open: "<i>",
    close: "</i>",
    shortCircuits: [hasNewlineBeforeClose("_"), emptyBetweenTags("_")]
  },
  "~": {
    open: "<s>",
    close: "</s>",
    shortCircuits: [hasNewlineBeforeClose("~"), emptyBetweenTags("~")]
  },
  "`": {
    open: "<code>",
    close: "</code>",
    shortCircuits: [
      hasMultiLineBlock,
      hasNewlineBeforeClose("`"),
      emptyBetweenTags("`")
    ]
  }
};

const identity = str => str;

const getClosingTag = tagStr => {
  return formattingTags[tagStr].closingTag || tagStr;
};

const wrapResult = str => {
  return `<span>${str}</span>`;
};

const replaceNewLines = str => {
  return str.replace(/\n/g, "<br />");
};

const containsTagAtFirstChar = substr => {
  return Object.keys(formattingTags).some(tagStr => substr.startsWith(tagStr));
};

const getMatchingTagStr = substr => {
  return Object.keys(formattingTags).find(tagStr => substr.startsWith(tagStr));
};

const getStringFormatter = tagStr => {
  // certain may need to format the following substring
  return formattingTags[tagStr].stringFormatter || identity;
};

const getShortCircuits = tagStr => {
  return formattingTags[tagStr].shortCircuits || [];
};

const applyFormatUntilClosingTag = initialString => {
  const tagStr = getMatchingTagStr(initialString);
  const string = getStringFormatter(tagStr)(initialString);
  const rest = string.slice(1);

  if (getShortCircuits(tagStr).some(fn => fn(string))) {
    return [tagStr, rest];
  }

  const closingTag = getClosingTag(tagStr);

  const closingTagIndex = rest.indexOf(closingTag) + 1;
  const restIncludesClosingTag = closingTagIndex > 0;

  if (restIncludesClosingTag) {
    const opener = formattingTags[tagStr].open;
    const closer = formattingTags[tagStr].close;

    const toFormat = string.slice(0, closingTagIndex + closingTag.length);
    const unformattedRest = rest.slice(closingTagIndex + closingTag.length - 1);

    const formattedStart =
      toFormat.replace(tagStr, opener).slice(0, -closingTag.length) + closer;

    return [formattedStart, unformattedRest];
  }

  return [tagStr, rest];
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
  return replaceNewLines(wrapResult(formatString("", messageString)));
};

export default formatMessageText;
