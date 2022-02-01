import React, { Component } from "react";

class FormattingCommands extends Component {
    render() {
    return (
      <div className="formatting-guide">
        <b onClick={(evt) => this.props.applyStyleEvent(evt, "bold")}>*bold*</b>
        <i onClick={(evt) => this.props.applyStyleEvent(evt, "italic")}>_italics_</i>
        <span onClick={(evt) => this.props.applyStyleEvent(evt, "strike")}>~strike~</span>
        <code onClick={(evt) => this.props.applyStyleEvent(evt, "highlight")}>`highlight`</code>
        <span onClick={(evt) => this.props.applyStyleEvent(evt, "quote")}>>quote</span>
      </div>
    );
  }
}

export default FormattingCommands;
