import React, { Component } from "react";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Cookies from "js-cookie";

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
  };

  render() {
    const { email } = this.state;

    return (
      <Form className="form-holder" onSubmit={this.onSubmit}>
        <div className="form-input">
          <FormControl
            required
            id="createTeam"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={this.onChange}
          />
        </div>

        <Button type="submit" bsStyle="primary" bsSize="large">
          Create Team
        </Button>
      </Form>
    );
  }
}

export default CreateTeam;
