import React from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

@inject("newsStore")
@observer
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
            <span>
              <i className="fa fa-ellipsis-v" />
              {this.props.newsStore.unreadNewsCount > 0 && (
                <span className="badge">
                  {this.props.newsStore.unreadNewsLabel}
                </span>
              )}
            </span>
          </OverlayTrigger>
        </Dropdown.Toggle>

        <Dropdown.Menu className="more-menu">
          <MenuItem onSelect={toggleAddonMenu("directory")}>
            <i className="fa fa-users m-r-5" /> Directory
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("files", "all")}>
            <i className="fa fa-files-o m-r-5" /> All Files
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("files", "yours")}>
            <i className="fa fa-folder-open m-r-5" /> Your Files
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("mentions")}>
            <i className="fa fa-at m-r-5" /> Mentions
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("starred")}>
            <i className="fa fa-star m-r-5" /> Starred
          </MenuItem>
          <MenuItem onSelect={toggleAddonMenu("Updates")}>
            <i className="fa fa-lightbulb-o m-r-5" /> Updates{" "}
            {this.props.newsStore.unreadNewsCount > 0 && (
              <span className="badge">
                {this.props.newsStore.unreadNewsLabel}
              </span>
            )}
          </MenuItem>
          {window.electronApp && (
            <MenuItem onSelect={toggleAddonMenu("downloads")}>
              <i className="fa fa-download m-r-5" /> Downloads
            </MenuItem>
          )}
          <MenuItem
            target="_blank"
            rel="noopener noreferrer"
            href="https://help.stitch.health"
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
