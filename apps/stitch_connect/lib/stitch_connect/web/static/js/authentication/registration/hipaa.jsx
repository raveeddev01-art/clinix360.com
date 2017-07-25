import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import store from "../authentication_store.js";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Checkbox from "react-bootstrap/lib/Checkbox";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

@observer
export default class Hipaa extends Component {
  constructor(props) {
    super();
    this.state = {
      hipaaAgreed: false
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    post(`/api/v1/teams`, {
      body: {
        name: store.instance.teamName,
        url: store.instance.teamUrl
      }
    }).then(response => {
      store.instance.teamId = response.data.id;
      store.instance.teamUrl = response.data.slug;
      patch(`/api/v1/users/${store.instance.userId}`, {
        body: {
          fullname: `${store.instance.firstName} ${store.instance.lastName}`,
          username: store.instance.username,
          password: store.instance.password,
          pin: store.instance.pin,
          team_id: response.data.id
        }
      }).then(response => {
        this.props.history.push("/signin");
      });
    });
  };

  render() {
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

        <form onSubmit={this.handleSubmit}>
          <Checkbox
            name="hipaaAgreed"
            checked={this.state.hipaaAgreed}
            onChange={this.handleChange}
            className="m-b-20"
          >
            I agree to the terms of the HIPAA BAA
          </Checkbox>

          <HelpBlock className="m-b-20">
            Learn more about BAAs <a href="#">here</a>. By checking the box
            above, you represent that your team agrees to the terms of the{" "}
            <a href="#">HIPAA BAA</a>.
          </HelpBlock>

          <input
            disabled={!this.state.hipaaAgreed}
            value="Done!"
            type="submit"
            className="btn btn-block btn-lg btn-primary m-b-20"
          />

          <HelpBlock className="m-b-20">
            By proceeding to use Stitch, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </HelpBlock>
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
