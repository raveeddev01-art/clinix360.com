import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

class TimstampTooltip extends Component {
  renderTootip() {
    const { timestamp, tooltipFormat } = this.props;
    return (
      <Tooltip id="date-tooltip">
        {moment
          .utc(timestamp)
          .local()
          .format(tooltipFormat)}
      </Tooltip>
    );
  }

  render() {
    const { timestamp, format, className } = this.props;

    return (
      <OverlayTrigger
        placement="top"
        delayShow={150}
        overlay={this.renderTootip()}
      >
        <span className={className}>
          {moment
            .utc(timestamp)
            .local()
            .format(format)}
        </span>
      </OverlayTrigger>
    );
  }
}

TimstampTooltip.propTypes = {
  timestamp: PropTypes.any,
  format: PropTypes.string,
  tooltipFormat: PropTypes.string,
  className: PropTypes.string
};

TimstampTooltip.defaultProps = {
  timestamp: null,
  format: "h:mm A",
  tooltipFormat: "MMM Do [at] h:mm A",
  className: ""
};

export default TimstampTooltip;
