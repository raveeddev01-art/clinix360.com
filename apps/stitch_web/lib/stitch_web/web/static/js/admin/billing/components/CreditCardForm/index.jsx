import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import noop from "lodash/noop";

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
class CreditCardForm extends Component {
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

    stripe.createToken({ name }).then(payload => {
      if (payload.error) {
        onSubmitError(payload.error);
        billingStore.loading = false;

        return;
      }

      // Reset form after succss from stripe
      this.resetForm();

      this.addCard(payload.token);
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

  onCardCVCChange = change => {
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

  resetForm() {
    this.setState({
      nameOnCard: ""
    });

    this.cardNumberElement.clear();
    this.cardExpiryElement.clear();
    this.cardCVCElement.clear();
    this.postalCodeElement.clear();
  }

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
    const { billingStore, onSubmitSuccess, onSubmitError } = this.props;

    try {
      await billingStore.addCard(token.id);
    } catch (e) {
      onSubmitError(e);
    }

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
            elementRef={ref => {
              this.cardNumberElement = ref;
            }}
          />
        </label>

        <div className="row">
          <div className="col-sm-4">
            <label className="stripe-element-container">
              Expiration date
              <CardExpiryElement
                {...createOptions(fontSize)}
                onChange={this.onCardExpiryChange}
                elementRef={ref => {
                  this.cardExpiryElement = ref;
                }}
              />
            </label>
          </div>
          <div className="col-sm-4">
            <label className="stripe-element-container">
              CVC
              <CardCVCElement
                {...createOptions(fontSize)}
                onChange={this.onCardCVCChange}
                elementRef={ref => {
                  this.cardCVCElement = ref;
                }}
              />
            </label>
          </div>
          <div className="col-sm-4">
            <label className="stripe-element-container">
              Postal code
              <PostalCodeElement
                {...createOptions(fontSize)}
                onChange={this.onPostalCodeChange}
                elementRef={ref => {
                  this.postalCodeElement = ref;
                }}
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
  buttonTitle: "Add Card",
  onSubmitSuccess: noop,
  onSubmitError: noop
};

CreditCardForm.propTypes = {
  fontSize: PropTypes.string,
  buttonTitle: PropTypes.string,
  onSubmitSuccess: PropTypes.func,
  onSubmitError: PropTypes.func
};

export default injectStripe(CreditCardForm);
