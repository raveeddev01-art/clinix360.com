import React from "react";
import { Provider } from "mobx-react";
import { Router } from "react-router-dom";

import history from "../lib/history";
import RootPatientStore from "../common/stores/root_patient_store";
import withError from "../util/with_error_page";

const App = props => {
  const rootStore = new RootPatientStore(props);

  return (
    <Router history={history}>
      <Provider {...rootStore}>
        <div>
          <h1> Patient Info: </h1>
          <ul>
            <li>
              Name: {currentUser.firstName} {currentUser.lastName}
            </li>
            <li>Email: {currentUser.email}</li>
            <li>Token: {window.authenticationToken}</li>
          </ul>
        </div>
      </Provider>
    </Router>
  );
};

export default withError("/patient", App);
