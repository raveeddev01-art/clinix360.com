import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import { isAdmin } from "lib/utils";
import { MEMBER_TYPE_OPTIONS } from "lib/constants";

class MemberTypeDropdown extends Component {

  getOptions() {
    return (isAdmin() ? MEMBER_TYPE_OPTIONS : [MEMBER_TYPE_OPTIONS[0]]);
  }  

  render() {
    const { value, onChange, label } = this.props;
    const option = MEMBER_TYPE_OPTIONS.find(opt => opt.value === value) || {};

    return (
      <FormGroup bsSize="large">
        <Col componentClass={ControlLabel} sm={3}>
          {label}
        </Col>

        <Col sm={9}>
          <Select
            className="multi-select-large"
            options={this.getOptions()}
            simpleValue
            value={value}
            onChange={onChange}
            clearable={false}
            searchable={false}
          />
          <HelpBlock>
            <b>{option.label}s</b> {option.description}
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  }
}

MemberTypeDropdown.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func
};

MemberTypeDropdown.defaultProps = {
  onChange: () => {},
  label: "Type"
};

export default MemberTypeDropdown;
