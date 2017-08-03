import React, { Component } from "react";

export default class GroupItem extends Component {
  render() {
    const { group } = this.props;
    console.log(group);
    return (
      <div className="group-item">
        <div className="content">
          <div className="name">
            <i className="fa fa-comments" /> {group.name}
            <span className="text-muted">#{group.slug}</span>
          </div>

          <div className="member-count text-muted">
            <i className="fa fa-user-o" />
            54
          </div>
        </div>

        <div className="description text-muted">
          {group.description}
        </div>
      </div>
    );
  }
}
