import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import { Button } from "react-bootstrap/lib/InputGroup";

import { AuthenticationPage } from "common/components";
import LoadingButton from "../loading-button";

// OnboardingPage wraps AuthenticationPage and provides some shared
// functionality and a standard next button in the footer
class OnboardingPage extends Component {
  _onNext = evt => {
    evt.preventDefault();
    this.props.onNext(evt);
  };

  _renderDescription = () => {
    const { description } = this.props;
    return description && <h5>{description}</h5>;
  };

  defaultNext() {
    return (
      <div className="next-button-interior">
        <div>Next</div>
        <div className="next-arrow-wrapper">
          <i className="fa fa-arrow-right" />
        </div>
      </div>
    );
  }

  renderFooterWithSkip() {
    if (this.props.hideFooter) {
      return <div />;
    }

    return (
      <div style={{display: "100%"}}>
        <LoadingButton
          type="submit"
          bsStyle="primary"
          id="invites-submit-btn"
          className="btn btn-lg btn-onboarding m-b-10"
          style={{width: "-webkit-fill-available"}}
          loading={this.props.loading}
          disabled={this.props.disableNext}
          onClick={this._onNext}
        >
          {this.props.nextButtonText || this.defaultNext()}
        </LoadingButton>
        <Button
          id="coupon-skip-btn"
          className="btn-lg btn-onboarding btn-onboarding-inverse"
          style={{cursor: "pointer"}}
          onClick={this.props.onSkip}
        >
          Skip for now
        </Button>
      </div>
    );
  }

  renderFooter() {
    if (this.props.hideFooter) {
      return <div />;
    }

    return (
      <LoadingButton
        type="submit"
        bsStyle="primary"
        bsSize="lg"
        className="btn btn-block"
        disabled={this.props.disableNext}
        loading={this.props.loading}
        onClick={this._onNext}
      >
        {this.props.nextButtonText || this.defaultNext()}
      </LoadingButton>
    );
  }

  render() {
    const { title, children, description, errorText, headerCTA, onSkip } = this.props;
    return (
      <AuthenticationPage
        title={title}
        description={description}
        errorText={errorText}
        headerCTA={headerCTA}
        footer={onSkip ? this.renderFooterWithSkip() : this.renderFooter()}
      >
        <Form onSubmit={this._onNext}>{children}</Form>
      </AuthenticationPage>
    );
  }
}

OnboardingPage.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  errorText: PropTypes.node,
  onNext: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  nextButtonText: PropTypes.string,
  disableNext: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  hideFooter: PropTypes.bool,
  headerCTA: PropTypes.string
};

OnboardingPage.defaultProps = {
  children: null,
  onNext: () => {},
  description: "",
  title: "",
  errorText: "",
  nextButtonText: null,
  disableNext: false,
  loading: false,
  hideFooter: false,
  headerCTA: "find-team"
};

export default OnboardingPage;
