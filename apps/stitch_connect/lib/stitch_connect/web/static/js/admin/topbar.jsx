import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("teamStore", "presenceStore")
@observer
class Topbar extends Component {
  render() {
    const { onToggleSidebar } = this.props;

    return (
      <div className="flex-header admin-topbar">
        <a role="button" className="toggle-menu" onClick={onToggleSidebar}>
          <i className="fa fa-bars" />
          <i className="fa fa-times" />
          <span>Menu</span>
        </a>
        <span className="separator" />
        <h4>
          <i className="fa fa-sliders" /> Control Panel
        </h4>
        <ul className="nav navbar-nav">
          <li>
            <a
              href="https://teamstitch.zendesk.com/hc/en-us/categories/201817677-Connect"
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
            <a href="/">
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Launch</Tooltip>}
              >
                <i className="fa fa-rocket" />
              </OverlayTrigger>
            </a>
          </li>
          <li className="hidden-xss">
            <a role="link" onClick={this.props.presenceStore.lock}>
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Lockout</Tooltip>}
              >
                <i className="fa fa-lock" />
              </OverlayTrigger>
            </a>
          </li>
          <li className="hidden-xss">
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

Topbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired
};

export default withRouter(Topbar);
