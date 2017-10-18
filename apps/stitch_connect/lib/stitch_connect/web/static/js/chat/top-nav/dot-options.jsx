import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("addonStore")
@observer
class DotOptions extends Component {
  _toggleAddonMenu = menuName => () => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel(menuName);
    addonStore.toggleAddons(true);
  };

  render() {
    return (
      <Dropdown id="dropdown-group-controls" pullRight>
        <Dropdown.Toggle noCaret className="more-btn">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-more">More</Tooltip>}
          >
            <i className="fa fa-ellipsis-v" />
          </OverlayTrigger>
        </Dropdown.Toggle>

        <Dropdown.Menu className="more-menu">
          <MenuItem onSelect={this._toggleAddonMenu("directory")}>
            <i className="fa fa-users" /> Directory
          </MenuItem>
          <MenuItem onSelect={this._toggleAddonMenu("files")}>
            <i className="fa fa-folder-open" /> Files
          </MenuItem>
          <MenuItem onSelect={this._toggleAddonMenu("mentions")}>
            <i className="fa fa-at" /> Mentions
          </MenuItem>
          <MenuItem onSelect={this._toggleAddonMenu("starred")}>
            <i className="fa fa-star" /> Starred
          </MenuItem>
          <MenuItem
            id="intercom-link"
            href="jig8cj9z@inbound.intercom-mail.com"
          >
            <i className="fa fa-bullhorn" /> Feedback
          </MenuItem>
          <MenuItem href="https://teamstitch.zendesk.com/hc/en-us">
            <i className="fa fa-question-circle" /> Help
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default DotOptions;
