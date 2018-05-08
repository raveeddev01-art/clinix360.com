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

  isFutureDate = date => moment().isAfter(date);

  render() {
    const { dateChunk } = this.props;

    return (
      <div className="search-input-datepicker">
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
