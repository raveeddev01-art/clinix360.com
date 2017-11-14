import React, { Component } from "react";
import { Provider } from "mobx-react";
import { Router } from "react-router-dom";
import { StripeProvider } from "react-stripe-elements";

import history from "../util/history";
import RootStore from "../common/stores/root_store";
import LockableApp from "./LockableApp";
import Loading from "../common/components/loading/loading";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: false };
  }

  render() {
    const rootStore = new RootStore(this.props);

    return this.state.isLoading ? (
      <Loading />
    ) : (
      <StripeProvider apiKey={stripePublishableKey}>
        <Router history={history}>
          <Provider {...rootStore}>
            <LockableApp />
          </Provider>
        </Router>
      </StripeProvider>
    );
  }
}

export default App;
