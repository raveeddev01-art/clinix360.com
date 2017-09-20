import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";

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
          <i className="fa fa-ellipsis-v" />
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
          <MenuItem>
            <i className="fa fa-flask" /> Labs
          </MenuItem>
          <MenuItem>
            <i className="fa fa-address-card-o" /> Referrals
          </MenuItem>
          <MenuItem>
            <i className="fa fa-check-square-o" /> Checklists
          </MenuItem>
          <MenuItem>
            <i className="fa fa-medkit" /> Prescriptions
          </MenuItem>
          <MenuItem>
            <i className="fa fa-bookmark-o" /> Clinical Notes
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
