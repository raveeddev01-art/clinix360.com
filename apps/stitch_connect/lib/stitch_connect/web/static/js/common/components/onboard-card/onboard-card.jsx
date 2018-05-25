import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import Card from "../card/card";
import LoadingButton from "../loading-button";

class OnboardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }

  _onNext = evt => {
    evt.preventDefault();
    this.props.onNext(evt);
  };

  _renderDescription = () => {
    const { description } = this.props;
    return description && <h5>{description}</h5>;
  };

  renderFooter() {
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
        {this.props.nextButtonText}
      </LoadingButton>
    );
  }

  render() {
    const { title, children, description, errorText } = this.props;
    return (
      <Card
        title={title}
        description={description}
        errorText={errorText}
        footer={this.renderFooter()}
      >
        <Form onSubmit={this._onNext}>{children}</Form>
      </Card>
    );
  }
}

OnboardCard.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  errorText: PropTypes.node,
  onNext: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  nextButtonText: PropTypes.string.isRequired,
  disableNext: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired
};

OnboardCard.defaultProps = {
  children: null,
  onNext: () => {},
  description: "",
  title: "",
  errorText: "",
  nextButtonText: "Next →",
  disableNext: false,
  loading: false
};

export default OnboardCard;
