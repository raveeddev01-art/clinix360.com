import React, { Component } from "react";
import PropTypes from "prop-types";
import { Elements } from "react-stripe-elements";
import capitalize from "lodash/capitalize";

import { getFrequency, getMonthlyPrice } from "lib/billing";
import CreditCards from "../../components/CreditCards";
import CreditCardForm from "../../components/CreditCardForm";

class Checkout extends Component {
  getBillingSummary() {
    const { plan } = this.props;
    const frequency = getFrequency(plan.frequency);
    const monthlyPrice = getMonthlyPrice(plan.tier, plan.frequency);
    const annualPrice = monthlyPrice * 12;
    const charge =
      frequency.unit === "month"
        ? `$${monthlyPrice} per user per month`
        : `$${annualPrice} per user per year`;

    return {
      tier: capitalize(plan.tier),
      charge,
      renewal: frequency.unit
    };
  }

  render() {
    const { onUseCreditCard, onSubmitSuccess, onSubmitError } = this.props;
    const billingSummary = this.getBillingSummary();

    return (
      <div className="checkout">
        <h4>Step 1: Billing Summary</h4>
        <div className="step1-billing-summary">
          <ul>
            <li>
              You are subscribing to <b>{billingSummary.tier}</b>
            </li>
            <li>
              You will be charged <b>{billingSummary.charge}</b>
            </li>
            <li>
              Your subscription will renew each <b>{billingSummary.renewal}</b>
            </li>
          </ul>
          <p className="text-muted">
            We will automatically update your balance when members are added to
            or removed from your team.
          </p>
        </div>

        {/* <h4>Step 2: Add Contact Information</h4>
        <div className="step2-contact-info">
          <div className="form-group">
            <label htmlFor="team-name">Team Name</label>
            <input
              type="text"
              name="team-name"
              className="form-control"
              id="team-name"
              required
            />
            <p className="help-block">
              Your team name and address will be used on all billing invoices on
              your account.
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="team-address">Address</label>
            <textarea
              name="team-address"
              className="form-control"
              id="team-address"
              rows="5"
            />
            <p className="help-block">
              This field can also be for adding additional invoice information.
            </p>
          </div>
        </div> */}

        <h4>Step 2: Add Payment Method</h4>
        <div className="step2-payment">
          <div className="existing-card">
            <h5>Option A: Use an existing payment method.</h5>

            <CreditCards onUseCreditCard={onUseCreditCard} />
          </div>

          <div className="add-new-card">
            <h5>Option B: Add a new card.</h5>

            <Elements>
              <CreditCardForm
                buttonTitle="Complete Purchase"
                onSubmitError={onSubmitError}
                onSubmitSuccess={onSubmitSuccess}
              />
            </Elements>

            <p className="help-block">
              Your account will be credited when team members are removed and
              charged when new team members are added. It is not possible to
              issue refunds, so please read instructions carefully.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

Checkout.propTypes = {
  plan: PropTypes.object.isRequired,
  onUseCreditCard: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired,
  onSubmitError: PropTypes.func.isRequired
};

export default Checkout;
