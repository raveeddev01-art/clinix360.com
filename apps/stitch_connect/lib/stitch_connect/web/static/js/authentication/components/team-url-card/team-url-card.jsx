import React, { Component } from "react";
import PropTypes from "prop-types";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import { InputErrorBlock, OnboardPage } from "common/components";

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
      carespaceUrl: "",
      error: "",
      loading: false
    };
  }

  onChange = evt => {
    this.setState({
      carespaceUrl: formatUrl(evt.target.value)
    });
  };

  onNext = () => {
    this.setState({ hasPatternError: false });

    if (!this.validatePattern()) {
      return;
    }

    this.setState({ loading: true });

    post("/api/v1/teams/url-available", {
      body: { url: this.state.carespaceUrl },
      hideNotify: true
    })
      .then(response => {
        this.setState({ loading: false });
        if (response.data.available) {
          this.props.onNext(this.state.carespaceUrl);
        } else {
          this.setState({
            error: uniquenessErrorText,
            loading: false
          });
        }
      })
      .catch(() => {
        this.setState({
          error: uniquenessErrorText,
          loading: false
        });
      });
  };

  validatePattern = () => {
    const { carespaceUrl } = this.state;

    if (!/^[a-z0-9]/.test(carespaceUrl)) {
      // starts with letter or number
      this.setState({ error: patternErrorText });
      return false;
    } else if (/[^0-9a-z-]/.test(carespaceUrl)) {
      // has only letter, number, dash
      this.setState({ error: patternErrorText });
      return false;
    }

    return true;
  };

  render() {
    const { carespaceUrl, loading, error } = this.state;

    return (
      <div>
        <OnboardPage
          {...this.props}
          title="What URL do you want for your Stitch carespace?"
          description={
            <span>
              This is the address you and your carespace will use to sign in to
              Stitch.
            </span>
          }
          onNext={this.onNext}
          loading={loading}
          disableNext={!carespaceUrl}
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
                autoFocus
                value={carespaceUrl}
                onChange={this.onChange}
                maxLength={80}
              />
              <span className="domain">.teamstitch.com</span>
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
  onNext: PropTypes.func.isRequired
};

export default CarespaceUrlCard;
