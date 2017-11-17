import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import Card from "../card/card";

class OnboardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      disableNext: props.disableNext
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disableNext !== this.props.disableNext) {
      this.setState({ disableNext: nextProps.disableNext });
    }
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
    const { title, children, nextButtonText, description, header } = this.props;
    const { disableNext } = this.state;
    return (
      <Card header={header} title={title} description={description}>
        <Form onSubmit={this._onNext}>
          {children}
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="lg"
            className="btn-block m-b-40"
            disabled={disableNext}
          >
            {nextButtonText}
          </Button>
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
  disableNext: PropTypes.bool.isRequired
};

OnboardCard.defaultProps = {
  children: null,
  header: null,
  onNext: () => {},
  description: "",
  title: "",
  nextButtonText: "Next",
  disableNext: false
};

export default OnboardCard;
