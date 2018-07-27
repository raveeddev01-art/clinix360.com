import React, { Component } from "react";
import { observer, inject } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

@inject("patientsStore")
@observer
class Topbar extends Component {
  onToggle = isOpen => {
    if (isOpen) {
      this.overlayTrigger.hide();
    }
  };

  render() {
    const { patientsStore: { currentPatient } } = this.props;
    return (
      <div className="topbar">
        <div className="header-text">
          <h4>
            {currentPatient.first_name} {currentPatient.last_name}
          </h4>
        </div>

        <div className="header-nav">
          <Dropdown
            id="dropdown-group-controls"
            pullRight
            onToggle={this.onToggle}
          >
            <Dropdown.Toggle noCaret className="more-btn">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-more">More</Tooltip>}
                ref={ref => {
                  this.overlayTrigger = ref;
                }}
              >
                <i className="fa fa-ellipsis-v" />
              </OverlayTrigger>
            </Dropdown.Toggle>

            <Dropdown.Menu className="more-menu">
              <MenuItem
                id="intercom-link"
                href="jig8cj9z@inbound.intercom-mail.com"
              >
                <i className="fa fa-bullhorn m-r-5" /> Live Support
              </MenuItem>
              <MenuItem
                target="_blank"
                rel="noopener noreferrer"
                href="https://help.teamstitch.com"
              >
                <i className="fa fa-question-circle m-r-5" /> Help Center
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default Topbar;
