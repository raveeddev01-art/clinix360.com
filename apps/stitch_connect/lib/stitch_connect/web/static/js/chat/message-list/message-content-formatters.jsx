import React from "react";
// FORMATTERS

// public interface

// matches -> takes a string of plain text,
// returns bool for whether start of string matches

// parseContent -> takes a string and opts
// returns a react node and a remaining string

// IMPORTANT! - the render method of each formatter
// passes its formatted message content into messageTextToComponents
// but with nested == true!

// private methods
// contentToChildContent - takes a string, removes the
// beginning and end tags from said string

// render - renders the wrapper around
// {messageTextToComponents(contentToChildContent(props.content), {nested: true})}

const BoldContent = props => (
  <b> {props.content} </b>;
);

const exampleFormatter = {
  matches: messageContent => !!messageContent,
  parseContent: messageContent => [
    <BoldContent content={messageContent} />, 
    messageContent.slice(1, 0)
  ]
};

export const nestableFormatters = [];
export const nonNestableFormatters = [exampleFormatter];
