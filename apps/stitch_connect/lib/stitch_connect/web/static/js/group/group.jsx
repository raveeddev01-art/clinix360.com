import React, { Component } from "react";

import { inject, observer } from "mobx-react";

import Chat from "./chat.jsx";
import Addons from "../addons/addons.jsx";
import TopNav from "./top-nav/top-nav.jsx";

@inject("groupStore")
@observer
export default class Group extends Component {
  componentDidMount() {
    this.loadGroup();
  }

  componentWillReceiveProps(nextProps) {
    this.loadGroup();
  }

  loadGroup() {
    const { slug } = this.props.match.params;
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
            <Chat />
            <Addons />
          </div>
        </div>
      </div>
    );
  }
}
