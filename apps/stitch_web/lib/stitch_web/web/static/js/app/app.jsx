import React from "react";
import { Provider } from "mobx-react";
import { Router } from "react-router-dom";

import history from "../lib/history";
import RootStore from "../common/stores/root_store";
import LockableApp from "./LockableApp";

const App = props => {
  const rootStore = new RootStore(props);

  return (
    <Router history={history}>
      <Provider {...rootStore}>
        <LockableApp />
      </Provider>
    </Router>
  );
};

export default App;
