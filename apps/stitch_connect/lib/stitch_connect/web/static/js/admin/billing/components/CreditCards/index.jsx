import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import noop from "lodash/noop";

import CreditCard from "../CreditCard";

@inject("billingStore")
@observer
class CreditCards extends Component {
  onUse = card => {
    const { onUseCreditCard, billingStore } = this.props;

    billingStore.useCard(card.id).then(() => {
      onUseCreditCard(card);
    });
  };

  render() {
    const { billingStore: { cards } } = this.props;

    return cards.length === 0 ? (
      <p className="help-block">No saved cards</p>
    ) : (
      cards.map(card => (
        <CreditCard key={card.id} card={card} onUse={this.onUse} />
      ))
    );
  }
}

CreditCards.defaultProps = {
  onUseCreditCard: noop
};

CreditCards.propTypes = {
  onUseCreditCard: PropTypes.func
};

export default CreditCards;
