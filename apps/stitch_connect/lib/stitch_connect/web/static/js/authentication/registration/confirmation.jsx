import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import store from "../authentication_store.js";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Alert from "react-bootstrap/lib/Alert";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import InputGroup from "react-bootstrap/lib/InputGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

@observer
export default class Confirmation extends Component {
  constructor(props) {
    super();
    this.state = {
      error: false,
      digit_one: "",
      digit_two: "",
      digit_three: "",
      digit_four: "",
      digit_five: "",
      digit_six: ""
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

  handleKeyUp = event => {
    switch (event.target.name) {
      case "digit_one":
        ReactDOM.findDOMNode(this.digit_two_input).focus();
        break;
      case "digit_two":
        ReactDOM.findDOMNode(this.digit_three_input).focus();
        break;
      case "digit_three":
        ReactDOM.findDOMNode(this.digit_four_input).focus();
        break;
      case "digit_four":
        ReactDOM.findDOMNode(this.digit_five_input).focus();
        break;
      case "digit_five":
        ReactDOM.findDOMNode(this.digit_six_input).focus();
        break;
      case "digit_six":
        this.submitConfirmationCode();
        break;
    }
  };

  submitConfirmationCode = () => {
    let confirmationCode =
      this.state.digit_one +
      this.state.digit_two +
      this.state.digit_three +
      this.state.digit_four +
      this.state.digit_five +
      this.state.digit_six;
    post("/api/v1/users/submit-confirmation-code", {
      body: {
        user_id: store.instance.userId,
        confirmation_code: confirmationCode
      }
    }).then(response => {
      if (response.status === 422) {
        this.setState({ error: true });
      } else {
        this.setState({ error: false });
        this.props.history.push("/signup/team-name");
      }
    });
  };

  render() {
    return (
      <div>
        {this.state.error &&
          <Alert>
            The confirmation code doesn't match the one we have on record.
          </Alert>}

        <div className="authentication-card text-center">
          <div className="card-header">
            <Row>
              <Col xs={12} className="text-right">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="close">Close</Tooltip>}
                >
                  <Link to="/">
                    <i className="fa fa-close" />
                  </Link>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>

          <h2>Check your email!</h2>

          <h5>
            Enter your <strong>confirmation code</strong>.
          </h5>

          <form>
            <div className="confirmation-code m-b-20">
              <InputGroup className="code-group">
                <FormControl
                  autoFocus
                  value={this.state.digit_one}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  name="digit_one"
                  ref={input => {
                    this.digit_one_input = input;
                  }}
                  type="text"
                  maxLength="1"
                />
                <FormControl
                  value={this.state.digit_two}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  name="digit_two"
                  ref={input => {
                    this.digit_two_input = input;
                  }}
                  type="text"
                  maxLength="1"
                />
                <FormControl
                  value={this.state.digit_three}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  name="digit_three"
                  ref={input => {
                    this.digit_three_input = input;
                  }}
                  type="text"
                  maxLength="1"
                />
              </InputGroup>

              <div className="code-separator">—</div>

              <InputGroup className="code-group">
                <FormControl
                  value={this.state.digit_four}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  name="digit_four"
                  ref={input => {
                    this.digit_four_input = input;
                  }}
                  type="text"
                  maxLength="1"
                />
                <FormControl
                  value={this.state.digit_five}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  name="digit_five"
                  ref={input => {
                    this.digit_five_input = input;
                  }}
                  type="text"
                  maxLength="1"
                />
                <FormControl
                  value={this.state.digit_six}
                  onChange={this.handleChange}
                  onKeyUp={this.handleKeyUp}
                  name="digit_six"
                  ref={input => {
                    this.digit_six_input = input;
                  }}
                  type="text"
                  maxLength="1"
                />
              </InputGroup>
              <div className="clearfix" />
            </div>

            <HelpBlock className="m-b-20">
              We sent a six-digit confirmation code to{" "}
              <strong>email@here.com</strong> to verify your email address.
            </HelpBlock>

            {/*<Button
              onClick={this.submitConfirmationCode}
              bsSize="lg"
              bsStyle="primary"
              block
              className="m-b-40"
            >
              Reset Password
            </Button>*/}
          </form>

          <p className="copyright m-b-0">
            &copy; 2017 Stitch Technologies, Inc
          </p>
        </div>
      </div>
    );
  }
}
