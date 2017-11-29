import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import Checkbox from "react-bootstrap/lib/Checkbox";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import { Card, LoadingButton } from "common/components";

class HipaaCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hipaaAgreed: false
    };
  }

  onNext = event => {
    event.preventDefault();
    this.props.onNext();
  };

  onChange = event => {
    this.setState({
      hipaaAgreed: event.target.checked
    });
  };

  render() {
    const { saving } = this.props;

    return (
      <Card
        title="HIPAA"
        description={<strong>Business Associate Agreement</strong>}
      >
        <Form onSubmit={this.onNext}>
          <Checkbox
            name="hipaaAgreed"
            checked={this.state.hipaaAgreed}
            onChange={this.onChange}
            className="m-b-20"
          >
            I agree to the terms of the HIPAA BAA
          </Checkbox>

          <HelpBlock className="m-b-20">
            By checking the box above, you represent that your team agrees to
            the terms of the&nbsp;
            <a href="/baa" target="_blank">
              HIPAA BAA
            </a>.
          </HelpBlock>

          <LoadingButton
            block
            bsSize="lg"
            bsStyle="primary"
            disabled={!this.state.hipaaAgreed}
            type="submit"
            className="m-b-20"
            loading={saving}
          >
            Done!
          </LoadingButton>

          <HelpBlock className="m-b-20">
            By proceeding to use Stitch, you agree to our&nbsp;
            <a href="/terms-of-service" target="_blank">
              Terms of Service
            </a>&nbsp;and&nbsp;
            <a href="/privacy-policy" target="_blank">
              Privacy Policy
            </a>.
          </HelpBlock>
        </Form>
      </Card>
    );
  }
}

HipaaCard.propTypes = {
  onNext: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired
};

HipaaCard.defaultProps = {
  onNext: () => {},
  saving: false
};

export default HipaaCard;
