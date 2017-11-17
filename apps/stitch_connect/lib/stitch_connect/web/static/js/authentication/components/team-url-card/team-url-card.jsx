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
      hasUniquenessError: false,
      hasPatternError: false
    };
  }

  onChange = evt => {
    this.setState({
      teamUrl: evt.target.value
    });
  };

  onNext = () => {
    this.setState({ hasPatternError: false });

    if (!this.patternValidate()) {
      return;
    }

    post("/api/v1/teams/url-available", {
      body: { url: this.state.teamUrl },
      hideNotify: true
    })
      .then(response => {
        if (response.data.available) {
          this.props.onNext(this.state.teamUrl);
        } else {
          this.setState({ hasUniquenessError: true });
        }
      })
      .catch(() => {
        this.setState({ hasUniquenessError: true });
      });
  };

  patternValidate = () => {
    const { teamUrl } = this.state;

    if (!/^[a-z0-9]/.test(teamUrl)) {
      // starts with letter or number
      this.setState({ hasPatternError: true });
      return false;
    } else if (/[^0-9a-z-]/.test(teamUrl)) {
      // has only letter, number, dash
      this.setState({ hasPatternError: true });
      return false;
    } else if (teamUrl.length < 3 || teamUrl.length > 20) {
      this.setState({ hasPatternError: true });
      return false;
    }

    return true;
  };

  moveCaretAtEnd(e) {
    const tempValue = e.target.value;

    e.target.value = "";
    e.target.value = tempValue;
  }

  render() {
    const { teamUrl, hasUniquenessError, hasPatternError } = this.state;

    return (
      <div>
        {hasPatternError && (
          <Alert bsStyle="danger">
            Your team URL can only contain lowercase letters, numbers and
            dashes. It also must start with a letter or number.
          </Alert>
        )}

        {!hasPatternError &&
          hasUniquenessError && (
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
