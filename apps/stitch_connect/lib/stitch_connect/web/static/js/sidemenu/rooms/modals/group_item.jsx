import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

class GroupItem extends Component {
  handleClick = () => {
    const { group, history, toggleModal } = this.props;
    toggleModal();
    history.push(`/groups/${group.slug}`);
  };

  render() {
    const { group } = this.props;
    return (
      <div className="group-item" onClick={this.handleClick}>
        <div className="content">
          <div className="name">
            <i className="fa fa-comments" /> {group.name}
            <span className="text-muted">#{group.slug}</span>
          </div>

          <div className="member-count text-muted">
            <i className="fa fa-user-o" />
            {group.user_count}
          </div>
        </div>

        <div className="description text-muted">
          {group.description}
        </div>
      </div>
    );
  }
}

export default withRouter(GroupItem);