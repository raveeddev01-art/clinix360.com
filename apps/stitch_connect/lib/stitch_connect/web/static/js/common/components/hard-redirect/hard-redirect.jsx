import { Component } from "react";
import PropTypes from "prop-types";

// HardRedirect is used in a router when you want to redirect with
// an actual browswer reload. This is used to break an infinite loop
// at "/" currently.
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
