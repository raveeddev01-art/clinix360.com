import React from "react";
import PropTypes from "prop-types";

class Toggle extends React.Component {
  render() {
    const { active, on, off, onClick } = this.props;

    return (
      <div
        className="toggle"
        role="checkbox"
        aria-checked={active}
        onClick={onClick}
      >
        <div className="toggle-text">{active ? on : off}</div>
        <span className="toggle-handle" />
      </div>
    );
  }
}

Toggle.propTypes = {
  active: PropTypes.bool.isRequired,
  on: PropTypes.any.isRequired,
  off: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Toggle;
