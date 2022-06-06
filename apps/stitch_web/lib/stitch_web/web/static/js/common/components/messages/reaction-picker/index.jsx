import React, { Component } from "react";
import PropTypes from "prop-types";
import { Picker } from "emoji-mart";
import { Modal } from "react-bootstrap";

class ReactionPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      showPicker: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.show !== nextProps.show) {
      this.setState({ showPicker: nextProps.show });
    }
  }

  // capture outside click
  componentWillUpdate(nextProps, nextState) {
    if (!this.state.showPicker && nextState.showPicker) {
      document.addEventListener("click", this.listenClick);
    }

    if (this.state.showPicker && !nextState.showPicker) {
      document.removeEventListener("click", this.listenClick);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.listenClick);
  }

  listenClick = e => {
    let { target } = e;

    while (
      target &&
      !target.classList.contains("emoji-mart") &&
      target !== document.body
    ) {
      target = target.parentNode;
    }

    // check agains class list because emoji-mart doesn't support ref
    if (!target.classList.contains("emoji-mart")) {
      this.props.onSelectReaction();
    }

  };

  styleModal = (e) => {
    const { pos } = this.props;

    var root = document.getRootNode();
    var modalDialog = root.getElementsByClassName("modal-dialog")[0];
    var modalRect = modalDialog.getBoundingClientRect();

    modalDialog.style.position = "absolute";
    modalDialog.style.maxWidth = "max-content";
    modalDialog.style.width = "fit-content";
    modalDialog.style.left = pos.left - (modalRect.width/2) + "px";

    if(window.innerHeight - pos.y > modalRect.height) {
      modalDialog.style.top = pos.top + "px";
    } else {
      modalDialog.style.bottom = pos.bottom - pos.top + "px";
    }
  }

  renderPicker() {
    return (
      <Picker
        set="apple"
        autoFocus
        onClick={this.props.onSelectReaction}
      />
    );
  }

  render() {
    const { showPicker } = this.state;

    if (!showPicker) {
      return null;
    }

    return (
      <Modal
        onShow={this.styleModal}
        style={{position: "absolute"}} 
        animation={false}
        backdrop={false}
        show
      >
        {this.renderPicker()}
      </Modal>
    );
  }
}

ReactionPicker.propTypes = {
  show: PropTypes.bool.isRequired,
  style: PropTypes.object,
  onSelectReaction: PropTypes.func.isRequired
};

ReactionPicker.defaultProps = {
  show: false,
  style: {},
  onSelectReaction: () => {}
};

export default ReactionPicker;
