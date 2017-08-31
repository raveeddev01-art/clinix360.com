import React, { Component } from "react";
import { observer } from "mobx-react";

import AddonMessage from "../../../common/components/messages/addon-message";

@observer
class GlobalStarredMessage extends Component {
  render() {
    const { message } = this.props;

    return <AddonMessage message={message} />;
  }
}

export default GlobalStarredMessage;
