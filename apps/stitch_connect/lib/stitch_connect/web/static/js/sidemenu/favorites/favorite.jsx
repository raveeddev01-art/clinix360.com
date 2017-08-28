import React, { Component } from "react";
import { NavLink } from "react-router-dom";

export default class Favorite extends Component {
  render() {
    return (
      <NavLink
        to={`/groups/${this.props.room.slug}`}
        className="item"
        activeClassName="active"
      >
        <div className="item-icon">
          <i className="fa fa-comments" />
        </div>
        <div className="item-text">
          {this.props.room.name}
        </div>
        {this.props.room.mentions_count > 0 &&
          <div className="item-badge text-center">
            {this.props.room.mentions_count}
          </div>}
      </NavLink>
    );
  }
}
