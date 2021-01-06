import React, { Component } from "react";
import PropTypes from "prop-types";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { InputErrorBlock, OnboardPage } from "common/components";
import { mobile } from "../../../lib/browser_details";

function formatUrl(givenName) {
  return givenName.replace(/[^0-9a-zA-Z|-]/g, "").toLowerCase();
}

const uniquenessErrorText =
  "This carespace URL is taken. Please choose another one.";
const patternErrorText =
  "Your carespace URL can only contain lowercase letters, numbers and dashes. It also must start with a letter or number.";

class CarespaceUrlCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      teamUrl: "",
      error: "",
      loading: false,
    };
  }

  onChange = (evt) => {
    this.setState({
      teamUrl: formatUrl(evt.target.value),
    });
  };

  onNext = () => {
    this.setState({ hasPatternError: false });

    if (!this.validatePattern()) {
      return;
    }

    this.setState({ loading: true });

    post("/api/v1/teams/url-available", {
      body: { url: this.state.teamUrl },
      hideNotify: true,
    })
      .then((response) => {
        this.setState({ loading: false });
        if (response.data.available) {
          this.props.onNext(this.state.teamUrl);
        } else {
          this.setState({
            error: uniquenessErrorText,
            loading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          error: uniquenessErrorText,
          loading: false,
        });
      });
  };

  validatePattern = () => {
    const { teamUrl } = this.state;

    if (!/^[a-z0-9]/.test(teamUrl)) {
      // starts with letter or number
      this.setState({ error: patternErrorText });
      return false;
    } else if (/[^0-9a-z-]/.test(teamUrl)) {
      // has only letter, number, dash
      this.setState({ error: patternErrorText });
      return false;
    }

    return true;
  };

  render() {
    const { teamUrl, loading, error } = this.state;

    return (
      <div>
        <OnboardPage
          {...this.props}
          title="Choose a URL for your InvoCom Carespace"
          description={
            <span>
              This is the URL you and your team members will use to sign in to
              InvoCom.
            </span>
          }
          onNext={this.onNext}
          loading={loading}
          disableNext={!teamUrl}
        >
          <FormGroup
            bsSize="large"
            className=""
            validationState={(error && "error") || null}
          >
            <ControlLabel>Carespace URL</ControlLabel>
            <div className="team-form">
              <FormControl
                required
                autoFocus={!mobile}
                value={teamUrl}
                onChange={this.onChange}
                maxLength={80}
              />
              <span className="domain">.invocom.io</span>
            </div>
            {error && <InputErrorBlock> {error} </InputErrorBlock>}
          </FormGroup>
          <HelpBlock className="onboarding-hint m-b-20">
            Carespace URL must be letters, numbers, or dashes.
          </HelpBlock>
        </OnboardPage>
      </div>
    );
  }
}

CarespaceUrlCard.propTypes = {
  onNext: PropTypes.func.isRequired,
};

export default CarespaceUrlCard;
