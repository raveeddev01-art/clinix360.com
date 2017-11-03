import React from "react";
import { Well } from "react-bootstrap";

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="billing-subscription">
        <h3 className="text-center">Subscription</h3>

        <Well>
          <i className="fa fa-check-circle" />
          <p className="m-b-0">
            Your team is subscribed to <b>Basic</b>.
          </p>
        </Well>

        <p>
          Your plan will renew on <b>Wednesday, November 22nd 2017</b> for{" "}
          <b>$72</b>. <b>Basic</b>
          includes:
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

        <br />

        <p>
          For an explanation of pricing, see{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://teamstitch.zendesk.com/hc/en-us/articles/217055037-Subscribing-and-billing"
          >
            here
          </a>. Click <a className="downgrade-plan">here</a> to cancel your
          subscription.
        </p>
      </div>
    );
  }
}

export default Subscription;
