import { observable, action, computed } from "mobx";

import { processSubscriptionData, getFrequency } from "lib/billing";

class BillingStore {
  @observable loading = false; // If TRUE, indicates async operation is in progress
  @observable subscription = {};
  @observable cards = []; // Credit cards
  @observable invoices = []; // History invoices
  @observable contact = {}; // Contact info

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

  loadInvoices() {
    // TODO: Get invoices from endpoint
    const MOCK_INVOICES = [
      {
        id: 1,
        date: "2017-09-21",
        users: 6,
        credits: 0,
        charge: 36,
        pdf:
          "https://d3vv6lp55qjaqc.cloudfront.net/items/3v2o1A0i1x172k020B0j/Image%202017-10-03%20at%205.27.49%20PM.public.png"
      },
      {
        id: 2,
        date: "2017-08-21",
        users: 11,
        credits: 30.98,
        charge: 66,
        pdf:
          "https://d3vv6lp55qjaqc.cloudfront.net/items/3v2o1A0i1x172k020B0j/Image%202017-10-03%20at%205.27.49%20PM.public.png"
      },
      {
        id: 3,
        date: "2016-10-10",
        users: 7,
        credits: 0,
        charge: 56,
        pdf:
          "https://d3vv6lp55qjaqc.cloudfront.net/items/3v2o1A0i1x172k020B0j/Image%202017-10-03%20at%205.27.49%20PM.public.png"
      }
    ];

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_INVOICES);
      }, 1000);
    });
  }

  loadContact() {
    // TODO: Get contact from endpoint
    const MOCK_CONTACT = {
      name: "My Name",
      city: "My City",
      state: "CA",
      country: "USA",
      zip_code: "55555-3333",
      company_name: "My Test Company",
      address_line_one: "Street 123, chapel road",
      address_line_two: "Optional field"
    };

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_CONTACT);
      }, 1000);
    });
  }

  @action
  async loadData() {
    this.loading = true;

    this.subscription = await this.loadSubscription();
    this.cards = await this.loadCards();
    this.invoices = await this.loadInvoices();
    this.contact = await this.loadContact();

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

  @action
  updateContact(contact) {
    this.loading = true;

    // TODO: Use api
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(contact);
      }, 1000);
    })
      .then(response => {
        this.contact = response;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

export default BillingStore;
