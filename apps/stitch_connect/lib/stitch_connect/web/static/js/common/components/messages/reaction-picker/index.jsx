import React, { Component } from "react";
import PropTypes from "prop-types";
import { Picker } from "emoji-mart";

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

  render() {
    const { showPicker } = this.state;
    const { style, onSelectReaction } = this.props;
    if (!showPicker) {
      return null;
    }

    return (
      <Picker
        set="apple"
        autoFocus
        onClick={onSelectReaction}
        style={Object.assign(
          {
            position: "absolute",
            right: 4,
            zIndex: 2
          },
          style
        )}
      />
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
