import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

const LoadingIcon = ({ className, size }) => {
  const iconClassName = cx(
    "fa",
    "fa-circle-o-notch",
    "fa-spin",
    "fa-fw",
    `fa-${size}x`,
    className
  );

  return <i className={iconClassName} />;
};

LoadingIcon.defaultProps = {
  className: "",
  size: 1
};

LoadingIcon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number
};

export default LoadingIcon;
