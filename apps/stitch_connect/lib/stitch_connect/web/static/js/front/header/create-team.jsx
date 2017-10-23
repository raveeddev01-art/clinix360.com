import React, { Component } from "react";
import { Form, FormControl, Button } from "react-bootstrap";

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
      window.location.href = `/signup/confirmation-code?userId=${resp.data.id}`;
    });
  };

  render() {
    const { email } = this.state;

    return (
      <Form className="flex-form" onSubmit={this.onSubmit}>
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

        <Button type="submit">Create Team</Button>
      </Form>
    );
  }
}

export default CreateTeam;
