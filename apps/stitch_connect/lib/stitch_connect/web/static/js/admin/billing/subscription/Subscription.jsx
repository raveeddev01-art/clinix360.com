import React from "react";
import { Well } from "react-bootstrap";
import capitalize from "lodash/capitalize";

import { alert } from "../../../common/modals";
import {
  processSubscriptionData,
  getSelectableTiers,
  getBelowTier,
  getPlanForTier,
  getFrequency
} from "./utils";
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
      plan: {
        frequency: 1,
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
    // Make the card as default
    this.setState({ loading: true });
    put(`/api/v1/billing/cards/${card.id}`, {
      body: {
        default: true
      }
    }).then(
      () => {
        const { cards } = this.state;

        cards.forEach(c => {
          c.default = c.id === card.id;
        });

        this.setState({
          loading: false,
          cards
        });

        this.subscribe();
      },
      error => {
        this.setState({ loading: false });
      }
    );
  };

  onCardSubmitStart = () => {
    this.setState({ loading: true });
  };

  onCardSubmitSuccess = token => {
    this.addCard(token);
  };

  onCardSubmitError = error => {
    this.setState({ loading: false });

    alert({
      title: "Error in creating a stripe Token",
      message: error.message
    });
  };

  loadSubscription() {
    this.setState({ loading: true });

    get("/api/v1/billing/subscription").then(response => {
      const subscription = processSubscriptionData(response.data.data);

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
    }).then(
      response => {
        const { cards } = this.state;

        this.setState({
          loading: false,
          cards: [...cards, response.data.data]
        });

        this.subscribe();
      },
      error => {
        this.setState({
          loading: false
        });
      }
    );
  }

  subscribe() {
    const { plan } = this.state;

    this.setState({ loading: true });
    put("/api/v1/billing/subscription", {
      body: {
        tier: plan.tier,
        renewal_frequency: getFrequency(plan.frequency).value
      }
    }).then(
      response => {
        const subscription = processSubscriptionData(response.data.data);

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
          upgrade: false,
          subscription
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
          href="https://intercom.help/teamstitch/connect/admin/subscribing-and-billing"
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
    const belowTier = capitalize(getBelowTier(subscription.tier));
    const planItems = getPlanForTier(subscription.tier).items;

    return (
      <div className="subscribed">
        <p>
          Your plan will renew on <b>{subscription.valid_until}</b> for{" "}
          <b>${subscription.estimated_invoice_amount}</b>.{" "}
          <b>{capitalize(subscription.tier)}</b> includes{belowTier && (
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
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  renderSelectPlan() {
    const { plan, subscription } = this.state;
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
    const { subscription, upgrade } = this.state;

    return (
      <div>
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
    const { cards, plan } = this.state;

    return (
      <Checkout
        cards={cards}
        plan={plan}
        onUseCreditCard={this.onUseCreditCard}
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
