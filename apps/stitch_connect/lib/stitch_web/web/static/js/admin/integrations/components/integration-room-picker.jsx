import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import omit from "lodash/omit";
import history from "lib/history";

import FormControl from "react-bootstrap/lib/FormControl";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import { Link } from "react-router-dom";

@inject("groupsStore", "integrationStore")
class IntegrationRoomPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groupId: this.props.groupsStore.regularGroups[0].id
    };
  }

  onChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: parseInt(value, 10)
    });
  };

  _handleFormSubmit = event => {
    event.preventDefault();

    const params = {
      appId: this.props.appId,
      groupId: this.state.groupId
    };

    this.props.integrationStore.createNewIntegration(params).then(data => {
      history.push(`/admin/integrations/drchrono/${data.id}/edit`);
    });
  };

  render() {
    return (
      <Form horizontal onSubmit={this._handleFormSubmit}>
        <FormGroup>
          <Col sm={5}>
            <p>
              Notifications that come in from {this.props.name} will be posted
              here.
            </p>
          </Col>
          <Col sm={7}>
            <FormControl
              name="groupId"
              onChange={this.onChange}
              componentClass="select"
              defaultValue={this.state.groupId}
            >
              {this.props.groupsStore.regularGroups.map(group => (
                <option key={`option-group-${group.id}`} value={group.id}>
                  {this.props.groupsStore.getGroupName(group)}
                </option>
              ))}
            </FormControl>
          </Col>
        </FormGroup>

        <ButtonToolbar>
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="pull-right"
          >
            Add Integration
          </Button>
        </ButtonToolbar>
      </Form>
    );
  }
}

IntegrationRoomPicker.propTypes = {
  name: PropTypes.string.isRequired,
  appId: PropTypes.number.isRequired
};

export default IntegrationRoomPicker;
