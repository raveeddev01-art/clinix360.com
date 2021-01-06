import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";

class TopBanner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showBanner: true,
    };
  }

  handleClose = () => {
    this.setState({ showBanner: false });
  };

  render() {
    const { showBanner } = this.state;

    if (showBanner) {
      return (
        <div id="top-banner">
          <div className="container">
            <span>
              Acquire, engage and retain patients with our integrated EHR,
              practice management and patient engagement solution.
            </span>
            <a href="http://dvlcloud.com">See InvoCom Manage</a>
          </div>

          <button className="close-btn" onClick={this.handleClose}>
            <i className="fal fa-times" />
          </button>
        </div>
      );
    }

    return <div id="top-banner" className="empty-banner" />;
  }
}

export default TopBanner;
