import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Alert from "react-bootstrap/lib/Alert";
import { OnboardCard } from "common/components";

class TeamUrlCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamUrl: "",
      hasError: false
    };
  }

  onChange = evt => {
    this.setState({
      teamUrl: evt.target.value
    });
  };

  onNext = () => {
    post("/api/v1/teams/url-available", {
      body: { url: this.state.teamUrl },
      hideNotify: true
    })
      .then(response => {
        if (response.data.available) {
          this.props.onNext(this.state.teamUrl);
        } else {
          this.setState({ hasError: true });
        }
      })
      .catch(() => {
        this.setState({ hasError: true });
      });
  };

  moveCaretAtEnd(e) {
    const tempValue = e.target.value;

    e.target.value = "";
    e.target.value = tempValue;
  }

  render() {
    const { teamUrl, hasError } = this.state;

    return (
      <div>
        {hasError && (
          <Alert bsStyle="danger">
            This team URL is taken. Please choose another one.
          </Alert>
        )}

        <OnboardCard
          {...this.props}
          title="Team URL"
          description={
            <span>
              Enter your <strong>Team URL</strong>.
            </span>
          }
          onNext={this.onNext}
        >
          <FormGroup bsSize="large">
            <FormControl
              required
              autoFocus
              placeholder="Ex. care-clinic"
              value={teamUrl}
              onChange={this.onChange}
              onFocus={this.moveCaretAtEnd}
            />
          </FormGroup>
          <HelpBlock className="m-b-20">
            This is the URL you will use to access Stitch.
            <br />
            You'll login here.
          </HelpBlock>
        </OnboardCard>
      </div>
    );
  }
}

TeamUrlCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

TeamUrlCard.defaultProps = {
  onNext: () => {}
};

export default TeamUrlCard;
