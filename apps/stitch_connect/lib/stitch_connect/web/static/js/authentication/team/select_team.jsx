import React, { Component } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";

import Card from "../components/card/card";

export default class SelectTeam extends Component {
  _renderHeader = () => {
    const { backUrl, restartUrl } = this.props;
    return (
      <div className="card-header">
        <Row>
          <Col xs={12} className="text-right">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="restart">Close</Tooltip>}
            >
              <Link to="/">
                <i className="fa fa-close" />
              </Link>
            </OverlayTrigger>
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    return (
      <Card
        title="Select Team"
        description={<span>Select one of your teams:</span>}
        header={this._renderHeader()}
      >
        <div className="m-b-40">
          <Button bsSize="large" block>
            Team 1
          </Button>
          <Button bsSize="large" block>
            Team 2
          </Button>
          <Button bsSize="large" block>
            Team 3
          </Button>
          <Button bsSize="large" block>
            Team 4
          </Button>
        </div>
      </Card>
    );
  }
}
