import React from "react";
import PropTypes from "prop-types";
import { Redirect, Route } from "react-router-dom";

import { isAdmin } from "../util/utils";

const USER_ROOT = "/";

const AuthRoute = ({ component, ...props }) => {
  const { requiresAdmin } = component;

  return requiresAdmin && !isAdmin() ? (
    <Redirect to={USER_ROOT} />
  ) : (
    <Route {...props} component={component} />
  );
};

AuthRoute.propTypes = {
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired
};

export default AuthRoute;
