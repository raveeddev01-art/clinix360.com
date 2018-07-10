import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { FILE_TYPES } from "lib/constants";

class FileTypeSelector extends Component {
  render() {
    return (
      <Select
        id="file-type-select"
        options={FILE_TYPES}
        simpleValue
        clearable={false}
        searchable={false}
        value={this.props.currentType}
        onChange={this.props.onSelect}
      />
    );
  }
}

FileTypeSelector.propTypes = {
  currentType: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FileTypeSelector;
