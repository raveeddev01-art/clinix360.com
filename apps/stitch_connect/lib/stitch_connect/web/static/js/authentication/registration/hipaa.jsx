import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer, inject } from "mobx-react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

@inject("registrationStore")
@observer
export default class Hipaa extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hipaaAgreed: false
    };
  }

  onChange = event => {
    this.setState({
      hipaaAgreed: event.target.checked
    });
  };

  onSubmit = event => {
    const { registrationStore } = this.props;
    event.preventDefault();
    registrationStore.createTeam();
  };

  render() {
    const { registrationStore } = this.props;

    return (
      <div className="authentication-card text-center">
        <div className="card-header">
          <Row>
            <Col xs={6} className="text-left">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="back">Back</Tooltip>}
              >
                <Link to="/signup/invites">
                  <i className="fa fa-arrow-left" />
                </Link>
              </OverlayTrigger>
            </Col>

            <Col xs={6} className="text-right">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="restart">Restart</Tooltip>}
              >
                <Link to="/signup/team-name">
                  <i className="fa fa-refresh" />
                </Link>
              </OverlayTrigger>
            </Col>
          </Row>
        </div>

        <h2>HIPAA</h2>

        <h5>
          <strong>Business Associate Agreement</strong>
        </h5>

        <form onSubmit={this.onSubmit}>
          <Checkbox
            name="hipaaAgreed"
            checked={this.state.hipaaAgreed}
            onChange={this.onChange}
            className="m-b-20"
          >
            I agree to the terms of the HIPAA BAA
          </Checkbox>

          <HelpBlock className="m-b-20">
            Learn more about BAAs&nbsp;
            <a href="/baa" target="_blank">
              here
            </a>. By checking the box above, you represent that your team agrees
            to the terms of the&nbsp;
            <a href="/hipaa" target="_blank">
              HIPAA BAA
            </a>.
          </HelpBlock>

          <Button
            block
            bsSize="lg"
            bsStyle="primary"
            disabled={!this.state.hipaaAgreed || registrationStore.saving}
            type="submit"
            className="m-b-20"
          >
            Done!
          </Button>

          <HelpBlock className="m-b-20">
            By proceeding to use Stitch, you agree to our&nbsp;
            <a href="/terms-of-service" target="_blank">
              Terms of Service
            </a>&nbsp;and&nbsp;
            <a href="/privacy-policy" target="_blank">
              Privacy Policy
            </a>.
          </HelpBlock>
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
