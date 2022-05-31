import React, { Component } from "react";
import PropTypes from "prop-types";
import { Picker } from "emoji-mart";
import cx from "classnames";

class EmojiPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      showPicker: false
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.state.showPicker && nextState.showPicker) {
      document.addEventListener("click", this.listenClick);
    } else if (this.state.showPicker && !nextState.showPicker) {
      document.removeEventListener("click", this.listenClick);
    }
  }

  onSelectEmoji = emoji => {
    this.setState({ showPicker: false }, () => {
      this.props.onSelectEmoji(emoji.colons);
    });
  };

  listenClick = e => {
    let { target } = e;
    while (target && target !== this.pickerEl && target !== document.body) {
      target = target.parentNode;
    }

    if (target !== this.pickerEl) {
      this.setState({ showPicker: false });
    }
  };

  togglePicker = () => {
    this.setState({ showPicker: !this.state.showPicker });
  };

  render() {
    const { showPicker } = this.state;

    console.log("props at picker", this.props);

    const { inThread } = this.props;
    const { onSelectEmoji } = this;

    console.log("In Thread Emoki Picker", inThread);

    return (
      <div className="emoji-picker-container">
        <div
          className={cx("emoji-picker-wrapper", { hidden: !showPicker })}
          ref={node => {
            this.pickerEl = node;
          }}
        >
          {showPicker && 
            <Picker set="apple" autoFocus onClick={onSelectEmoji} 
              style={Object.assign(
                {
                  zIndex: 11,
                  maxWidth: inThread ? "280px" : "initial",
                }
              )}
            />}
        </div>
        <a
          role="link"
          className="message-form-action-item"
          onClick={this.togglePicker}
        >
          <i className="fa fa-smile-o" />
        </a>
      </div>
    );
  }
}

EmojiPicker.propTypes = {
  onSelectEmoji: PropTypes.func.isRequired
};

EmojiPicker.defaultProps = {
  onSelectEmoji: () => {}
};

export default EmojiPicker;
