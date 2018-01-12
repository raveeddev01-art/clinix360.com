import { observable, action, computed } from "mobx";

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
}

export default BillingStore;
