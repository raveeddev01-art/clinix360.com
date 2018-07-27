import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/lib/Button";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";

@inject("patientsStore")
@observer
class TimelineActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth
    };

    this.calcWidth = this.updateWidth;
  }

  componentWillMount() {
    window.addEventListener("resize", this.calcWidth);
  }

  componentDidMount() {
    this.updateWidth();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.calcWidth);
  }

  updateWidth = () => {
    this.setState({ windowWidth: window.innerWidth });
  };

  render() {
    const { onComposeModalClick } = this.props;

    return (
      <div>
        {this.state.windowWidth > 1078 ? (
          <div>
            <Button onClick={onComposeModalClick}>Send Message</Button>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-info">Coming Soon!</Tooltip>}
              ref={ref => {
                this.tooltipOverlay = ref;
              }}
            >
              <Button onClick={this.onNoteModalClick}>Add Note</Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-info">Coming Soon!</Tooltip>}
              ref={ref => {
                this.tooltipOverlay = ref;
              }}
            >
              <Button onClick={this.onNoteModalClick}>Create Task</Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-info">Coming Soon!</Tooltip>}
              ref={ref => {
                this.tooltipOverlay = ref;
              }}
            >
              <Button onClick={this.onNoteModalClick}>Upload File</Button>
            </OverlayTrigger>
          </div>
        ) : (
          <DropdownButton title="Actions" id="dropdown-basic">
            <MenuItem onClick={onComposeModalClick}>
              <i className="fa fa-bullhorn" /> Send Message
            </MenuItem>
            <MenuItem disabled>
              <i className="fa fa-file-text" /> Add Note
            </MenuItem>
            <MenuItem disabled>
              <i className="fa fa-tasks" /> Create Task
            </MenuItem>
            <MenuItem disabled>
              <i className="fa fa-upload" /> Upload File
            </MenuItem>
          </DropdownButton>
        )}
      </div>
    );
  }
}

TimelineActions.propTypes = {
  onComposeModalClick: PropTypes.func
};

TimelineActions.defaultProps = {
  onComposeModalClick: () => undefined
};

export default TimelineActions;
