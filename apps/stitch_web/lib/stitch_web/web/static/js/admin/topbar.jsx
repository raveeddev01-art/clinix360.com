import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("teamStore", "presenceStore", "adminPanelStore")
@observer
class Topbar extends Component {
  render() {
    const {
      adminPanelStore: { heading, icon },
    } = this.props;

    return (
      <div className="flex-header admin-topbar">
        <h4>
          <span>
            <i className={`fa ${icon}`} /> {heading}
          </span>
        </h4>
        <ul className="nav navbar-nav">
          <li>
            <a
              href="https://help.dvlcloud.com"
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
            <Link to="/">
              <OverlayTrigger
                placement="bottom"
                container={this}
                overlay={<Tooltip id="tooltip-info">InvoCom</Tooltip>}
              >
                <i className="fa fa-comments" />
              </OverlayTrigger>
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(Topbar);
