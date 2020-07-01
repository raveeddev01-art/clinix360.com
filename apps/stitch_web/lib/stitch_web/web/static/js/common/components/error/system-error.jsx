import React from "react";
import PropTypes from "prop-types";

const reloadApp = (destination) => () => {
  window.location = destination;
};

// This almost the same as the raw html 500 page.
// If you change wording here, make sure to update it
// there as well.
const SystemError = ({ reloadDestination }) => (
  <div className="system_error">
    <div className="system_error__inner">
      <h2>
        <i className="fa fa-exclamation-triangle system_error__icon" />
        Clinix360 failed to load correctly
      </h2>
      <p>
        Looks like Clinix360 ran into an issue. Please reload by clicking below.
        If you continue to experience issues, please email us at{" "}
        <a href="mailto:support@dvlcloud.com">support@dvlcloud.com</a> and our
        support team will help you get back on track right away.
      </p>

      <div className="system_error__button-container">
        <button
          id="reload"
          className="system_error__button"
          onClick={reloadApp(reloadDestination)}
        >
          Reload
        </button>
      </div>
    </div>
  </div>
);

SystemError.propTypes = {
  reloadDestination: PropTypes.string,
};

SystemError.defaultProps = {
  reloadDestination: "/",
};

export default SystemError;
