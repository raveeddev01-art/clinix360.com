import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export default class Room extends Component {
  render() {
    const { room: { slug, name, mentions_count: mentionsCount } } = this.props;
    return (
      <NavLink to={`/groups/${slug}`} className="item" activeClassName="active">
        <div className="item-icon">
          <i className="fa fa-comments" />
        </div>
        <div className="item-text">
          {name}
        </div>
        {mentionsCount > 0 &&
          <div className="item-badge text-center">
            {mentionsCount}
          </div>}
      </NavLink>
    );
  }
}
