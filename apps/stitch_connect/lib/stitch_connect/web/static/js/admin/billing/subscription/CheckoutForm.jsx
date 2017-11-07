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
    classes: {
      base: "stripe-element",
      focus: "stripe-element-focus"
    },
    style: {
      base: {
        fontSize,
        color: "#555",
        fontFamily: "Stitch Lato, sans-serif",
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
  constructor(props) {
    super(props);

    this.state = {
      nameOnCard: ""
    };
  }

  handleSubmit = evt => {
    evt.preventDefault();

    const { onSubmitStart, onSubmitSuccess, onSubmitError } = this.props;
    const { nameOnCard: name } = this.state;

    onSubmitStart();
    this.props.stripe.createToken({ name }).then(
      payload => {
        onSubmitSuccess(payload);
      },
      error => {
        onSubmitError(error);
      }
    );
  };

  handleChange = evt => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="card-form">
        <div className="form-group name-on-card">
          <label htmlFor="name-on-card">
            Name on card{" "}
            <span className="secure-label">
              <i className="fa fa-shield" /> Secure Form
            </span>
          </label>
          <input
            type="text"
            id="name-on-card"
            name="nameOnCard"
            className="form-control"
            required
            autoComplete="off"
            value={this.state.nameOnCard}
            onChange={this.handleChange}
          />
        </div>

        <label className="stripe-element-container">
          Card Number
          <CardNumberElement {...createOptions(this.props.fontSize)} />
        </label>

        <div className="row">
          <div className="col-sm-4">
            <label className="stripe-element-container">
              Expiration date
              <CardExpiryElement {...createOptions(this.props.fontSize)} />
            </label>
          </div>
          <div className="col-sm-4">
            <label className="stripe-element-container">
              CVC
              <CardCVCElement {...createOptions(this.props.fontSize)} />
            </label>
          </div>
          <div className="col-sm-4">
            <label className="stripe-element-container">
              Postal code
              <PostalCodeElement {...createOptions(this.props.fontSize)} />
            </label>
          </div>
        </div>

        <div className="submit">
          <button className="btn btn-fancy btn-primary btn-block">
            Save card info for future payments
          </button>
          <p className="help-block">
            Your account will be credited when team members are removed and
            charged when new team members are added. It is not possible to issue
            refunds, so please read instructions carefully.
          </p>
        </div>
      </form>
    );
  }
}

CheckoutForm.defaultProps = {
  fontSize: "14px"
};

CheckoutForm.propTypes = {
  fontSize: PropTypes.string,
  onSubmitStart: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired,
  onSubmitError: PropTypes.func.isRequired
};

export default injectStripe(CheckoutForm);
