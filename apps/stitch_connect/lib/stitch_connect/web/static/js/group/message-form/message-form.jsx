import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FormControl from "react-bootstrap/lib/FormControl";

@inject("messageStore")
@observer
class MessageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    };
  }

  onChangeMessage = evt => {
    this.setState({ message: evt.target.value });
  };

  onKeyPress = evt => {
    if (evt.key === "Enter") {
      this.props.messageStore.sendMessage(this.state.message).then(() => {
        this.setState({ message: "" });
      });
    }
  };

  render() {
    const { message } = this.state;
    return (
      <FormControl
        type="text"
        placeholder="Write something"
        value={message}
        onChange={this.onChangeMessage}
        onKeyPress={this.onKeyPress}
        required
      />
    );
  }
}

export default MessageForm;
