import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Modal from "react-bootstrap/lib/Modal";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Alert from "react-bootstrap/lib/Alert";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";

import SettingPanel from "../../components/setting-panel/setting-panel";

const title = "Delete Team";
const description =
  "Deleting your team will remove all users and data. You won't be able to recover this information.";

@inject("teamStore")
@observer
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

  _onShowModal = () => {
    this.setState({ showModal: true, error: "" });
    return Promise.resolve();
  };

  _onChangeTeamName = evt => {
    this.setState({ teamName: evt.target.value });
  };

  _onDelete = () => {
    const { teamStore } = this.props;
    if (this.state.teamName === teamStore.name) {
      teamStore.deleteTeam();
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

        <Modal
          show={showModal}
          onHide={this._onHideModal}
          className="delete-team-modal"
        >
          <Modal.Header>
            <Modal.Title>Delete Team</Modal.Title>
            <a onClick={this._onHideModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <h5>Please enter your team name to confirm your delete action.</h5>

            {error && <Alert bsStyle="danger">{error}</Alert>}

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
