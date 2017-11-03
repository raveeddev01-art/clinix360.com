import React from "react";
import { Well } from "react-bootstrap";

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subscription: null
    };
  }

  componentWillMount() {
    get("/api/v1/billing/subscription").then(response => {
      this.setState({ subscription: response.data.data });
    });
  }

  renderStatus() {
    const { subscription } = this.state;

    return (
      <div>
        {subscription.tier === "TRIAL" && (
          <Well>
            <i className="fa fa-times-circle" />
            <p className="m-b-0">
              Your team is currently using a free trial of <b>Stitch Connect</b>{" "}
              with <b>2 days</b> remaining.
            </p>
          </Well>
        )}

        {subscription.tier === "EXPIRED" && (
          <Well>
            <i className="fa fa-times-circle" />
            <p className="m-b-0">
              Your team's trial of Stitch Connect has completed.
            </p>
          </Well>
        )}

        {subscription.tier === "SUBSCRIBED" && (
          <Well>
            <i className="fa fa-check-circle" />
            <p className="m-b-0">
              Your team is subscribed to <b>Basic</b>.
            </p>
          </Well>
        )}
      </div>
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
        {subscription.status === "expired" && (
          <span>
            Request a free trial extension by{" "}
            <a href="mailto:support@teamstitch.com?subject=Trial Extension Request&amp;body=I would like to request an extension to our Stitch Connect trial for the following reasons:">
              clicking here
            </a>.
          </span>
        )}
        {subscription.status === "subscribed" && (
          <span>
            Click <a className="downgrade-plan">here</a> to cancel your
            subscription.
          </span>
        )}
      </p>
    );
  }

  renderSubscribed() {
    const { subscription } = this.state;

    // TODO: Replace necessary information using subscription object
    return (
      <div className="subscribed">
        <p>
          Your plan will renew on <b>Wednesday, November 22nd 2017</b> for{" "}
          <b>$72</b>. <b>Basic</b> includes:
        </p>

        <ul className="list-unstyled">
          <li>
            <i className="fa fa-check-circle-o" />HIPAA Compliant
          </li>
          <li>
            <i className="fa fa-check-circle-o" />Public &amp; Private Rooms
          </li>
          <li>
            <i className="fa fa-check-circle-o" />Direct Messaging
          </li>
          <li>
            <i className="fa fa-check-circle-o" />Healthcare Workflows
          </li>
          <li>
            <i className="fa fa-check-circle-o" />Searchable Archives
          </li>
          <li>
            <i className="fa fa-check-circle-o" />File Storage
          </li>
          <li>
            <i className="fa fa-check-circle-o" />Mac &amp; Windows Apps
          </li>
          <li>
            <i className="fa fa-check-circle-o" />iOS &amp; Android Apps
          </li>
        </ul>

        <div className="clearfix">
          <button
            type="button"
            className="btn btn-fancy btn-primary pull-right"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  renderUnsubscribed() {
    return <div className="unsubscribed">Unsubscribed</div>;
  }

  render() {
    const { subscription } = this.state;

    return (
      subscription && (
        <div className="billing-subscription">
          <h3 className="text-center">Subscription</h3>

          {this.renderStatus()}

          {subscription.status === "subscribed" && this.renderSubscribed()}
          {subscription.status !== "subscribed" && this.renderUnsubscribed()}

          <br />

          {this.renderFooter()}
        </div>
      )
    );
  }
}

export default Subscription;
