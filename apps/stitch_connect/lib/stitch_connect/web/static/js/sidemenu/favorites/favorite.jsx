import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Favorite extends Component {
  render() {
    return (
      <Link to={`/groups/${this.props.room.slug}`} className="item">
        <div className="item-icon">
          <i className="fa fa-comments" />
        </div>
        <div className="item-text">
          {this.props.room.name}
        </div>
        {/*<div className="item-badge text-center">3</div>*/}
      </Link>
    );
  }
}
