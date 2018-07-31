import React, { Component } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

class FullPageBanner extends Component {
  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        backdrop="static"
        backdropClassName="white-backdrop"
        animation={false}
        id="full-page-banner"
      >
        {/* <a role="button" className="close-modal" onClick={this.props.onHide}>
          <i className="fa fa-close" />
        </a> */}

        <Modal.Body>
          <div className="flex-box">
            <div className="flex-item">
              <h1>The new Stitch experience is here</h1>

              <p>
                From messages and forms to files and tasks, Stitch lets you
                engage patients on every level.
              </p>

              <Button href="http://stitch.health">See the new Stitch</Button>

              <p className="subtext">
                Or,{" "}
                <a role="button" onClick={this.props.onHide}>
                  access Stitch Connect
                </a>{" "}
                for team messaging.
              </p>
            </div>

            <div className="flex-item hidden-xs hidden-sm">
              <img
                src="/images/engage-header.png"
                alt="Stitch Platform"
                className="img-responsive"
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

FullPageBanner.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
};

export default FullPageBanner;
