import React from "react";
import PropTypes from "prop-types";

const Loading = ({ show }) => {
  return (
    show && (
      <div className="loading">
        <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw" />
      </div>
    )
  );
};

Loading.defaultProps = {
  show: false
};

Loading.propTypes = {
  show: PropTypes.bool.isRequired
};

export default Loading;
