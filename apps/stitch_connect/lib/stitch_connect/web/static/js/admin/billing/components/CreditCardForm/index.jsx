import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";

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

@inject("billingStore")
class CreditCardForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nameOnCard: "",
      elements: {
        cardNumber: false,
        cardExpiry: false,
        cardCvc: false,
        postalCode: false
      }
    };
  }

  onSubmit = evt => {
    evt.preventDefault();

    const { onSubmitError, stripe, billingStore } = this.props;
    const { nameOnCard: name } = this.state;

    billingStore.loading = true;

    stripe
      .createToken({ name })
      .then(payload => {
        if (payload.error) {
          onSubmitError(payload.error);
          return;
        }

        this.addCard(payload.token);
      })
      .finally(() => {
        billingStore.loading = false;
      });
  };

  onChange = evt => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  };

  onCardNumberChange = change => {
    const { elements } = this.state;

    this.setState({
      elements: {
        ...elements,
        cardNumber: change.complete
      }
    });
  };

  onCardExpiryChange = change => {
    const { elements } = this.state;

    this.setState({
      elements: {
        ...elements,
        cardExpiry: change.complete
      }
    });
  };

  onCardCvcChange = change => {
    const { elements } = this.state;

    this.setState({
      elements: {
        ...elements,
        cardCvc: change.complete
      }
    });
  };

  onPostalCodeChange = change => {
    const { elements } = this.state;

    this.setState({
      elements: {
        ...elements,
        postalCode: change.complete
      }
    });
  };

  canSubmit() {
    const { nameOnCard, elements } = this.state;

    return (
      !!nameOnCard &&
      elements.cardNumber &&
      elements.cardExpiry &&
      elements.cardCvc &&
      elements.postalCode
    );
  }

  async addCard(token) {
    const { billingStore, onSubmitSuccess } = this.props;

    await billingStore.addCard(token.id);

    onSubmitSuccess(token);
  }

  render() {
    const { fontSize, buttonTitle } = this.props;

    return (
      <form onSubmit={this.onSubmit} className="credit-card-form">
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
            onChange={this.onChange}
          />
        </div>

        <label className="stripe-element-container">
          Card Number
          <CardNumberElement
            {...createOptions(fontSize)}
            onChange={this.onCardNumberChange}
          />
        </label>

        <div className="row">
          <div className="col-sm-4">
            <label className="stripe-element-container">
              Expiration date
              <CardExpiryElement
                {...createOptions(fontSize)}
                onChange={this.onCardExpiryChange}
              />
            </label>
          </div>
          <div className="col-sm-4">
            <label className="stripe-element-container">
              CVC
              <CardCVCElement
                {...createOptions(fontSize)}
                onChange={this.onCardCvcChange}
              />
            </label>
          </div>
          <div className="col-sm-4">
            <label className="stripe-element-container">
              Postal code
              <PostalCodeElement
                {...createOptions(fontSize)}
                onChange={this.onPostalCodeChange}
              />
            </label>
          </div>
        </div>

        <div className="submit">
          <button
            type="submit"
            className="btn btn-fancy btn-primary btn-block"
            disabled={!this.canSubmit()}
          >
            {buttonTitle}
          </button>
        </div>
      </form>
    );
  }
}

CreditCardForm.defaultProps = {
  fontSize: "14px",
  buttonTitle: "Add Card"
};

CreditCardForm.propTypes = {
  fontSize: PropTypes.string,
  buttonTitle: PropTypes.string,
  onSubmitSuccess: PropTypes.func.isRequired,
  onSubmitError: PropTypes.func.isRequired
};

export default injectStripe(CreditCardForm);
