// THIS IS NO LONGER USED
// THIS IS NO LONGER USED
//      IGNORE THIS
// THIS IS NO LONGER USED
// THIS IS NO LONGER USED

// import linkifyHtml from "linkifyjs/html";

// // takes plain message content
// // - applies pseudo-markdown formatting
// // - converts it into renderable html
// // - converts links into anchor tags

// // =======================
// // Tag-specific formatters
// // and short circuits
// // =======================

// const hasNewlineBeforeClose = closingTag => str => {
//   const rest = str.slice(1);
//   const newLineIndex = rest.indexOf("\n");
//   return newLineIndex > -1 && newLineIndex < rest.indexOf(closingTag);
// };

// const hasMultiLineBlock = str => {
//   return str.slice(0, 3) === "```";
// };

// const addNewlineToEndIfNone = str => {
//   return str.slice(2).indexOf("\n") > -1 ? str : `${str}\n`;
// };

// const emptyBetweenTags = closingTag => str => {
//   const rest = str.slice(1);
//   return rest.replace(closingTag, "").trim() === "";
// };

// // ==================
// // Formatting tags &
// // associated rules
// // ==================

// const formattingTags = {
//   "```\n": {
//     open: '<pre><code class="codeblock">',
//     close: "</code></pre>",
//     closingTag: "```",
//     shortCircuits: []
//   },
//   ">": {
//     open: "<blockquote>",
//     close: "</blockquote> \n",
//     closingTag: "\n",
//     stringFormatter: addNewlineToEndIfNone,
//     shortCircuits: [emptyBetweenTags("\n")]
//   },
//   "*": {
//     open: "<b>",
//     close: "</b>",
//     shortCircuits: [hasNewlineBeforeClose("*"), emptyBetweenTags("*")]
//   },
//   _: {
//     open: "<i>",
//     close: "</i>",
//     shortCircuits: [hasNewlineBeforeClose("_"), emptyBetweenTags("_")]
//   },
//   "~": {
//     open: "<s>",
//     close: "</s>",
//     shortCircuits: [hasNewlineBeforeClose("~"), emptyBetweenTags("~")]
//   },
//   "`": {
//     open: "<code>",
//     close: "</code>",
//     shortCircuits: [
//       hasMultiLineBlock,
//       hasNewlineBeforeClose("`"),
//       emptyBetweenTags("`")
//     ]
//   }
// };

// // ==================
// // Helpers for stirng
// // to HTML conversion
// // ==================

// const identity = str => str;

// const getClosingTag = tagStr => {
//   return formattingTags[tagStr].closingTag || tagStr;
// };

// const containsTagAtFirstChar = substr => {
//   return Object.keys(formattingTags).some(tagStr => substr.startsWith(tagStr));
// };

// const getMatchingTagStr = substr => {
//   return Object.keys(formattingTags).find(tagStr => substr.startsWith(tagStr));
// };

// const getStringFormatter = tagStr => {
//   return formattingTags[tagStr].stringFormatter || identity;
// };

// const getShortCircuits = tagStr => {
//   return formattingTags[tagStr].shortCircuits || [];
// };

// // =======================
// // If a closing tag exists
// // and other conditions are met
// // (see rules)

// // applys transformation to substring
// // return transformedString, and new
// // starting point for the parent
// // =======================

// const applyFormatUntilClosingTag = initialString => {
//   const tagStr = getMatchingTagStr(initialString);
//   const string = getStringFormatter(tagStr)(initialString);
//   const rest = string.slice(1);

//   if (getShortCircuits(tagStr).some(fn => fn(string))) {
//     return [tagStr, rest];
//   }

//   const closingTag = getClosingTag(tagStr);

//   const closingTagIndex = rest.indexOf(closingTag) + 1;
//   const restIncludesClosingTag = closingTagIndex > 0;

//   if (restIncludesClosingTag) {
//     const opener = formattingTags[tagStr].open;
//     const closer = formattingTags[tagStr].close;

//     const toFormat = string.slice(0, closingTagIndex + closingTag.length);
//     const unformattedRest = rest.slice(closingTagIndex + closingTag.length - 1);

//     const formattedStart =
//       toFormat.replace(tagStr, opener).slice(0, -closingTag.length) + closer;

//     return [formattedStart, unformattedRest];
//   }

//   return [tagStr, rest];
// };

// // ===========================
// // Recursively format strings
// // Iterate down the string

// // If current substring (toFormat)
// // begins with a tag-string, potentially
// // convert the rest of the string

// //   if conditions are met (has closing tag)
// //   and other rules are met
// //   then convert part of string
// //   and continue iteration

// // If does not begin with tag-string,
// // move on to next character
// // ===========================

// const formatString = (alreadyFormatted, toFormat) => {
//   if (toFormat === "") {
//     return alreadyFormatted;
//   }

//   if (containsTagAtFirstChar(toFormat)) {
//     const [formattedBeginning, unformattedRest] = applyFormatUntilClosingTag(
//       toFormat
//     );

//     const newAlreadyFormatted = alreadyFormatted + formattedBeginning;
//     return formatString(newAlreadyFormatted, unformattedRest);
//   }

//   const newAlreadyFormatted = alreadyFormatted + toFormat[0];
//   const newToFormat = toFormat.slice(1);
//   return formatString(newAlreadyFormatted, newToFormat);
// };

// // ==================
// // Final tweaks to
// // make html-renderable
// // ==================

// const wrapResult = str => {
//   return `<div>${str}</div>`;
// };

// const replaceNewLines = str => {
//   return str.replace(/\n/g, "<br />");
// };

// // ==================
// // Public interface
// // ==================

// const formatMessageText = messageString => {
//   return linkifyHtml(
//     replaceNewLines(wrapResult(formatString("", messageString)))
//   );
// };

// export default formatMessageText;

// THIS IS NO LONGER USED
// THIS IS NO LONGER USED
//      IGNORE THIS
// THIS IS NO LONGER USED
// THIS IS NO LONGER USED
