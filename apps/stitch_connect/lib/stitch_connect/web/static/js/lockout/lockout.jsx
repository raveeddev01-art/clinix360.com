import React, { Component } from "react";
import { observer, inject } from "mobx-react";

@inject("sidemenuStore")
@observer
class Lockout extends Component {
  unlock = () => {
    const { sidemenuStore } = this.props;

    sidemenuStore.unlock();
  };

  render() {
    return <div>Locked</div>;
  }
}

export default Lockout;
