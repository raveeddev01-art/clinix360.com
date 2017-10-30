import React, { Component } from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "mobx-react";
import resetPasswordStore from "./stores/reset_password_store";
import authenticationStore from "./stores/authentication_store";
import TitleStore from "../common/stores/title_store";
import AuthenticationRouter from "./authentication_router";

const stores = { resetPasswordStore, authenticationStore };
// @TODO refactor authentication_store and provide by using provider

class Auth extends Component {
  componentWillMount() {
    authenticationStore.teamName = this.props.teamName;
    authenticationStore.teamSlug = this.props.teamSlug;
    resetPasswordStore.token = this.props.token;
    resetPasswordStore.teamId = this.props.teamId;

    const titleStore = new TitleStore(null, this.props);
    stores.titleStore = titleStore;
  }

  render() {
    return (
      <Router>
        <Provider {...stores}>
          <AuthenticationRouter />
        </Provider>
      </Router>
    );
  }
}

Auth.propTypes = {
  teamName: PropTypes.string,
  teamSlug: PropTypes.string,
  token: PropTypes.string,
  teamId: PropTypes.number
};

Auth.defaultProps = {
  teamName: "",
  teamSlug: "",
  token: "",
  teamId: 0
};

export default Auth;
