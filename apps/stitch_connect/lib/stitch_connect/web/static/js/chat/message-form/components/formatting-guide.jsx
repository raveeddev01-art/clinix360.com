import React, { Component } from "react";

class FormattingGuide extends Component {
  render() {
    return (
      <div className="formatting-guide">
        <b>*bold*</b>
        <i>_italics_</i>
        <span>~strike~</span>
        <code>`highlight`</code>
        <span>>quote</span>
      </div>
    );
  }
}

export default FormattingGuide;
