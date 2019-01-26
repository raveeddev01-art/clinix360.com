import React, { Component } from "react";
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
    return <div />;
  }
}

CreateTeam.propTypes = {
  typeformLink: PropTypes.string
};

CreateTeam.defaultProps = {
  typeformLink: ""
};

export default CreateTeam;
