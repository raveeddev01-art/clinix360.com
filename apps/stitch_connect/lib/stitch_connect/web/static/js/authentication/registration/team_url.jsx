import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observer, inject } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

@observer
@inject("authenticationStore")
export default class TeamUrl extends Component {
  constructor(props) {
    super(props);

    console.log(props.authenticationStore.teamUrl);

    this.state = {
      urlAvailable: false,
      teamUrl: props.authenticationStore.teamUrl
    };
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
      urlAvailable: false
    });

    delay(() => {
      this.checkAvailability(value);
    }, 300);
  };

  checkAvailability = url => {
    post("/api/v1/teams/url-available", {
      body: { url }
    }).then(response => {
      this.setState({ urlAvailable: response.data.available });
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { authenticationStore, history } = this.props;
    authenticationStore.teamUrl = this.state.teamUrl;
    history.push("/signup/first-name");
  };

  render() {
    return (
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
              value={this.state.teamUrl}
              onChange={this.handleChange}
            />
          </FormGroup>

          <HelpBlock className="m-b-20">
            This is the URL you will use to access Stitch.
            <br />
            You'll login here.
          </HelpBlock>

          {this.state.teamUrl.length > 0 &&
            !this.state.urlAvailable && (
              <HelpBlock className="m-b-20">
                This team url is taken. Please choose another one.
              </HelpBlock>
            )}

          <input
            disabled={!this.state.urlAvailable}
            value="Next"
            type="submit"
            className="btn btn-block btn-lg btn-primary m-b-40"
          />
        </form>

        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}
