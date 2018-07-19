import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import ButtonGroup from "react-bootstrap/lib/ButtonGroup";
import Button from "react-bootstrap/lib/Button";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Patient from "./patient";

@inject("patientsStore")
@observer
class Sidebar extends Component {
  render() {
    const { patientsStore } = this.props;

    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <h3>All Patients</h3>

          <div className="search-wrapper">
            <div className="flex-box">
              <Form className="flex-item" onSubmit={this.onSearch}>
                <i className="fa fa-search" />
                <FormControl type="text" placeholder="Search" />
              </Form>

              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="compose-message">Compose Message</Tooltip>
                }
              >
                <Button onClick={this.onComposeClick}>
                  <i className="fa fa-pencil-square-o" />
                </Button>
              </OverlayTrigger>
            </div>
          </div>

          <div className="selected-actions">
            <ButtonGroup>
              <Button>
                <i className="fa fa-bullhorn" />
              </Button>
              <Button>
                <i className="fa fa-tasks" />
              </Button>
              <Button>
                <i className="fa fa-pie-chart" />
              </Button>
              <Button>
                <i className="fa fa-trash" />
              </Button>
              <Button>
                <i className="fa fa-times" />
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="flex-content">
          <ul className="list-unstyled patients-list">
            {patientsStore.patientsForPage.map((patient, i) => (
              <Patient key={`patient_${i}`} patient={patient} />
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
