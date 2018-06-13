import React, { Component } from "react";
import { HashLink as Link } from "react-router-hash-link";
import PropTypes from "prop-types";

class ProductCards extends Component {
  render() {
    const { pricingPage } = this.props;

    return (
      <div className="flex-box">
        <div className="flex-item">
          <Link
            className="panel panel-default connect-card"
            to={pricingPage ? "/pricing#connect" : "/connect"}
          >
            <div className="panel-body">
              <div className="hover-line" />
              <h5 className="meta text-uppercase">Team Messaging</h5>
              <h3 className="title">
                <i className="fa fa-comments" /> Connect
              </h3>
              <p className="m-b-20">
                Keep everyone in sync with real-time messaging designed for
                healthcare teams.
              </p>

              <div className="learn-more">
                {pricingPage ? "See pricing" : "Learn more"}{" "}
                <i className="fa fa-arrow-right" />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-item">
          <Link
            className="panel panel-default engage-card"
            to={pricingPage ? "/pricing#engage" : "/engage"}
          >
            <div className="panel-body">
              <div className="hover-line" />
              <h5 className="meta text-uppercase">Patient Communication</h5>
              <h3 className="title">
                <i className="fa fa-bullhorn" /> Engage
              </h3>
              <p className="m-b-20">
                Send messages, share files, collect forms and start video calls
                directly with patients.
              </p>

              <div className="learn-more">
                {pricingPage ? "See pricing" : "Learn more"}{" "}
                <i className="fa fa-arrow-right" />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-item">
          <Link
            className="panel panel-default manage-card"
            to={pricingPage ? "/pricing#manage" : "/manage"}
          >
            <div className="panel-body">
              <div className="hover-line" />
              <h5 className="meta text-uppercase">Task Management</h5>
              <h3 className="title">
                <i className="fa fa-tasks" /> Manage
              </h3>
              <p className="m-b-20">
                Assign and manage tasks to keep your team’s workflow organized
                and on track.
              </p>

              <div className="learn-more">
                {pricingPage ? "See pricing" : "Learn more"}{" "}
                <i className="fa fa-arrow-right" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }
}

ProductCards.defaultProps = {
  pricingPage: false
};

ProductCards.propTypes = {
  pricingPage: PropTypes.bool
};

export default ProductCards;
