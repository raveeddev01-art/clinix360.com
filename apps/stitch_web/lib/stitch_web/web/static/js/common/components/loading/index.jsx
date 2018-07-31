import React from "react";
import PropTypes from "prop-types";
import { LoadingIcon } from "common/components";

const Loading = ({ title = "Loading" }) => (
  <div id="loading-screen-wrapper">
    <div className="text-center">
      <LoadingIcon className="m-b-20" size={3} />
      <h3>{title}...</h3>
    </div>
  </div>
);

Loading.propTypes = {
  title: PropTypes.string
};

Loading.defaultProps = {
  title: "Loading"
};

export default Loading;
