import React, { Component } from "react";
import { observer } from "mobx-react";

import {
  Modal,
  HelpBlock,
  Form,
  Col,
  Alert,
  FormGroup,
  ControlLabel,
  FormControl,
  Button
} from "react-bootstrap";

import SettingPanel from "../../components/setting-panel/setting-panel.jsx";
import TeamStore from "../../stores/team_store";

const title = "Delete Team";
const description =
  "Deleting your team will remove all users and data. You won't be able to recover this information.";

// @TODO replace console.error and window.prompt with notification component
class DeleteTeamPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      error: "",
      teamName: ""
    };
  }

  _onHideModal = () => this.setState({ showModal: false });

  _onShowModal = () => this.setState({ showModal: true, error: "" });

  _onChangeTeamName = evt => {
    this.setState({ teamName: evt.target.value });
  };

  _onDelete = () => {
    if (this.state.teamName === TeamStore.instance.name) {
      TeamStore.instance.deleteTeam();
      this._onHideModal();
    } else {
      this.setState({ error: "Team name does not match" });
    }
  };

  render() {
    const { error, teamName, showModal } = this.state;
    return (
      <SettingPanel
        title={title}
        description={description}
        saveButtonText="Delete Team"
        onSave={this._onShowModal}
      >
        <HelpBlock>
          If you delete your team, all users will be unable to log into Stitch.
          Please be sure to export any data before proceeding. If you have any
          questions, please send us an email at&nbsp;
          <a href="mailto:support@teamstitch.com">support@teamstitch.com</a>
        </HelpBlock>

        <Modal show={showModal} onHide={this._onHideModal}>
          <Modal.Header>
            <Modal.Title>Delete Team</Modal.Title>
            <a href="#" onClick={this._onHideModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <h5>Please enter your team name to confirm your delete action.</h5>

            {error &&
              <Alert bsStyle="danger">
                {error}
              </Alert>}

            <Form horizontal>
              <FormGroup bsSize="large" className="m-b-10">
                <Col componentClass={ControlLabel} sm={3}>
                  Team Name
                </Col>

                <Col sm={9}>
                  <FormControl
                    type="text"
                    value={teamName}
                    onChange={this._onChangeTeamName}
                  />
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this._onHideModal}>
              Close
            </Button>
            <Button bsSize="large" bsStyle="danger" onClick={this._onDelete}>
              Confirm Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </SettingPanel>
    );
  }
}

export default DeleteTeamPanel;
