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

  render() {
    const {
      title,
      children,
      nextButtonText,
      description,
      header,
      loading,
      disableNext
    } = this.props;
    return (
      <Card header={header} title={title} description={description}>
        <Form onSubmit={this._onNext}>
          {children}
          <LoadingButton
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
            disabled={disableNext}
            loading={loading}
          >
            {nextButtonText}
          </LoadingButton>
        </Form>
      </Card>
    );
  }
}

OnboardCard.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  header: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  onNext: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  nextButtonText: PropTypes.string.isRequired,
  disableNext: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired
};

OnboardCard.defaultProps = {
  children: null,
  header: null,
  onNext: () => {},
  description: "",
  title: "",
  nextButtonText: "Next",
  disableNext: false,
  loading: false
};

export default OnboardCard;
