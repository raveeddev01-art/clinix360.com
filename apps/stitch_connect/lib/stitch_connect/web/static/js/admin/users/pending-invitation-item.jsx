import React, { Component, PropTypes } from "react";
import { Row, Col, Button } from "react-bootstrap";

class PendingInvitationItem extends Component {
  render() {
    return (
      <div className="table-item">
        <Row>
          <Col sm={8} className="email-column">
            {this.props.email}
          </Col>

          <Col sm={4} className="text-center">
            <Button onClick={this.props.onRevoke}>Revoke</Button>
            <Button onClick={this.props.onResend}>Resend</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

PendingInvitationItem.propTypes = {
  email: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  onRevoke: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired
};

export default PendingInvitationItem;
