import React from "react";
import UserMention from "./user-mention";

const renderMessage = (text, usernameMap) => {
  const words = text.split(" ");

  return words.reduce((prev, word, i) => {
    if (word.indexOf("@") === 0) {
      const username = word.substr(1);
      if (usernameMap[username]) {
        return prev.concat(
          <UserMention key={`usermention_${i}`} user={usernameMap[username]} />
        );
      }
    }

    if (typeof prev[prev.length - 1] === "string") {
      prev[prev.length - 1] += ` ${word}`;
      return prev;
    }

    return prev.concat(word);
  }, []);
};

export default renderMessage;
