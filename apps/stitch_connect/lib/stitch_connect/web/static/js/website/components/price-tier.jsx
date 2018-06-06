import React, { Component } from "react";

import { getProduct } from "lib/constants";

class PriceTier extends Component {
  constructor(props) {
    super(props);
    this.state = { annual: false };
  }

  handleClick = () => {
    this.setState(prevState => ({
      annual: !prevState.annual
    }));
  };

  render() {
    const { product, tier } = this.props;
    const { annual } = this.state;
    const plan = getProduct(product)[tier];

    return (
      <div className="pricing-tier">
        <div className="price-tag text-center">
          <div className="tier">{plan.name}</div>
          <div className="price m-b-10">
            <span>$</span>
            {annual ? plan.price.annual : plan.price.monthly}
          </div>
          <div className="text-muted m-b-30">
            per user per month <br />billed{" "}
            <a onClick={this.handleClick}>{annual ? "annual" : "monthly"}</a>
          </div>
        </div>

        <ul className="list-unstyled m-b-30">
          {plan.features.map((feature, index) => (
            <li key={`item_${index}`}>
              <i className="fa fa-check-circle" />
              {feature.name}
            </li>
          ))}
        </ul>

        <a href="/getstarted" className="btn btn-primary btn-block btn-lg">
          {tier === "FREE" ? "Get Started" : "Try Free"}
        </a>
      </div>
    );
  }
}

export default PriceTier;
