import React from "react";

const SplitLayout = (
  { children } // eslint-disable-line
) => (
  <div className="split-layout">
    <div className="split-layout-content">{children}</div>
    <div className="split-layout-side" />
  </div>
);

export default SplitLayout;
