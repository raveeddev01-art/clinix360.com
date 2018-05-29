import React, { Component } from "react";
import PropTypes from "prop-types";

class HardRedirect extends Component {
  componentWillMount() {
    window.location.href = this.props.to;
  }

  render() {
    return null;
  }
}

HardRedirect.propTypes = {
  to: PropTypes.string.isRequired
};

export default HardRedirect;
