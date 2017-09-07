import React from "react";
import { Provider } from "mobx-react";
import { BrowserRouter as Router } from "react-router-dom";

import LockableApp from "./LockableApp";

import RootStore from "../common/stores/root_store";

const App = props => {
  const rootStore = new RootStore(props);

  return (
    <Router>
      <Provider {...rootStore}>
        <LockableApp />
      </Provider>
    </Router>
  );
};

export default App;
