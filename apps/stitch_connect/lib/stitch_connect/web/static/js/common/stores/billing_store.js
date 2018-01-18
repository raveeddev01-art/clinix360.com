import { observable, action, computed } from "mobx";

import { processSubscriptionData, getFrequency } from "lib/billing";

class BillingStore {
  @observable loading = false; // If TRUE, indicates async operation is in progress
  @observable subscription = {};
  @observable cards = [];

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  loadSubscription() {
    return get("/api/v1/billing/subscription").then(response =>
      processSubscriptionData(response.data.data)
    );
  }

  loadCards() {
    return get("/api/v1/billing/cards").then(response => response.data.data);
  }

  @action
  async loadData() {
    this.loading = true;

    this.subscription = await this.loadSubscription();
    this.cards = await this.loadCards();

    this.loading = false;
  }

  @action
  subscribe(plan) {
    this.loading = true;

    return put("/api/v1/billing/subscription", {
      body: {
        tier: plan.tier,
        renewal_frequency: getFrequency(plan.frequency).value
      }
    })
      .then(response => {
        this.subscription = processSubscriptionData(response.data.data);

        return this.subscription;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  @action
  addCard(tokenId) {
    this.loading = true;

    return post("/api/v1/billing/cards", {
      body: {
        source_token: tokenId
      }
    })
      .then(response => {
        this.cards = [
          ...this.cards.map(card => ({ ...card, default: false })),
          response.data.data
        ];
      })
      .finally(() => {
        this.loading = false;
      });
  }

  /**
   * Make the card as default
   * 
   * @param {string} cardId 
   */
  @action
  useCard(cardId) {
    this.loading = true;

    return put(`/api/v1/billing/cards/${cardId}`, {
      body: {
        default: true
      }
    })
      .then(() => {
        this.cards = this.cards.map(card => ({
          ...card,
          default: card.id === cardId
        }));
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

export default BillingStore;
