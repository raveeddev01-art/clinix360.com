import React, { Component } from "react";

class FormattingCommands extends Component {
    render() {
    return (
      <div className="formatting-guide">
        <code onClick={(evt) => this.props.applyStyleEvent(evt, "bold")}>
          <i className="fa fa-bold"></i>
        </code>
        <code onClick={(evt) => this.props.applyStyleEvent(evt, "italic")}>
          <i className="fa fa-italic"></i>
        </code>
        <code onClick={(evt) => this.props.applyStyleEvent(evt, "strike")}>
          <i className="fa fa-strikethrough"></i>
        </code>
        <code onClick={(evt) => this.props.applyStyleEvent(evt, "highlight")}>
          <i className="fa fa-code"></i>
        </code>
        <code onClick={(evt) => this.props.applyStyleEvent(evt, "quote")}>
          <i className="fa fa-quote-left"></i>
        </code>
      </div>
    );
  }
}

export default FormattingCommands;
