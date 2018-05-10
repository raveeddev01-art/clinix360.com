import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import DateTime from "react-datetime";

class SearchInputDatepicker extends Component {
  getViewDate = () => {
    const { dateChunk } = this.props;
    const parts = dateChunk.split("/");

    const year =
      parts[2] && parts[2].length === 4
        ? parseInt(parts[2], 10)
        : parseInt(moment().format("YYYY"), 10);
    const month = parts[0]
      ? parseInt(parts[0], 10) - 1
      : parseInt(moment().format("MM"), 10) - 1;

    return new Date(year, month);
  };

  handleChange = selectedMoment => {
    this.props.onSelect(selectedMoment.format("MM/DD/YYYY"));
  };

  handleMouseDown = (e) => {
    // used not to lose focus on input
    e.preventDefault();
    e.stopPropagation();
  }

  isFutureDate = date => moment().isAfter(date);

  render() {
    const { dateChunk } = this.props;

    return (
      <div className="search-input-menu search-input-menu--datepicker" onMouseDown={this.handleMouseDown}>
        <div className="menu-header">Time</div>
        <div className="menu-content">
          <DateTime
            open
            closeOnSelect
            input={false}
            timeFormat={false}
            onChange={this.handleChange}
            isValidDate={this.isFutureDate}
            viewDate={this.getViewDate(dateChunk)}
          />
        </div>
      </div>
    );
  }
}

SearchInputDatepicker.propTypes = {
  dateChunk: PropTypes.string,
  onSelect: PropTypes.func.isRequired
};

SearchInputDatepicker.defaultProps = {
  dateChunk: ""
};

export default SearchInputDatepicker;
