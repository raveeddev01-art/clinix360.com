import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";
import noop from "lodash/noop";

const CreditCard = ({ card, canMakeDefault, onUse }) => {
  const cardClassName = classNames("credit-card", { selected: card.default });
  const iconClassName = classNames(
    "credit-card-icon",
    card.brand.toLowerCase()
  );

  return (
    <div className={cardClassName}>
      <div className="credit-card-desc">
        <div className="credit-card-desc-row">
          <span className={iconClassName} />
          <span className="credit-card-holder">{card.cardholder_name}</span>
        </div>

        <div>
          {capitalize(card.brand)} ending in {card.last_four}
          &nbsp;&#183;&nbsp;
          {`${card.exp_month}/${card.exp_year}`}
        </div>
      </div>

      {canMakeDefault && (
        <button
          className="btn btn-fancy btn-primary btn-md"
          onClick={() => {
            onUse(card);
          }}
        >
          Use this Card
        </button>
      )}
    </div>
  );
};

CreditCard.defaultProps = {
  canMakeDefault: true,
  onUse: noop
};

CreditCard.propTypes = {
  card: PropTypes.object.isRequired,
  canMakeDefault: PropTypes.bool,
  onUse: PropTypes.func
};

export default CreditCard;
