import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import { Link } from "react-router-dom";

import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { AuthenticationPage, InputErrorBlock } from "common/components";

@inject("titleStore")
class TeamPicker extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamUrl: "",
      showAlert: false
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
  }

  onChange = event => {
    const teamUrl = event.target.value;
    this.setState({ teamUrl });
  };

  onSubmit = event => {
    const { teamUrl } = this.state;
    let successLocation = `https://${teamUrl}.${applicationHost}`;
    if (this.props.asPatient) {
      successLocation = `${successLocation}/patient`;
    }

    event.preventDefault();
    Promise.all([this.checkBlacklist(teamUrl), this.checkAvailability(teamUrl)])
      .then(resp => {
        if (resp[0].data.available && !resp[1].data.available) {
          window.location = successLocation;
        } else {
          this.setState({
            showAlert: true
          });
        }
      })
      .catch(() => {
        this.setState({ showAlert: true });
      });
  };

  get findTeamLink() {
    return this.props.asPatient ? "/patient/find-your-team" : "/find-your-team";
  }

  get errorText() {
    return (
      <span>
        We don't have that carespace URL in our system. If you'd like, we can
        help you <Link to={this.findTeamLink}>find your carespace</Link>.
      </span>
    );
  }

  checkBlacklist = url => {
    return post("/api/v1/teams/slug-exists", {
      body: { url }
    });
  };

  checkAvailability = name => {
    return post("/api/v1/teams/url-available", {
      body: { url: name }
    });
  };

  render() {
    const { teamUrl, showAlert } = this.state;

    return (
      <AuthenticationPage
        title="Sign in to Stitch"
        headerCTA="create"
        description={
          <span>
            Enter your Carespace's <b> Stitch URL </b>
          </span>
        }
      >
        <Form onSubmit={this.onSubmit}>
          <FormGroup
            bsSize="large"
            className="team-form"
            validationState={(showAlert && "error") || null}
          >
            <FormControl
              required
              autoFocus
              value={teamUrl}
              onChange={this.onChange}
              onFocus={this.moveCaretAtEnd}
              placeholder="your-carespace-url"
              maxLength={80}
            />
            <span className="domain">.dvlcloud.com</span>
          </FormGroup>
          {showAlert && <InputErrorBlock>{this.errorText}</InputErrorBlock>}

          <Button
            bsStyle="primary"
            bsSize="lg"
            type="submit"
            className="btn-lg btn-block"
          >
            <div className="next-button-interior">
              <div>Next</div>
              <div className="next-arrow-wrapper">
                <i className="fa fa-arrow-right" />
              </div>
            </div>
          </Button>
        </Form>

        <div className="team-picker-find-team-helper">
          Don't know your Carespace's URL?{" "}
          <Link to={this.findTeamLink}>
            <strong>Find your Carespace</strong>
          </Link>
        </div>
      </AuthenticationPage>
    );
  }
}

TeamPicker.defaultProps = {
  asPatient: false
};

TeamPicker.propTypes = {
  asPatient: PropTypes.bool
};

export default TeamPicker;
