import React, { Component } from "react";
import { Row, Col, Collapse, ButtonToolbar, Button } from "react-bootstrap";

export default class MemberItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  _toggleControls = () => {
    this.setState({ open: !this.state.open });
    console.log("Current state" + this.state.open);
  };

  render() {
    return (
      <div className="members-item">
        <Row>
          <Col sm={6} className="users-column">
            <div className="title">
              <i className="fa fa-circle" />
              <span className="name">{this.props.user.name}</span>{" "}
              <span className="username text-muted">
                {this.props.user.username}
              </span>
            </div>
            <div className="email text-muted">
              {this.props.user.email}
            </div>
          </Col>

          <Col sm={4} className="status-column text-center">
            Admin, Full Member
          </Col>

          <Col sm={2} className="actions-column text-center">
            <Button bsStyle="primary" onClick={this._toggleControls}>
              Manage
            </Button>
          </Col>

          <Collapse in={this.state.open}>
            <Col sm={12}>
              <ButtonToolbar>
                <Button bsSize="small">Convert to Guest</Button>
                <Button bsSize="small">Revoke Admin</Button>
                <Button bsSize="small" className="pull-right">
                  Disable Account
                </Button>
              </ButtonToolbar>
            </Col>
          </Collapse>
        </Row>
      </div>
    );
  }
}
