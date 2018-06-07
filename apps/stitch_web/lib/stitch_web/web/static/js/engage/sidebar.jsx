import React, { Component } from "react";
import { observer, inject } from "mobx-react";

@inject("teamStore", "userStore")
@observer
class Sidebar extends Component {
  render() {
    const { teamStore, userStore } = this.props;

    return (
      <div className="sidebar">
        <div className="flex-header">
          <div className="team-user">
            <h4 className="team-name">{teamStore.name}</h4>
            <div className="user-name">
              <span className="user-name__status-icon">
                <i className="fa fa-circle" />
              </span>
              <span className="user-name__text">{userStore.fullName}</span>
            </div>
          </div>
        </div>
        <div className="flex-container">
          <div className="placeholder-section">
            <div className="placeholder-heading" />
            <div className="placeholder-item-list">
              <div className="placeholder-avatar" />
              <div className="placeholder-name" />
            </div>

            <div className="placeholder-item-list">
              <div className="placeholder-avatar" />
              <div className="placeholder-name" />
            </div>

            <div className="placeholder-item-list">
              <div className="placeholder-avatar" />
              <div className="placeholder-name" />
            </div>
          </div>

          <div className="placeholder-section">
            <div className="placeholder-heading" />
            <div className="placeholder-item-list">
              <div className="placeholder-avatar" />
              <div className="placeholder-name" />
            </div>

            <div className="placeholder-item-list">
              <div className="placeholder-avatar" />
              <div className="placeholder-name" />
            </div>

            <div className="placeholder-item-list">
              <div className="placeholder-avatar" />
              <div className="placeholder-name" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
