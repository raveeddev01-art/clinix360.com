import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal } from 'react-bootstrap';
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

  togglePicker = (e) => {
    this.setState({ showPicker: !this.state.showPicker });
  };

  styleModal = () => {
    var pos = this.pickerEl.getBoundingClientRect();
    var root = document.getRootNode();
    var modalDialog = root.getElementsByClassName("modal-dialog")[0];
    var modalRect = modalDialog.getBoundingClientRect();

    modalDialog.style.position = "absolute";
    modalDialog.style.maxWidth = "max-content";
    modalDialog.style.width = "fit-content";
    modalDialog.style.left = `${pos.left - (modalRect.width/2 + 50)}px`;

    if(window.innerHeight - pos.y > modalRect.height) {
      modalDialog.style.top = `${pos.top}px`;
    } else {
      modalDialog.style.bottom = `${pos.bottom - pos.top}px`;
    }
  }

  renderPicker() {
    return (
      <Modal
        onShow={this.styleModal}
        style={{position: "absolute"}} 
        animation={false}
        backdrop={false}
        show
      >
        <Picker
          set="apple"
          autoFocus
          onClick={this.onSelectEmoji}
        />
      </Modal>
    )
  }

  render() {
    const { showPicker } = this.state;

    return (
      <div className="emoji-picker-container">
        <div
          className={cx("emoji-picker-wrapper", { hidden: !showPicker })}
          ref={node => {
            this.pickerEl = node;
          }}
        >
          {showPicker && this.renderPicker()}
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
