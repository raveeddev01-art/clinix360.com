import React from "react";
import PropTypes from "prop-types";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

class DotOptions extends React.Component {
  onToggle = isOpen => {
    if (isOpen) {
      this.overlayTrigger.hide();
    }
  };

  render() {
    const { toggleAddonMenu } = this.props;

    return (
      <Dropdown id="dropdown-group-controls" pullRight onToggle={this.onToggle}>
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
          <MenuItem onSelect={toggleAddonMenu("directory")}>
            <i className="fa fa-users m-r-5" /> Directory
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("files")}>
            <i className="fa fa-folder-open m-r-5" /> Files
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("mentions")}>
            <i className="fa fa-at m-r-5" /> Mentions
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("starred")}>
            <i className="fa fa-star m-r-5" /> Starred
          </MenuItem>
          <MenuItem
            id="intercom-link"
            href="jig8cj9z@inbound.intercom-mail.com"
          >
            <i className="fa fa-bullhorn m-r-5" /> Live Support
          </MenuItem>
          <MenuItem
            target="_blank"
            rel="noopener noreferrer"
            href="https://intercom.help/teamstitch"
          >
            <i className="fa fa-question-circle m-r-5" /> Help Center
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

DotOptions.propTypes = {
  toggleAddonMenu: PropTypes.func.isRequired
};

export default DotOptions;
