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
    // <form onSubmit={this.handleSubmit}>
    //   <label>
    //     Card number
    //     <CardNumberElement {...createOptions(this.props.fontSize)} />
    //   </label>
    //   <label>
    //     Expiration date
    //     <CardExpiryElement {...createOptions(this.props.fontSize)} />
    //   </label>
    //   <label>
    //     CVC
    //     <CardCVCElement {...createOptions(this.props.fontSize)} />
    //   </label>
    //   <label>
    //     Postal code
    //     <PostalCodeElement {...createOptions(this.props.fontSize)} />
    //   </label>
    //   <button>Pay</button>
    // </form>

    return (
      <form id="payment-form">
        <div className="form-group">
          <label htmlFor="card-name" className="card-name-label">
            Name on card{" "}
            <span className="secure-label">
              <i className="fa fa-shield" /> Secure Form
            </span>
          </label>
          <input
            type="text"
            id="card-name"
            className="form-control"
            required
            autoComplete="off"
          />
        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="card-number">Card Number</label>
              <input
                type="number"
                id="card-number"
                name="card-number"
                className="form-control"
                placeholder="•••• •••• •••• ••••"
                size="20"
                data-stripe="number"
                required
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <label htmlFor="card-exp-month">Expiry</label>

              <input
                type="number"
                id="card-exp-month"
                className="form-control"
                placeholder="Month"
                size="2"
                data-stripe="exp-month"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-sm-3">
            <div className="form-group">
              <label htmlFor="card-exp-year">&nbsp;</label>
              <input
                type="number"
                id="card-exp-year"
                className="form-control"
                placeholder="Year"
                size="4"
                data-stripe="exp-year"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="card-cvc">CVV</label>
              <input
                type="text"
                id="card-cvc"
                className="form-control"
                size="4"
                data-stripe="cvc"
                placeholder="3 digits on back"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="col-sm-6">
            <div className="form-group">
              <label htmlFor="card-zip">Zip Code</label>
              <input
                type="text"
                id="card-zip"
                className="form-control"
                placeholder="US cards only"
              />
            </div>
          </div>
        </div>

        <div className="submit">
          <button className="btn btn-fancy btn-primary btn-block">
            Complete Purchase
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
  fontSize: PropTypes.string
};

export default injectStripe(CheckoutForm);
