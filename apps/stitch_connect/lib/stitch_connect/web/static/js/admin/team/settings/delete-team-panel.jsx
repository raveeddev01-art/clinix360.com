import React, { Component } from "react";
import { observer } from "mobx-react";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Modal from "react-bootstrap/lib/Modal";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
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
          <Modal.Body>
            Please enter your team name to confirm your delete action.
            {error &&
              <p className="bg-danger">
                {error}
              </p>}
            <FormGroup>
              <ControlLabel>Team Name</ControlLabel>
              <FormControl
                type="text"
                value={teamName}
                onChange={this._onChangeTeamName}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this._onHideModal}>Close</Button>
            <Button bsStyle="danger" onClick={this._onDelete}>
              Confirm Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </SettingPanel>
    );
  }
}

export default DeleteTeamPanel;
