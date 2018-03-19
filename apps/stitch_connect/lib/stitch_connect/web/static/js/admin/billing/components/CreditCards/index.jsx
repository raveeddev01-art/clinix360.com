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
    const { billingStore: { cards }, checkingOut } = this.props;

    const sortByDefault = card => !card.default;
    const cardsWithDefaultFirst = cards.sort(sortByDefault);

    return cards.length === 0 ? (
      <p className="help-block">No saved cards</p>
    ) : (
      cardsWithDefaultFirst.map(card => (
        <CreditCard
          key={card.id}
          checkingOut={checkingOut}
          card={card}
          onUse={this.onUse}
        />
      ))
    );
  }
}

CreditCards.defaultProps = {
  checkingOut: false,
  onUseCreditCard: noop
};

CreditCards.propTypes = {
  checkingOut: PropTypes.bool,
  onUseCreditCard: PropTypes.func
};

export default CreditCards;
