import React from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router } from "react-router-dom";
import { StripeProvider } from "react-stripe-elements";

import RootStore from "../common/stores/root_store";
import LockableApp from "./LockableApp";

const App = props => {
  const rootStore = new RootStore(props);

  return (
    <StripeProvider apiKey={stripePublishableKey}>
      <Router>
        <Provider {...rootStore}>
          <LockableApp />
        </Provider>
      </Router>
    </StripeProvider>
  );
};

export default App;
