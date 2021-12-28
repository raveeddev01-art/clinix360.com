import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Well from "react-bootstrap/lib/Well";
import capitalize from "lodash/capitalize";

import { alertModal } from "common/modals";
import { getSelectableTiers, getBelowTier, getPlanForTier } from "lib/billing";
import Plans from "./plans/Plans";
import Checkout from "./checkout/Checkout";
import Loading from "../components/Loading";

@inject("billingStore")
@observer
class Subscription extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changePlan: false,
      checkout: false,
      plan: {
        frequency: 1,
        tier: ""
      }
    };
  }

  onSelectFrequency = frequency => {
    const { plan } = this.state;

    this.setState({
      plan: {
        ...plan,
        frequency
      }
    });
  };

  onSelectTier = tier => {
    const { plan } = this.state;

    this.setState({ plan: { ...plan, tier } });
  };

  onChangePlan = (value) => {
    this.setState({ changePlan: value });
  };

  onCheckoutPlan = () => {
    if (this.state.plan.tier === "FREE") {
      this.subscribe();
    } else {
      this.setState({ checkout: true });
    }
  };

  // This handler gets passed card selected when successful.
  // Please use it if you need it in handler.
  // onUseCreditCard = card => {
  onUseCreditCard = () => {
    this.subscribe();
  };

  // This handler gets passed token when successful.
  // Please use it if you need it in handler.
  // onCardSubmitSuccess = token => {
  onCardSubmitSuccess = () => {
    this.subscribe();
  };

  onCardSubmitError = error => {
    alertModal({
      title: "Error in creating a stripe Token",
      message: error.message
    });
  };

  subscribe() {
    const { billingStore } = this.props;
    const { plan } = this.state;

    billingStore.subscribe(plan).then(subscription => {
      const text = `Your carespace is now changed to ${capitalize(
        subscription.tier
      )} tier`;

      alertModal({
        title: "Thanks for using InvoChat!",
        message: (
          <p>
            We successfully saved your card info. <br /> <b>{text}</b>
          </p>
        )
      });

      this.setState({
        checkout: false,
        changePlan: false
      });
    });
  }

  renderHeader() {
    const { changePlan } = this.state;

    return (
      <h3 className="text-center">
        {changePlan ? "Change Subscription" : "Subscription"}
      </h3>
    );
  }

  renderStatus() {
    const { billingStore: { subscription: { tier } } } = this.props;
    const { changePlan } = this.state;

    if (changePlan) {
      return null;
    }

    return (
      <Well>
        <i className="fa fa-check-circle" />

        <p className="m-b-0">
          Your team is subscribed to <b>{capitalize(tier)}</b>.
        </p>
      </Well>
    );
  }

  renderFooter() {
    const {
      billingStore: {
        subscription: { tier, plan_remaining_days: planRemainingDays }
      }
    } = this.props;

    return (
      <p>
        For an explanation of pricing, see{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://dvlcloud.com/pricing"
        >
          here
        </a>.{" "}
        {tier !== "FREE" &&
          planRemainingDays > 0 && (
            <span>
              Click{" "}
              <a href="mailto:support@dvlcloud.com?subject=Subscription Cancellation Request&amp;body=I would like to request a cancellation of our Stitch subscription for the following reasons:">
                here
              </a>{" "}
              to cancel your subscription.
            </span>
          )}
      </p>
    );
  }

  renderRenewInfo() {
    const {
      billingStore: {
        subscription: {
          valid_until: validUntil,
          estimated_invoice_amount: estimatedInvoiceAmount
        }
      }
    } = this.props;

    const invoiceAmount = (estimatedInvoiceAmount / 100).toFixed(2);
    return (
      <span>
        Your plan will renew on <b>{validUntil}</b> for <b>${invoiceAmount}</b>.
      </span>
    );
  }

  renderSubscribedPlan() {
    const { billingStore: { subscription: { tier } } } = this.props;
    const belowTier = capitalize(getBelowTier(tier));
    const planItems = getPlanForTier(tier).items;

    return (
      <div className="subscribed">
        <p>
          {this.renderRenewInfo()}
          <b>{capitalize(tier)}</b> includes{belowTier && (
            <span>
              {" "}
              everything in <b>{belowTier}</b>, and
            </span>
          )}:
        </p>

        {planItems &&
          planItems.length > 0 && (
            <ul className="list-unstyled">
              {planItems.map((item, index) => (
                <li key={`item_${index}`}>
                  <i className="fa fa-check-circle-o" />
                  {item.content} {item.beta && <i>(Beta)</i>}
                </li>
              ))}
            </ul>
          )}

        <div className="clearfix">
          <button
            type="button"
            className="btn btn-fancy btn-primary pull-right"
            onClick={() => this.onChangePlan(true)}
          >
            Change Plan
          </button>
        </div>
      </div>
    );
  }

  renderSelectPlan() {
    const { billingStore: { subscription: { tier } } } = this.props;
    const { plan } = this.state;
    const tiers = getSelectableTiers(tier);

    return (
      <Plans
        plan={plan}
        tiers={tiers}
        onSelectFrequency={this.onSelectFrequency}
        onSelectTier={this.onSelectTier}
        onCheckoutPlan={this.onCheckoutPlan}
        onChangePlan={this.onChangePlan}
      />
    );
  }

  renderSubscription() {
    const { billingStore: { subscription: { tier } } } = this.props;
    const { changePlan } = this.state;

    return (
      <div className="subscription">
        {this.renderStatus()}

        {changePlan ? this.renderSelectPlan() : this.renderSubscribedPlan()}

        <br />

        {this.renderFooter()}
      </div>
    );
  }

  renderCheckout() {
    const { plan } = this.state;

    return (
      <Checkout
        plan={plan}
        onUseCreditCard={this.onUseCreditCard}
        onSubmitSuccess={this.onCardSubmitSuccess}
        onSubmitError={this.onCardSubmitError}
      />
    );
  }

  render() {
    const { billingStore: { loading } } = this.props;
    const { checkout } = this.state;

    return this.props.billingStore.dataLoaded ? (
      <div className="subscription-tab">
        {checkout ? this.renderCheckout() : this.renderSubscription()}
        {loading && <Loading />}
      </div>
    ) : null;
  }
}

export default Subscription;
