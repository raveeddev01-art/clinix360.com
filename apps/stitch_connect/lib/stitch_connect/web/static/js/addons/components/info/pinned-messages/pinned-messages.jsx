import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("messageStore")
@observer
class PinnedMessages extends Component {
  render() {
    return <div />;
  }
}

export default PinnedMessages;
