import React from "react";
import PropTypes from "prop-types";

import {
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  injectStripe
} from "react-stripe-elements";

const createOptions = fontSize => {
  return {
    style: {
      base: {
        fontSize,
        color: "#424770",
        letterSpacing: "0.025em",
        fontFamily: "Source Code Pro, Menlo, monospace",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#9e2146"
      }
    }
  };
};

class CheckoutForm extends React.Component {
  handleSubmit = evt => {
    evt.preventDefault();
    this.props.stripe.createToken().then(payload => console.log(payload));
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Card number
          <CardNumberElement {...createOptions(this.props.fontSize)} />
        </label>
        <label>
          Expiration date
          <CardExpiryElement {...createOptions(this.props.fontSize)} />
        </label>
        <label>
          CVC
          <CardCVCElement {...createOptions(this.props.fontSize)} />
        </label>
        <label>
          Postal code
          <PostalCodeElement {...createOptions(this.props.fontSize)} />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}

CheckoutForm.defaultProps = {
  fontSize: "14px"
};

CheckoutForm.propTypes = {
  fontSize: PropTypes.string
};

export default injectStripe(CheckoutForm);
