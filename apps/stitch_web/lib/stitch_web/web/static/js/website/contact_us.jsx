import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

import Header from "./components/header";
import Footer from "./components/footer";

import { LoadingIcon, InputErrorBlock } from "common/components";

export default class ContactUs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: {
        name: "",
        email: "",
        help: "",
      },
      errors: {},
      validationState: null,
      buttonDisabled: false,
      submissionError: "",
      submitting: false,
    };
  }

  onInputChange = (evt) => {
    const { name, value } = evt.target;
    const newFields = {
      ...this.state.fields,
      [name]: value,
    };

    if (name === "country") {
      newFields.state = "";
    }

    this.setState({
      fields: newFields,
    });
  };

  validateEmail = (evt) => {
    const { value: email } = evt.target;
    const pattern = new RegExp(
      /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
    );
    if (!pattern.test(email)) {
      this.setState({
        errorMessage: "Please provide a valid email address",
        buttonDisabled: true,
      });
    } else {
      this.setState({
        errorMessage: null,
        buttonDisabled: false,
      });
    }
  };

  onSave = (evt) => {
    evt.preventDefault();
    this.setState({ submitting: true });

    console.log("clicked", evt);
    const { email, name, help } = this.state.fields;

    post("/api/v1/contact-us", {
      body: { email, name, help },
      hideNotify: true,
    })
      .then((response) => {
        console.log(response);
        this.setState({ validationState: "success", submitting: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          submitting: false,
          validationState: "error",
          submissionError:
            this.state.submissionError != ""
              ? "Please try again later"
              : "There was some issue, please try again",
        });
      });
  };

  renderForm() {
    const {
      errorMessage,
      buttonDisabled,
      validationState,
      submissionError,
    } = this.state;
    return (
      <div>
        {validationState === "error" && (
          <HelpBlock>
            <i className="fa fa-exclamation-circle" /> {submissionError}
          </HelpBlock>
        )}
        <form onSubmit={this.onSave}>
          <FormGroup controlId="name">
            <FormControl
              type="text"
              name="name"
              placeholder="Name"
              onChange={this.onInputChange}
              required
            />
          </FormGroup>

          <FormGroup controlId="email">
            <FormControl
              type="email"
              name="email"
              placeholder="Email"
              onChange={this.onInputChange}
              onBlur={this.validateEmail}
              required
            />
            {errorMessage && (
              <InputErrorBlock> {errorMessage} </InputErrorBlock>
            )}
          </FormGroup>
          <FormGroup controlId="help">
            <FormControl
              componentClass="textarea"
              rows="6"
              type="text"
              name="help"
              placeholder="tell us what you need help with"
              onChange={this.onInputChange}
              required
            />
          </FormGroup>

          <div className="button-section">
            <Button
              type="submit"
              bsStyle="primary"
              className="btn-lg btn-onboarding btn-block"
              disabled={buttonDisabled}
            >
              Contact us
            </Button>
          </div>
        </form>
      </div>
    );
  }

  render() {
    const { validationState, submitting } = this.state;
    return (
      <div className="contactus-page">
        <Header />
        <div className="contactus-spacer" />
        <div className="contactus-card">
          <div className="contactus-spacer" />
          <div className="contactus-body">
            <div className="contactus-spacer">
              <h1>Contact Us</h1>
            </div>
            {validationState === "success" && (
              <HelpBlock>
                <i className="fa fa-check-circle" /> Your query has been
                submitted, we will contact you soon.
              </HelpBlock>
            )}
            {validationState !== "success" && !submitting && this.renderForm()}
            {submitting && (
              <div className="text-center">
                <LoadingIcon size={2} />
              </div>
            )}
          </div>
          <div className="contactus-spacer" />
        </div>
        <div className="contactus-spacer" />
        <Footer />
      </div>
    );
  }
}
