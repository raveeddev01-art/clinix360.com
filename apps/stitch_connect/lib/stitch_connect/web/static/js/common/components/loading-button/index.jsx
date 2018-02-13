import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";

import LoadingIcon from "../loading-icon";

class LoadingButton extends Component {
  _renderLoadingIcon = () => {
    const { loading } = this.props;

    return loading && <LoadingIcon className="on-right" />;
  };

  render() {
    const { children, disabled, loading, ...otherProps } = this.props;
    return (
      <Button disabled={disabled || loading} {...otherProps}>
        {children}
        {this._renderLoadingIcon()}
      </Button>
    );
  }
}

LoadingButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  loading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired
};

LoadingButton.defaultProps = {
  children: null,
  loading: false,
  disabled: false
};

export default LoadingButton;
