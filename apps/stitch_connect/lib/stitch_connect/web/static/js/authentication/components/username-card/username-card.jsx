import React, { Component } from "react";
import PropTypes from "prop-types";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Alert from "react-bootstrap/lib/Alert";
import { OnboardCard } from "common/components";

class UsernameCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      username: "",
      hasError: false
    };
  }

  onChange = evt => {
    this.setState({
      username: evt.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
    });
  };

  onNext = () => {
    const { username } = this.state;
    get(`/api/v1/users/validate-username?username=${username}`, {
      hideNotify: true
    })
      .then(resp => {
        if (resp.data) {
          this.setState({ hasError: false });
          this.props.onNext(username);
        } else {
          this.setState({ hasError: true });
        }
      })
      .catch(() => {
        this.setState({ hasError: true });
      });
  };

  render() {
    const { username, placeholder, hasError } = this.state;

    return (
      <div>
        {hasError && (
          <Alert bsStyle="danger">
            The username needs to be unique, lowercase, and only use
            alphanumeric characters.
          </Alert>
        )}

        <OnboardCard
          {...this.props}
          title="Username"
          description={
            <span>
              Enter a <strong>username</strong>.
            </span>
          }
          onNext={this.onNext}
        >
          <FormGroup bsSize="large">
            <FormControl
              required
              autoFocus
              placeholder={placeholder || "Username"}
              value={username}
              onChange={this.onChange}
              maxLength={20}
            />
          </FormGroup>
          <HelpBlock className="m-b-20">
            Your username is how others will mention you. It should be unique,
            lowercase, alphanumeric, and fewer than 20 characters.
          </HelpBlock>
        </OnboardCard>
      </div>
    );
  }
}

UsernameCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  isLowerCase: PropTypes.bool,
  placeholder: PropTypes.string
};

UsernameCard.defaultProps = {
  onNext: () => {},
  isLowerCase: true,
  placeholder: ""
};

export default UsernameCard;
