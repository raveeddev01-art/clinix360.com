import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Well } from "react-bootstrap";
import capitalize from "lodash/capitalize";

import { alert } from "common/modals";
import {
  processSubscriptionData,
  getSelectableTiers,
  getBelowTier,
  getPlanForTier,
  getFrequency
} from "lib/billing";
import Plans from "./plans/Plans";
import Checkout from "./checkout/Checkout";
import Loading from "./loading/Loading";

@inject("billingStore")
@observer
class Subscription extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      upgrade: false,
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

  onUpgradePlan = () => {
    this.setState({ upgrade: true });
  };

  onCheckoutPlan = () => {
    this.setState({ checkout: true });
  };

  onUseCreditCard = card => {
    this.subscribe();
  };

  onCardSubmitStart = () => {
    this.setState({ loading: true });
  };

  onCardSubmitSuccess = token => {
    this.subscribe();
  };

  onCardSubmitError = error => {
    this.setState({ loading: false });

    alert({
      title: "Error in creating a stripe Token",
      message: error.message
    });
  };

  subscribe() {
    const { billingStore } = this.props;
    const { plan } = this.state;

    this.setState({ loading: true });

    billingStore.subscribe(plan).then(
      subscription => {
        alert({
          title: "Thanks for using Stitch!",
          message: (
            <p>
              We successfully saved your card info. <br />{" "}
              <b>
                We won&rsquo;t begin billing until your trial expires in{" "}
                {subscription.remaining_days} days.
              </b>
            </p>
          )
        });

        this.setState({
          loading: false,
          checkout: false,
          upgrade: false
        });
      },
      error => {
        this.setState({
          loading: false
        });
      }
    );
  }

  renderHeader() {
    const { upgrade } = this.state;

    return (
      <h3 className="text-center">
        {upgrade ? "Upgrade Subscription" : "Subscription"}
      </h3>
    );
  }

  renderStatus() {
    const { billingStore: { subscription } } = this.props;
    const { upgrade } = this.state;

    if (upgrade) {
      return null;
    }

    if (subscription.remaining_days > 0) {
      return (
        <Well>
          <i className="fa fa-check-circle" />

          {subscription.tier === "TRIAL" ? (
            <p className="m-b-0">
              Your team is currently using a free trial of <b>Stitch Connect</b>{" "}
              with <b>{subscription.remaining_days} days</b> remaining.
            </p>
          ) : (
            <p className="m-b-0">
              Your team is subscribed to <b>{capitalize(subscription.tier)}</b>.
            </p>
          )}
        </Well>
      );
    }

    return (
      <Well>
        <i className="fa fa-times-circle" />
        {subscription.tier === "TRIAL" ? (
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
    const { billingStore: { subscription } } = this.props;

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
        {subscription.tier === "TRIAL" &&
          subscription.remaining_days <= 0 && (
            <span>
              Request a free trial extension by clicking{" "}
              <a href="mailto:support@teamstitch.com?subject=Trial Extension Request&amp;body=I would like to request an extension to our Stitch Connect trial for the following reasons:">
                here
              </a>.
            </span>
          )}
        {subscription.tier !== "TRIAL" &&
          subscription.remaining_days > 0 && (
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
    const { billingStore: { subscription } } = this.props;
    const belowTier = capitalize(getBelowTier(subscription.tier));
    const planItems = getPlanForTier(subscription.tier).items;
    const invoiceAmount = (subscription.estimated_invoice_amount / 100).toFixed(
      2
    );

    return (
      <div className="subscribed">
        <p>
          Your plan will renew on <b>{subscription.valid_until}</b> for{" "}
          <b>${invoiceAmount}</b>. <b>{capitalize(subscription.tier)}</b>{" "}
          includes{belowTier && (
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
            onClick={this.onUpgradePlan}
          >
            Change Plan
          </button>
        </div>
      </div>
    );
  }

  renderSelectPlan() {
    const { billingStore: { subscription } } = this.props;
    const { plan } = this.state;
    const tiers = getSelectableTiers(subscription.tier);

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
    const { billingStore: { subscription } } = this.props;
    const { upgrade } = this.state;

    return (
      <div className="subscription">
        {this.renderStatus()}

        {subscription.tier === "TRIAL" || upgrade
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
        onSubmitStart={this.onCardSubmitStart}
        onSubmitSuccess={this.onCardSubmitSuccess}
        onSubmitError={this.onCardSubmitError}
      />
    );
  }

  render() {
    const { billingStore: { subscription } } = this.props;
    const { loading, checkout } = this.state;

    return (
      <div className="subscription-tab">
        {this.renderHeader()}

        {subscription &&
          (checkout ? this.renderCheckout() : this.renderSubscription())}

        <Loading show={loading} />
      </div>
    );
  }
}

export default Subscription;
