import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Alert from "react-bootstrap/lib/Alert";

@inject("registrationStore")
@observer
export default class TeamUrl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamUrl: props.registrationStore.teamUrl,
      error: false
    };
  }

  handleChange = event => {
    this.setState({ teamUrl: event.target.value });
  };

  moveCaretAtEnd(e) {
    const tempValue = e.target.value;

    e.target.value = "";
    e.target.value = tempValue;
  }

  handleSubmit = event => {
    const { registrationStore, history } = this.props;
    event.preventDefault();
    post("/api/v1/teams/url-available", {
      body: { url: this.state.teamUrl }
    })
      .then(response => {
        if (response.data.available) {
          registrationStore.teamUrl = this.state.teamUrl;
          history.push("/signup/first-name");
        } else {
          this.setState({ error: true });
        }
      })
      .catch(() => {
        this.setState({ error: true });
      });
  };

  render() {
    const { error, teamUrl } = this.state;

    return (
      <div>
        {error && (
          <Alert>This team url is taken. Please choose another one.</Alert>
        )}

        <div className="authentication-card text-center">
          <h2>Team URL</h2>

          <h5>
            Enter your <strong>team url</strong>.
          </h5>

          <form onSubmit={this.handleSubmit}>
            <FormGroup bsSize="large">
              <FormControl
                name="teamUrl"
                required
                autoFocus
                type="text"
                placeholder="Ex. care-clinic"
                value={teamUrl}
                onChange={this.handleChange}
                onFocus={this.moveCaretAtEnd}
              />
            </FormGroup>

            <HelpBlock className="m-b-20">
              This is the URL you will use to access Stitch.
              <br />
              You'll login here.
            </HelpBlock>

            <input
              value="Next"
              type="submit"
              className="btn btn-block btn-lg btn-primary m-b-40"
            />
          </form>

          <p className="copyright m-b-0">
            &copy; 2017 Stitch Technologies, Inc
          </p>
        </div>
      </div>
    );
  }
}
