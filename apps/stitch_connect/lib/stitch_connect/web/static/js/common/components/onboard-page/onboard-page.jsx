import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import Card from "../card/card";
import LoadingButton from "../loading-button";

// OnboardingPage wraps AuthPage and provides some shared
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

  renderFooter() {
    if (this.props.hideFooter) {
      return <div />;
    }

    return (
      <LoadingButton
        type="submit"
        bsStyle="primary"
        bsSize="lg"
        className="btn m-b-40"
        disabled={this.props.disableNext}
        loading={this.props.loading}
        onClick={this._onNext}
      >
        {this.props.nextButtonText || this.defaultNext()}
      </LoadingButton>
    );
  }

  render() {
    const { title, children, description, errorText, headerType } = this.props;
    return (
      <Card
        title={title}
        description={description}
        errorText={errorText}
        headerType={headerType}
        footer={this.renderFooter()}
      >
        <Form onSubmit={this._onNext}>{children}</Form>
      </Card>
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
  headerType: PropTypes.string
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
  headerType: "find-team"
};

export default OnboardingPage;
