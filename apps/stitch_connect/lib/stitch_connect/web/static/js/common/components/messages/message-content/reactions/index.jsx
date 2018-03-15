import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import { Emoji } from "emoji-mart";
import cx from "classnames";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

@inject("usersStore")
class Reactions extends Component {
  getTooltip = (userIds, emoji) => {
    const users = this.props.usersStore.usersById;
    const hasYou = userIds.indexOf(currentUser.id) > -1;
    const userList = userIds.filter(id => id !== currentUser.id).map(id => {
      const u = users[id];
      return `${u.first_name} ${u.last_name}`;
    });

    if (hasYou) {
      userList.push("You");
    }

    const lastUser = userList.pop();
    const names = [userList.join(", "), lastUser].filter(u => u).join(" and ");
    return `${names} reacted ${emoji}`;
  };

  toggleReaction = (emoji, active) => () => {
    // active param is not used for now
    this.props.onToggle(emoji, active);
  };

  render() {
    const { reactions, messageId } = this.props;
    if (!reactions) {
      return null;
    }

    return (
      <div className="message-reactions">
        {Object.keys(reactions).map(emoji => {
          const active = reactions[emoji].indexOf(currentUser.id) > -1;
          return (
            <OverlayTrigger
              placement="top"
              key={`${messageId}_${emoji}`}
              overlay={
                <Tooltip id={`${messageId}_${emoji}`}>
                  {this.getTooltip(reactions[emoji], emoji)}
                </Tooltip>
              }
            >
              <Button
                bsSize="xs"
                className={cx("btn-message-reaction", { active })}
                onClick={this.toggleReaction(emoji, !active)}
              >
                <Emoji emoji={emoji} size={14} />
                {reactions[emoji].length}
              </Button>
            </OverlayTrigger>
          );
        })}
      </div>
    );
  }
}

Reactions.propTypes = {
  reactions: PropTypes.object,
  messageId: PropTypes.any.isRequired,
  onToggle: PropTypes.func.isRequired
};

Reactions.defaultProps = {
  onToggle: () => {},
  reactions: null
};

export default Reactions;
