import React from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

const InputErrorBlock = ({ children }) => {
  return (
    <HelpBlock className="text-left error-text">
      <i className="fa fa-exclamation-circle" /> {children}
    </HelpBlock>
  );
};

InputErrorBlock.propTypes = {
  children: PropTypes.node.isRequired
};

export default InputErrorBlock;
