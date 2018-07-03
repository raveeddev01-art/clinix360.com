import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { FILE_TYPES } from "lib/constants";

const FileTypeSelector = ({ currentType, onSelect }) => {
  return (
    <Select
      id="file-type-select"
      options={FILE_TYPES}
      simpleValue
      clearable={false}
      searchable={false}
      value={currentType}
      onChange={onSelect}
    />
  );
};

FileTypeSelector.propTypes = {
  currentType: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FileTypeSelector;
