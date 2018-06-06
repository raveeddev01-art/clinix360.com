import React from "react";
import { Helmet } from "react-helmet";

const withTitle = (title, ExtendedComponent) => props => {
  // In the main app, use titleStore, but outside of mobx, this
  // component is used to change page titles
  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <ExtendedComponent {...props} />
    </div>
  );
};

export default withTitle;
