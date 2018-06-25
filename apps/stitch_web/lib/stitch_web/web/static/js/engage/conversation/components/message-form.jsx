import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import Textarea from "react-textarea-autosize";

@inject("inboxStore")
@observer
class MessageForm extends Component {
  render() {
    const { inboxStore } = this.props;

    return (
      <div className="message-form-wrapper">
        <Textarea
          className="form-control"
          placeholder="Message"
          maxRows={30}
          maxLength="4000"
          onChange={this.onTextChange}
          onKeyUp={this.onKeyUp}
          onKeyDown={this.onKeyDown}
          onPaste={this.onPaste}
          autoFocus
          required
        />
      </div>
    );
  }
}

export default MessageForm;
