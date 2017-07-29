import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";

export default class PendingInvitationItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="table-item">
        <Row>
          <Col sm={8} className="email-column">
            {this.props.user.email}
          </Col>

          <Col sm={4} className="text-center">
            <Button>Revoke</Button>
            <Button>Resend</Button>
          </Col>
        </Row>
      </div>
    );
  }
}
