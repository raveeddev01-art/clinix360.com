import React from "react";

class Subscription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="billing-subscription">
        <h1>Subscription</h1>

        <h4>Your team is subscribed to Basic.</h4>
        <hr />
        <p>
          Your plan will renew on Wednesday, November 22nd 2017 for $72. Basic
          includes:
        </p>
        <hr />
        <br />

        <ol>
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
        </ol>

        <div className="submit clearfix">
          <button className="btn-fancy btn-primary pull-right upgrade-plan">
            Upgrade Plan
          </button>
        </div>

        <p>
          For an explanation of pricing, see
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://teamstitch.zendesk.com/hc/en-us/articles/217055037-Subscribing-and-billing"
          >
            here.
          </a>{" "}
          Click <a className="downgrade-plan">here</a> to cancel your
          subscription.
        </p>
      </div>
    );
  }
}

export default Subscription;
