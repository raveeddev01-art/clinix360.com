import React from "react";
import PropTypes from "prop-types";
import { Elements } from "react-stripe-elements";
import classNames from "classnames";
import capitalize from "lodash/capitalize";

import CheckoutForm from "./CheckoutForm";

class Checkout extends React.Component {
  render() {
    const { cards } = this.props;

    return (
      <div className="checkout">
        <h4>Step 1: Billing Summary</h4>
        <div className="step1-billing-summary">
          <ul>
            <li>
              You are subscribing to <b>Power</b>
            </li>
            <li>
              You will be charged <b>$180 per user per year</b>
            </li>
            <li>
              Your subscription will renew each <b>year</b>
            </li>
          </ul>
          <p className="text-muted">
            We will automatically update your balance when members are added to
            or removed from your team.
          </p>
        </div>

        <h4>Step 2: Add Contact Information</h4>
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
        </div>

        <h4>Step 3: Add Payment Method</h4>
        <div className="step3-payment">
          <div className="existing-card">
            <h5>Option A: Use an existing payment method.</h5>

            {cards.length === 0 && <p className="help-block">No saved cards</p>}
            {cards.length > 0 &&
              cards.map(card => {
                const iconClassName = classNames(
                  "credit-card-icon",
                  card.brand
                );

                return (
                  <div className="credit-card" key={card.id}>
                    <div className="credit-card-desc">
                      <div className="credit-card-desc-row">
                        <span className={iconClassName} />
                        <span className="credit-card-holder">{`${currentUser.firstName} ${currentUser.lastName}`}</span>
                      </div>

                      <div>
                        {capitalize(card.brand)} ending in {card.last_four}
                        &nbsp;&#183;&nbsp;
                        {`${card.exp_month}/${card.exp_year}`}
                      </div>
                    </div>

                    <button className="btn btn-fancy btn-primary btn-md">
                      Use this Card
                    </button>
                  </div>
                );
              })}
          </div>

          <div className="add-new-card">
            <h5>Option B: Add a new card.</h5>

            <Elements>
              <CheckoutForm />
            </Elements>
          </div>
        </div>
      </div>
    );
  }
}

Checkout.defaultProps = {
  cards: []
};

Checkout.propTypes = {
  cards: PropTypes.array
};

export default Checkout;
