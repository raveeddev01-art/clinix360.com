import React from "react";
import { Well } from "react-bootstrap";
import moment from "moment";
import capitalize from "lodash/capitalize";

const SUBSCRIPTION_ITEMS = {
  BASIC: [
    "HIPAA Compliant",
    "Public & Private Rooms",
    "Direct Messaging",
    "Healthcare Workflows",
    "Searchable Archives",
    "File Storage",
    "Mac & Windows Apps",
    "iOS & Android Apps"
  ],
  PREMIUM: [],
  POWER: []
};

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subscription: null
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

        {SUBSCRIPTION_ITEMS[subscription.tier] &&
          SUBSCRIPTION_ITEMS[subscription.tier].length > 0 && (
            <ul className="list-unstyled">
              {SUBSCRIPTION_ITEMS[subscription.tier].map((item, index) => (
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
    return <div className="unsubscribed">Unsubscribed</div>;
  }

  render() {
    const { subscription } = this.state;

    return (
      subscription && (
        <div className="billing-subscription">
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
