import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Elements } from "react-stripe-elements";

import { alertModal } from "common/modals";
import CreditCards from "../components/CreditCards";
import CreditCardForm from "../components/CreditCardForm";
import Loading from "../components/Loading";

@inject("billingStore")
@observer
class PaymentMethods extends Component {
  onUseCreditCard = card => {
    alertModal({
      title: "Success",
      message: "Credit card has been set as default one!"
    });
  };

  onCardSubmitSuccess = () => {
    alertModal({
      title: "Success",
      message: "Credit card has been successfully added and set as default one!"
    });
  };

  onCardSubmitError = error => {
    alertModal({
      title: "Error in adding a card",
      message: error.message
    });
  };

  render() {
    const { billingStore: { loading } } = this.props;

    return (
      <div className="payment-tab">
        <div className="tab-section saved-cards">
          <h4>Saved Cards</h4>
          <p>
            Manage your saved cards for Stitch payments. If you have an active
            Stitch subscription, you'll need to make sure you have at least one
            card on file. You can read more about payments{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://intercom.help/teamstitch/team-administration/subscribing-and-billing"
            >
              here
            </a>
          </p>

          <br />

          <CreditCards onUseCreditCard={this.onUseCreditCard} />
        </div>

        <div className="tab-section add-card-form">
          <h4>Add Card</h4>
          <p>
            Add a new card here through our secure form. This will not process
            any charges right now, we'll just set it as the default card for any
            future payments.
          </p>

          <br />

          <Elements>
            <CreditCardForm
              onSubmitSuccess={this.onCardSubmitSuccess}
              onSubmitError={this.onCardSubmitError}
            />
          </Elements>
        </div>

        {loading && <Loading />}
      </div>
    );
  }
}

export default PaymentMethods;
