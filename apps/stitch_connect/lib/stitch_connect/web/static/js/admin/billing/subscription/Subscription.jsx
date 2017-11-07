import React from "react";
import { Well } from "react-bootstrap";
import moment from "moment";
import capitalize from "lodash/capitalize";

import { TIERS, PLANS } from "./constants";
import { getUpgradableTiers } from "./utils";
import FrequencyToggle from "./FrequencyToggle";
import Plan from "./Plan";
import Checkout from "./Checkout";
import Loading from "./Loading";

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subscription: null,
      upgrade: false,
      subscribePlan: {
        frequency: 1,
        tier: "BASIC"
      },
      upgradePlan: {
        frequency: 1,
        tier: ""
      },
      checkout: false,
      cards: []
    };
  }

  componentWillMount() {
    // Read subscription status
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

      this.setState({ subscription });
    });

    // Read cards
    get("/api/v1/billing/cards").then(response => {
      const cards = response.data.data;

      // MOCK for VISA card
      // const cards = [
      //   {
      //     id: 1,
      //     brand: "visa",
      //     last_four: "9292",
      //     exp_month: 12,
      //     exp_year: 2020,
      //     default: "123",
      //     inserted_at: "2017-11-3",
      //     updated_at: "2017-11-3"
      //   }
      // ];

      this.setState({ cards });
    });
  }

  onToggleFrequency = () => {
    const { upgrade } = this.state;

    if (upgrade) {
      this.setState({
        upgradePlan: {
          ...this.state.upgradePlan,
          frequency: 1 - this.state.upgradePlan.frequency
        }
      });
    } else {
      this.setState({
        subscribePlan: {
          ...this.state.subscribePlan,
          frequency: 1 - this.state.subscribePlan.frequency
        }
      });
    }
  };

  onSelectPlan = tier => () => {
    const { upgrade } = this.state;

    if (upgrade) {
      this.setState({
        upgradePlan: {
          ...this.state.upgradePlan,
          tier
        }
      });
    } else {
      this.setState({
        subscribePlan: {
          ...this.state.subscribePlan,
          tier
        }
      });
    }
  };

  onUpgradePlan = () => {
    this.setState({ upgrade: true });
  };

  onCheckoutPlan = () => {
    this.setState({ checkout: true });
  };

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

    return (
      <div className="subscribed">
        <p>
          Your plan will renew on <b>{validUntil}</b> for{" "}
          <b>${subscription.estimated_invoice_amount}</b>.{" "}
          <b>{capitalize(subscription.tier)}</b> includes:
        </p>

        {PLANS[subscription.tier].items &&
          PLANS[subscription.tier].items.length > 0 && (
            <ul className="list-unstyled">
              {PLANS[subscription.tier].items.map((item, index) => (
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
    const { frequency, tier } = this.state.subscribePlan;

    return (
      <div className="plans">
        <p>Please select a plan to continue service:</p>

        <FrequencyToggle
          frequency={!!frequency}
          onToggle={this.onToggleFrequency}
        />

        {TIERS.map(t => (
          <Plan
            key={t}
            tier={t}
            frequency={frequency}
            selected={tier === t}
            onSelect={this.onSelectPlan(t)}
          />
        ))}

        <div className="clearfix">
          <button
            type="button"
            className="btn btn-fancy btn-primary pull-right"
            disabled={!tier}
            onClick={this.onCheckoutPlan}
          >
            Select Plan
          </button>
        </div>
      </div>
    );
  }

  renderUpgradePlan() {
    const tiers = getUpgradableTiers(this.state.subscription.tier);
    const { frequency, tier } = this.state.upgradePlan;

    return (
      <div className="plans">
        <FrequencyToggle
          frequency={!!frequency}
          onToggle={this.onToggleFrequency}
        />

        {tiers.map(t => (
          <Plan
            key={t}
            tier={t}
            frequency={frequency}
            selected={tier === t}
            onSelect={this.onSelectPlan(t)}
          />
        ))}

        <div className="clearfix">
          <button
            type="button"
            className="btn btn-fancy btn-primary pull-right"
            disabled={!tier}
            onClick={this.onCheckoutPlan}
          >
            Select Plan
          </button>
        </div>
      </div>
    );
  }

  renderSubscription() {
    const { subscription, upgrade } = this.state;

    return (
      <div>
        {this.renderStatus()}

        {subscription.tier === "TRIAL" && this.renderSelectPlan()}
        {subscription.tier !== "TRIAL" && upgrade && this.renderUpgradePlan()}
        {subscription.tier !== "TRIAL" &&
          !upgrade &&
          this.renderSubscribedPlan()}

        <br />

        {this.renderFooter()}
      </div>
    );
  }

  renderCheckout() {
    const { cards } = this.state;
    const plan = this.state.upgrade
      ? this.state.upgradePlan
      : this.state.subscribePlan;

    return <Checkout cards={cards} plan={plan} />;
  }

  render() {
    const { subscription, checkout } = this.state;

    return (
      <div className="subscription">
        {this.renderHeader()}

        {subscription &&
          (checkout ? this.renderCheckout() : this.renderSubscription())}

        <Loading show={!subscription} />
      </div>
    );
  }
}

export default Subscription;
