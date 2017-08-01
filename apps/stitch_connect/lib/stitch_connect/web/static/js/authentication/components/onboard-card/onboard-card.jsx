import React, { Component, PropTypes } from "react";
import { Link } from "react-router-dom";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";

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
    return (
      description &&
      <h5>
        {description}
      </h5>
    );
  };

  _renderHeader = () => {
    const { backUrl, restartUrl } = this.props;
    return (
      <div className="card-header">
        <Row>
          <Col xs={6} className="text-left">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="back">Back</Tooltip>}
            >
              <Link to={backUrl}>
                <i className="fa fa-arrow-left" />
              </Link>
            </OverlayTrigger>
          </Col>

          <Col xs={6} className="text-right">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="restart">Restart</Tooltip>}
            >
              <Link to={restartUrl}>
                <i className="fa fa-refresh" />
              </Link>
            </OverlayTrigger>
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const { title, onNext, children, nextButtonText } = this.props;
    const { disableNext } = this.state;
    return (
      <div className="authentication-card text-center">
        {this._renderHeader()}
        <h2>
          {title}
        </h2>
        {this._renderDescription()}
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
        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
      </div>
    );
  }
}

OnboardCard.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  onNext: PropTypes.func.isRequired,
  backUrl: PropTypes.string,
  restartUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  nextButtonText: PropTypes.string.isRequired,
  disableNext: PropTypes.bool.isRequired
};

OnboardCard.defaultProps = {
  children: null,
  onNext: () => {},
  description: "",
  title: "",
  nextButtonText: "Next",
  disableNext: false
};

export default OnboardCard;
