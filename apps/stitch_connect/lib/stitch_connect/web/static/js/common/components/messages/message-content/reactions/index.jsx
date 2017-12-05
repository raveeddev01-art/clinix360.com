import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import { Emoji } from "emoji-mart";
import cx from "classnames";

class Reactions extends Component {
  toggleReaction = (emoji, active) => () => {
    // active param is not used for now
    this.props.onToggle(emoji, active);
  };

  render() {
    const { reactions, messageId } = this.props;
    return (
      <div className="message-reactions">
        {Object.keys(reactions).map(emoji => {
          const active = reactions[emoji].indexOf(currentUser.id) > -1;
          return (
            <Button
              bsSize="xs"
              className={cx("btn-message-reaction", { active })}
              key={`${messageId}_${emoji}_${Math.random()}`}
              onClick={this.toggleReaction(emoji, !active)}
            >
              <Emoji emoji={emoji} size={14} />
              {reactions[emoji].length}
            </Button>
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
  reactions: {},
  onToggle: () => {}
};

export default Reactions;
