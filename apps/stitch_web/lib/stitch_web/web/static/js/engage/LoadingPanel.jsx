import React, { Component } from "react";

class LoadingPanel extends Component {
  render() {
    return (
      <div className="chat-container">
        <div className="topbar loading__topbar">
          <div className="title-holder">
            <div className="title" />
          </div>

          <div className="header-nav">
            <div className="item" />
            <div className="item" />
            <div className="item" />
          </div>
        </div>

        <div className="messages-container loading__messages-container">
          <div className="message">
            <div className="avatar" />
            <div className="content">
              <div className="line" />
              <div className="line" />
              <div className="line" />
            </div>
          </div>

          <div className="message">
            <div className="avatar" />
            <div className="content">
              <div className="line" />
              <div className="line" />
              <div className="line" />
            </div>
          </div>

          <div className="message">
            <div className="avatar" />
            <div className="content">
              <div className="line" />
              <div className="line" />
              <div className="line" />
            </div>
          </div>

          <div className="message">
            <div className="avatar" />
            <div className="content">
              <div className="line" />
              <div className="line" />
              <div className="line" />
            </div>
          </div>

          <div className="input" />
        </div>
      </div>
    );
  }
}

export default LoadingPanel;
