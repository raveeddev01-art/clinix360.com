import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("teamStore", "presenceStore", "adminPanelStore")
@observer
class Topbar extends Component {
  render() {
    const { adminPanelStore: { heading, icon } } = this.props;

    return (
      <div className="flex-header admin-topbar">
        <h4>
          <i className={`fa ${icon}`} /> {heading}
        </h4>
        <ul className="nav navbar-nav">
          <li>
            <a
              href="https://intercom.help/teamstitch"
              rel="noopener noreferrer"
              target="_blank"
            >
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Help</Tooltip>}
              >
                <i className="fa fa-question-circle" />
              </OverlayTrigger>
            </a>
          </li>
          <li>
            <a role="link" onClick={this.props.presenceStore.lock}>
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Lock Out</Tooltip>}
              >
                <i className="fa fa-lock" />
              </OverlayTrigger>
            </a>
          </li>
          <li>
            <a href="/logout">
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Sign Out</Tooltip>}
              >
                <i className="fa fa-sign-out" />
              </OverlayTrigger>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(Topbar);
