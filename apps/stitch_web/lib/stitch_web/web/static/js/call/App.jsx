import React from "react";
import { Provider } from "mobx-react";

import CallApp from "./CallApp";
import RootCallAppStore from "../common/stores/root_call_app_store";

const App = props => {
  const rootStore = new RootCallAppStore(props);

  return (
    <Provider {...rootStore}>
      <CallApp />
    </Provider>
  );
};

export default App;
