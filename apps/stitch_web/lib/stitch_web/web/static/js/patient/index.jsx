import React from "react";
import { Provider } from "mobx-react";
import { Router } from "react-router-dom";

import history from "../lib/history";
import RootPatientStore from "../common/stores/root_patient_store";
import withError from "../util/with_error_page";

import PatientEngageApp from "./PatientEngageApp";

const App = props => {
  const rootPatientStore = new RootPatientStore(props);

  return (
    <Router history={history}>
      <Provider {...rootPatientStore}>
        <PatientEngageApp />
      </Provider>
    </Router>
  );
};

export default withError("/patient", App);
