import React, { Component } from "react";
import PropTypes from "prop-types";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import MemberTypeDropdown from "./member-type-dropdown";
import Groups from "../groups/groups";

class MemberType extends Component {
  renderGroup() {
    const { role, groupId } = this.props;
    const isMulti = role === "multi-room-guest";

    if (role === "member") {
      return null;
    }

    return (
      <FormGroup bsSize="large">
        <Col componentClass={ControlLabel} sm={3}>
          Room{isMulti ? "s" : ""}
        </Col>
        <Col sm={9}>
          <Groups
            value={groupId}
            onChange={this.props.onChangeGroup}
            multi={isMulti}
            type="regular"
          />
          <HelpBlock>
            Select {isMulti ? "rooms" : "a room"} for your guest to join.
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  }

  render() {
    const { role, onChangeRole } = this.props;

    return (
      <div className="member-type">
        <MemberTypeDropdown value={role} onChange={onChangeRole} />
        {this.renderGroup()}
      </div>
    );
  }
}

MemberType.propTypes = {
  groupId: PropTypes.any,
  role: PropTypes.string.isRequired,
  onChangeRole: PropTypes.func,
  onChangeGroup: PropTypes.func
};

MemberType.defaultProps = {
  groupId: null,
  onChangeRole: () => {},
  onChangeGroup: () => {}
};

export default MemberType;
