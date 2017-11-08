import React from "react";
import { Well } from "react-bootstrap";
import moment from "moment";
import capitalize from "lodash/capitalize";

import { TIERS, PLANS } from "./constants";
import { getUpgradableTiers } from "./utils";
import Plans from "./plans/Plans";
import Checkout from "./checkout/Checkout";
import Loading from "./loading/Loading";

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      subscription: null,
      upgrade: false,
      subscribePlan: {
        planFrequency: 1,
        billingFrequency: 1,
        tier: "BASIC"
      },
      upgradePlan: {
        planFrequency: 1,
        billingFrequency: 1,
        tier: ""
      },
      checkout: false,
      cards: []
    };
  }

  componentWillMount() {
    this.loadSubscription();
    this.loadCards();
  }

  onSelectPlanFrequency = freq => {
    const { upgrade } = this.state;
    const planName = upgrade ? "upgradePlan" : "subscribePlan";
    const plan = this.state[planName];

    this.setState({
      [planName]: {
        ...plan,
        planFrequency: freq
      }
    });
  };

  onSelectBillingFrequency = freq => {
    const { upgrade } = this.state;
    const planName = upgrade ? "upgradePlan" : "subscribePlan";
    const plan = this.state[planName];

    this.setState({
      [planName]: {
        ...plan,
        billingFrequency: freq
      }
    });
  };

  onSelectTier = tier => {
    const { upgrade } = this.state;
    const planName = upgrade ? "upgradePlan" : "subscribePlan";
    const plan = this.state[planName];

    this.setState({ [planName]: { ...plan, tier } });
  };

  onUpgradePlan = () => {
    this.setState({ upgrade: true });
  };

  onCheckoutPlan = () => {
    this.setState({ checkout: true });
  };

  onCardSubmitStart = () => {
    this.setState({ loading: true });
  };

  onCardSubmitSuccess = token => {
    this.addCard(token);
  };

  onCardSubmitError = error => {
    this.setState({ loading: false });

    console.log("card submit error", error);
  };

  loadSubscription() {
    this.setState({ loading: true });

    get("/api/v1/billing/subscription").then(response => {
      const subscription = response.data.data;

      // MOCK for BASIC subscription
      // const subscription = {
      //   valid_until: "2017-11-17T03:32:36.000000Z",
      //   updated_at: "2017-11-03T03:32:36.958730",
      //   tier: "BASIC",
      //   renews: false,
      //   renewal_frequency: null,
      //   estimated_invoice_amount: 72
      // };
      const validUntil = moment.utc(subscription.valid_until);
      const today = moment.utc();

      subscription.remaining_days = validUntil.diff(today, "days");

      this.setState({ loading: false, subscription });
    });
  }

  loadCards() {
    get("/api/v1/billing/cards").then(response => {
      const cards = response.data.data;

      this.setState({ cards });
    });
  }

  addCard(token) {
    post("/api/v1/billing/cards", {
      body: {
        source_token: token.id
      }
    }).then(response => {
      this.setState({ loading: false });

      alert(
        "We successfully saved your card info. We won't begin billing until your trial expires in 9 days"
      );

      this.setState({
        cards: this.state.cards.push(response.data.data)
      });
    });
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
    const { subscription, upgrade } = this.state;

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
    const { subscription } = this.state;

    return (
      <p>
        For an explanation of pricing, see{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://teamstitch.zendesk.com/hc/en-us/articles/217055037-Subscribing-and-billing"
        >
          here
        </a>.{" "}
        {subscription.tier === "TRIAL" &&
          subscription.remaining_days <= 0 && (
            <span>
              Request a free trial extension by{" "}
              <a href="mailto:support@teamstitch.com?subject=Trial Extension Request&amp;body=I would like to request an extension to our Stitch Connect trial for the following reasons:">
                clicking here
              </a>.
            </span>
          )}
        {subscription.tier !== "TRIAL" &&
          subscription.remaining_days > 0 && (
            <span>
              Click <a className="downgrade-plan">here</a> to cancel your
              subscription.
            </span>
          )}
      </p>
    );
  }

  renderSubscribedPlan() {
    const { subscription } = this.state;
    const validUntil = moment
      .utc(subscription.valid_until)
      .format("dddd, MMMM Do YYYY");
    const planItems = PLANS[subscription.tier].items;

    return (
      <div className="subscribed">
        <p>
          Your plan will renew on <b>{validUntil}</b> for{" "}
          <b>${subscription.estimated_invoice_amount}</b>.{" "}
          <b>{capitalize(subscription.tier)}</b> includes:
        </p>

        {planItems &&
          planItems.length > 0 && (
            <ul className="list-unstyled">
              {planItems.map((item, index) => (
                <li key={`item_${index}`}>
                  <i className="fa fa-check-circle-o" />
                  {item}
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
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  renderSelectPlan() {
    const { subscribePlan: plan } = this.state;
    const tiers = TIERS;

    return (
      <Plans
        plan={plan}
        tiers={tiers}
        onSelectPlanFrequency={this.onSelectPlanFrequency}
        onSelectBillingFrequency={this.onSelectBillingFrequency}
        onSelectTier={this.onSelectTier}
        onCheckoutPlan={this.onCheckoutPlan}
      />
    );
  }

  renderUpgradePlan() {
    const { upgradePlan: plan, subscription } = this.state;
    const tiers = getUpgradableTiers(subscription.tier);

    return (
      <Plans
        plan={plan}
        tiers={tiers}
        onSelectPlanFrequency={this.onSelectPlanFrequency}
        onSelectBillingFrequency={this.onSelectBillingFrequency}
        onSelectTier={this.onSelectTier}
        onCheckoutPlan={this.onCheckoutPlan}
      />
    );
  }

  renderSubscription() {
    const { subscription, upgrade } = this.state;

    return (
      <div>
        {this.renderStatus()}

        {subscription.tier === "TRIAL"
          ? this.renderSelectPlan()
          : upgrade ? this.renderUpgradePlan() : this.renderSubscribedPlan()}

        <br />

        {this.renderFooter()}
      </div>
    );
  }

  renderCheckout() {
    const { cards, upgrade, upgradePlan, subscribePlan } = this.state;
    const plan = upgrade ? upgradePlan : subscribePlan;

    return (
      <Checkout
        cards={cards}
        plan={plan}
        onSubmitStart={this.onCardSubmitStart}
        onSubmitSuccess={this.onCardSubmitSuccess}
        onSubmitError={this.onCardSubmitError}
      />
    );
  }

  render() {
    const { loading, subscription, checkout } = this.state;

    return (
      <div className="subscription">
        {this.renderHeader()}

        {subscription &&
          (checkout ? this.renderCheckout() : this.renderSubscription())}

        <Loading show={loading} />
      </div>
    );
  }
}

export default Subscription;
