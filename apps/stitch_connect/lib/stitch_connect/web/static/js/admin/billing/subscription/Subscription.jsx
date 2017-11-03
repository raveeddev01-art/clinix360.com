import React from "react";
import { Well } from "react-bootstrap";
import moment from "moment";
import capitalize from "lodash/capitalize";
import classNames from "classnames";

import Toggle from "../../../common/components/toggle/Toggle";

const PLANS = {
  BASIC: {
    pricePerMonth: {
      monthly: 6,
      annually: 5
    },
    items: [
      "HIPAA Compliant",
      "Public & Private Rooms",
      "Direct Messaging",
      "Healthcare Workflows",
      "Searchable Archives",
      "File Storage",
      "Mac & Windows Apps",
      "iOS & Android Apps"
    ]
  },
  PREMIUM: {
    pricePerMonth: {
      monthly: 12,
      annually: 10
    },
    items: []
  },
  POWER: {
    pricePerMonth: {
      monthly: 18,
      annually: 15
    },
    items: []
  }
};

const FREQUENCIES = ["monthly", "annually"];

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subscription: null,
      plan: {
        frequency: 1,
        tier: ""
      }
    };
  }

  componentWillMount() {
    get("/api/v1/billing/subscription").then(response => {
      const subscription = response.data.data;
      const validUntil = moment.utc(subscription.valid_until);
      const today = moment.utc();

      subscription.remaining_days = validUntil.diff(today, "days");

      this.setState({ subscription });
    });
  }

  onToggleFrequency = () => {
    this.setState({
      plan: {
        ...this.state.plan,
        frequency: 1 - this.state.plan.frequency
      }
    });
  };

  onSelectPlan = tier => () => {
    this.setState({
      plan: {
        ...this.state.plan,
        tier
      }
    });
  };

  onUpgrade = () => {
    console.log("upgrade");
  };

  renderStatus() {
    const { subscription } = this.state;

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

  renderSubscription() {
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
            onClick={this.onUpgrade}
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  renderPlans() {
    const frequency = FREQUENCIES[this.state.plan.frequency];

    return (
      <div className="plans">
        <p>Please select a plan to continue service:</p>

        <div className="frequency-container">
          <Toggle
            onClick={this.onToggleFrequency}
            on={capitalize(FREQUENCIES[1])}
            off={capitalize(FREQUENCIES[0])}
            active={!!this.state.plan.frequency}
          />

          <div className="frequency-description">
            {this.state.plan.frequency
              ? "Billed annually or monthly with an 1 year contract"
              : "Billed monthly with no contract"}
          </div>
        </div>

        {Object.keys(PLANS).map(tier => {
          const plan = PLANS[tier];
          const price = plan.pricePerMonth[frequency];
          const className = classNames("plan-container", {
            selected: tier === this.state.plan.tier
          });

          return (
            <div
              key={tier}
              className={className}
              onClick={this.onSelectPlan(tier)}
            >
              <div className="plan-description">
                <h4>{capitalize(tier)} Basic Monthly Plan</h4>
                <span>${price} per month for 1 user</span>
              </div>

              <div className="plan-price">
                <h4>${price}</h4>
                <span>per user / month </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { subscription } = this.state;

    return (
      subscription && (
        <div className="subscription">
          <h3 className="text-center">Subscription</h3>

          {this.renderStatus()}

          {subscription.tier === "TRIAL"
            ? this.renderPlans()
            : this.renderSubscription()}

          <br />

          {this.renderFooter()}
        </div>
      )
    );
  }
}

export default Subscription;
