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
  };

  render() {
    const { user, online } = this.props;

    return (
      <div className="table-item">
        <Row>
          <Col sm={6} className="users-column">
            <div className="title">
              {online
                ? <i className="fa fa-circle" />
                : <i className="fa fa-circle-o" />}
              <span className="name">{`${user.first_name} ${user.last_name}`}</span>{" "}
              <span className="username text-muted">{user.username}</span>
            </div>
            <div className="email text-muted">
              {user.email}
            </div>
          </Col>

          <Col sm={4} className="status-column text-center">
            {user.roles.join(",")}
          </Col>

          <Col sm={2} className="actions-column text-center">
            <Button bsStyle="primary" onClick={this._toggleControls}>
              Manage
            </Button>
          </Col>

          <div className="clearfix" />
          <Collapse in={this.state.open}>
            <div>
              <ButtonToolbar className="actions-toolbar">
                {/* <Button bsSize="small">Convert to Guest</Button>
                <Button bsSize="small">Revoke Admin</Button> */}
                <Button bsSize="small" className="pull-right">
                  Disable Account
                </Button>
              </ButtonToolbar>
            </div>
          </Collapse>
        </Row>
      </div>
    );
  }
}
