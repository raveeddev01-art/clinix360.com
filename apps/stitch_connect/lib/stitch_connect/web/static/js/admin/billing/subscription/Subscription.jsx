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

  onChangePlan = () => {
    this.setState({ changePlan: true });
  };

  onCheckoutPlan = () => {
    this.setState({ checkout: true });
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
      const { tier, trial_remaining_days: trialRemainingDays } = subscription;
      const text =
        trialRemainingDays > 0
          ? `We won't begin billing until your trial expires in ${trialRemainingDays} days.`
          : `Your team is now changed to ${capitalize(tier)} tier`;

      alertModal({
        title: "Thanks for using Stitch!",
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
    const {
      billingStore: {
        subscription: { tier, trial_remaining_days: trialRemainingDays }
      }
    } = this.props;
    const { changePlan } = this.state;

    if (changePlan) {
      return null;
    }

    return trialRemainingDays > 0 ? (
      <Well>
        <i className="fa fa-check-circle" />

        {tier === "TRIAL" ? (
          <p className="m-b-0">
            Your team is currently using a free trial of <b>Stitch Connect</b>{" "}
            with <b>{trialRemainingDays} days</b> remaining.
          </p>
        ) : (
          <p className="m-b-0">
            Your team is subscribed to <b>{capitalize(tier)}</b>.
          </p>
        )}
      </Well>
    ) : (
      <Well>
        <i className="fa fa-times-circle" />
        {tier === "TRIAL" ? (
          <p className="m-b-0">
            Your team&#39;s trial of Stitch Connect has completed.
          </p>
        ) : (
          <p className="m-b-0">Your team&#39;s subscription has completed.</p>
        )}
      </Well>
    );
  }

  renderFooter() {
    const {
      billingStore: {
        subscription: {
          tier,
          trial_remaining_days: trialRemainingDays,
          plan_remaining_days: planRemainingDays
        }
      }
    } = this.props;

    return (
      <p>
        For an explanation of pricing, see{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://teamstitch.com/pricing"
        >
          here
        </a>.{" "}
        {tier === "TRIAL" &&
          trialRemainingDays <= 0 && (
            <span>
              Request a free trial extension by clicking{" "}
              <a href="mailto:support@teamstitch.com?subject=Trial Extension Request&amp;body=I would like to request an extension to our Stitch Connect trial for the following reasons:">
                here
              </a>.
            </span>
          )}
        {tier !== "TRIAL" &&
          planRemainingDays > 0 && (
            <span>
              Click{" "}
              <a href="mailto:support@teamstitch.com?subject=Subscription Cancellation Request&amp;body=I would like to request a cancellation of our Stitch Connect subscription for the following reasons:">
                here
              </a>{" "}
              to cancel your subscription.
            </span>
          )}
      </p>
    );
  }

  renderSubscribedPlan() {
    const {
      billingStore: {
        subscription: {
          tier,
          valid_until: validUntil,
          estimated_invoice_amount: estimatedInvoiceAmount
        }
      }
    } = this.props;
    const belowTier = capitalize(getBelowTier(tier));
    const planItems = getPlanForTier(tier).items;
    const invoiceAmount = (estimatedInvoiceAmount / 100).toFixed(2);

    return (
      <div className="subscribed">
        <p>
          Your plan will renew on <b>{validUntil}</b> for{" "}
          <b>${invoiceAmount}</b>. <b>{capitalize(tier)}</b> includes{belowTier && (
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
            onClick={this.onChangePlan}
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
      />
    );
  }

  renderSubscription() {
    const { billingStore: { subscription: { tier } } } = this.props;
    const { changePlan } = this.state;

    return (
      <div className="subscription">
        {this.renderStatus()}

        {tier === "TRIAL" || changePlan
          ? this.renderSelectPlan()
          : this.renderSubscribedPlan()}

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
    const { billingStore: { subscription, loading } } = this.props;
    const { checkout } = this.state;

    return (
      <div className="subscription-tab">
        {this.renderHeader()}

        {subscription &&
          (checkout ? this.renderCheckout() : this.renderSubscription())}

        {loading && <Loading />}
      </div>
    );
  }
}

export default Subscription;
