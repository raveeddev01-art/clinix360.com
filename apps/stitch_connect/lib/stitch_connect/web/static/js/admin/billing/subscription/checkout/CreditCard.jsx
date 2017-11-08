import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";

const CreditCard = ({ card, onUse }) => {
  const iconClassName = classNames(
    "credit-card-icon",
    card.brand.toLowerCase()
  );
  // TODO: Fix card holder name
  const cardHolder = `${currentUser.firstName} ${currentUser.lastName}`;

  return (
    <div className="credit-card">
      <div className="credit-card-desc">
        <div className="credit-card-desc-row">
          <span className={iconClassName} />
          <span className="credit-card-holder">{cardHolder}</span>
        </div>

        <div>
          {capitalize(card.brand)} ending in {card.last_four}
          &nbsp;&#183;&nbsp;
          {`${card.exp_month}/${card.exp_year}`}
        </div>
      </div>

      <button
        className="btn btn-fancy btn-primary btn-md"
        onClick={() => {
          onUse(card);
        }}
      >
        Use this Card
      </button>
    </div>
  );
};

CreditCard.propTypes = {
  card: PropTypes.object.isRequired,
  onUse: PropTypes.func.isRequired
};

export default CreditCard;
