import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("teamStore", "presenceStore")
@observer
class Topbar extends Component {
  render() {
    const { onToggleSidebar, teamStore } = this.props;

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
              role="link"
              href="https://teamstitch.zendesk.com/hc/en-us/categories/201817677-Connect"
              target="_blank"
            >
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Help</Tooltip>}
              >
                <div>
                  <i className="fa fa-question-circle" />
                  <span>Help</span>
                </div>
              </OverlayTrigger>
            </a>
          </li>
          <li>
            <a role="link" href="/">
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Launch</Tooltip>}
              >
                <div>
                  <i className="fa fa-rocket" />
                  <span>Launch</span>
                </div>
              </OverlayTrigger>
            </a>
          </li>
          <li className="hidden-xss">
            <a role="link" href="#" onClick={this.props.presenceStore.lock}>
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Lockout</Tooltip>}
              >
                <div>
                  <i className="fa fa-lock" />
                  <span>Lockout</span>
                </div>
              </OverlayTrigger>
            </a>
          </li>
          <li className="hidden-xss">
            <a role="link" href="/logout">
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">Sign Out</Tooltip>}
              >
                <div>
                  <i className="fa fa-sign-out" />
                  <span>Sign Out</span>
                </div>
              </OverlayTrigger>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(Topbar);
