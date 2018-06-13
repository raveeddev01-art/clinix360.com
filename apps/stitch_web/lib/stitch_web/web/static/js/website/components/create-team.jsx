import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Cookies from "js-cookie";

import browserDetails from "../../lib/browser_details";

class CreateTeam extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      email: ""
    };
  }

  onChange = evt => {
    this.setState({ email: evt.target.value });
  };

  onSubmit = evt => {
    evt.preventDefault();
    if (appSettings.hasLogin) {
      // TODO: find a way not to reload the page
      window.location.href = `https://${applicationHost}/getstarted`;
    } else {
      post("/api/v1/users", {
        body: { email: this.state.email }
      }).then(resp => {
        return post("/api/v1/users/send-confirmation-code", {
          body: { id: resp.data.id }
        }).then(() => {
          Cookies.set(
            "registration",
            {
              userId: resp.data.id,
              email: this.state.email
            },
            { expires: 1 }
          ); // expires in a day
          window.location.href = `/signup/confirmation-code`;
        });
      });
    }
  };

  render() {
    const { email } = this.state;
    const { mobile, os } = browserDetails;

    // console.log(this.props.align) // "left" | "right"

    return (
      <div>
        {!mobile && (
          <Form inline className="create-team-form" onSubmit={this.onSubmit}>
            <FormGroup>
              {!appSettings.hasLogin && (
                <FormControl
                  required
                  id="createTeam"
                  placeholder="Email address"
                  type="email"
                  value={email}
                  onChange={this.onChange}
                />
              )}
              <Button type="submit" bsStyle="primary" className="btn-form">
                Get Started
              </Button>
            </FormGroup>
          </Form>
        )}

        {mobile &&
          os === "iOS" && (
            <a
              href="http://stitch.app.link"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary appstore-btn"
            >
              Get Stitch for iOS
            </a>
          )}

        {mobile &&
          os === "Android" && (
            <a
              href="http://stitch.app.link"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary appstore-btn"
            >
              Get Stitch for Android
            </a>
          )}
      </div>
    );
  }
}

CreateTeam.propTypes = {
  align: PropTypes.string
};

CreateTeam.defaultProps = {
  align: "right"
};

export default CreateTeam;
