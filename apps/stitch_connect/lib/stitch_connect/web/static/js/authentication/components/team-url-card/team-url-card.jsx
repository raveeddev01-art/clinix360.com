import React, { Component } from "react";
import PropTypes from "prop-types";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { OnboardCard } from "common/components";

function formatTeamUrl(givenTeamName) {
  return givenTeamName.replace(/[^0-9a-zA-Z|-]/g, "").toLowerCase();
}

class TeamUrlCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamUrl: "",
      hasUniquenessError: false,
      hasPatternError: false,
      loading: false
    };
  }
  onChange = evt => {
    this.setState({
      teamUrl: formatTeamUrl(evt.target.value)
    });
  };

  onNext = () => {
    this.setState({ hasPatternError: false });

    if (!this.patternValidate()) {
      return;
    }

    this.setState({ loading: true });

    post("/api/v1/teams/url-available", {
      body: { url: this.state.teamUrl },
      hideNotify: true
    })
      .then(response => {
        this.setState({ loading: false });
        if (response.data.available) {
          this.props.onNext(this.state.teamUrl);
        } else {
          this.setState({ hasUniquenessError: true });
        }
      })
      .catch(() => {
        this.setState({ hasUniquenessError: true, loading: false });
      });
  };

  get errorText() {
    const { hasPatternError, hasUniquenessError } = this.state;

    if (hasPatternError) {
      return "Your team URL can only contain lowercase letters, numbers and dashes. It also must start with a letter or number.";
    }

    if (hasUniquenessError) {
      return "This team URL is taken. Please choose another one.";
    }

    return "";
  }

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
    }

    return true;
  };

  moveCaretAtEnd(e) {
    const tempValue = e.target.value;

    e.target.value = "";
    e.target.value = tempValue;
  }

  render() {
    const { teamUrl, loading } = this.state;

    return (
      <div>
        <OnboardCard
          {...this.props}
          title="What URL do you want for your Stitch team?"
          description={
            <span>
              This is the address you and your team will use to sign in to
              Stitch.
            </span>
          }
          errorText={this.errorText}
          onNext={this.onNext}
          loading={loading}
          disableNext={!teamUrl}
        >
          <ControlLabel>Team URL</ControlLabel>
          <FormGroup bsSize="large" className="team-form">
            <FormControl
              required
              autoFocus
              value={teamUrl}
              onChange={this.onChange}
              onFocus={this.moveCaretAtEnd}
              maxLength={80}
            />
            <span className="domain">.teamstitch.com</span>
          </FormGroup>
          <HelpBlock className="onboarding-hint m-b-20">
            Team URL must be letters, numbers, or dashes.
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
