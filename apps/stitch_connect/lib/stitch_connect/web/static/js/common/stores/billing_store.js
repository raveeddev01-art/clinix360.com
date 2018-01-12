import { observable, action, computed } from "mobx";

import { processSubscriptionData, getFrequency } from "lib/billing";

class BillingStore {
  @observable subscription = {};
  @observable cards = [];
  @observable loading = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  loadSubscription() {
    this.loading = true;

    get("/api/v1/billing/subscription").then(response => {
      this.loading = false;
      this.subscription = processSubscriptionData(response.data.data);
    });
  }

  loadCards() {
    this.loading = true;

    get("/api/v1/billing/cards").then(response => {
      this.loading = false;
      this.cards = response.data.data;
    });
  }

  @action
  loadData() {
    this.loadSubscription();
    this.loadCards();
  }

  @action
  subscribe(plan) {
    return put("/api/v1/billing/subscription", {
      body: {
        tier: plan.tier,
        renewal_frequency: getFrequency(plan.frequency).value
      }
    }).then(response => {
      this.subscription = processSubscriptionData(response.data.data);

      return this.subscription;
    });
  }

  addCard(tokenId) {
    return post("/api/v1/billing/cards", {
      body: {
        source_token: tokenId
      }
    }).then(response => {
      this.cards = [
        ...this.cards.map(c => ({ ...card, default: false })),
        response.data.data
      ];
    });
  }

  /**
   * Make the card as default
   * 
   * @param {string} cardId 
   */
  @action
  useCard(cardId) {
    return put(`/api/v1/billing/cards/${cardId}`, {
      body: {
        default: true
      }
    }).then(() => {
      this.cards = this.cards.map(card => ({
        ...card,
        default: card.id === cardId
      }));
    });
  }
}

export default BillingStore;
