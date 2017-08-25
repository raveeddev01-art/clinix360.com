import React, { Component } from "react";

import { inject, observer } from "mobx-react";

import MessagePanel from "./message-panel";
import Addons from "../addons/addons";
import TopNav from "./top-nav/top-nav";

@inject("groupStore")
@observer
export default class Group extends Component {
  componentWillMount() {
    this.loadGroup(this.props.match.params.slug);
  }

  componentWillReceiveProps(nextProps) {
    this.loadGroup(nextProps.match.params.slug);
  }

  loadGroup(slug) {
    if (slug) {
      this.props.groupStore.loadGroupBySlug(slug);
    } else {
      this.props.groupStore.loadGroupBySlug("general");
    }
  }

  render() {
    return (
      <div className="chat-wrapper">
        <div id="main">
          <TopNav />
          <div className="flex-content">
            <MessagePanel />
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}
