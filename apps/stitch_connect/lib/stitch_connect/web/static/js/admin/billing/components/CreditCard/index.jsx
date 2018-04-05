import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import capitalize from "lodash/capitalize";
import noop from "lodash/noop";

const CreditCard = ({ card, checkingOut, onUse }) => {
  const cardClassName = classNames("credit-card", { selected: card.default });
  const iconClassName = classNames(
    "credit-card-icon",
    card.brand.toLowerCase()
  );

  const buttonDisabled = card.default && !checkingOut;
  const buttonText = checkingOut
    ? "Pay With This Card"
    : card.default ? "Default Card" : "Set As Default";

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

      <button
        disabled={buttonDisabled}
        className="btn btn-fancy btn-primary btn-md"
        onClick={() => {
          onUse(card);
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

CreditCard.defaultProps = {
  checkingOut: false,
  onUse: noop,
};

CreditCard.propTypes = {
  checkingOut: PropTypes.bool,
  card: PropTypes.object.isRequired,
  onUse: PropTypes.func
};

export default CreditCard;
