import React from "react";
import PropTypes from "prop-types";

import Connect from "../products/connect";
import NotFound from "../resources/not-found";

const defaultIndustrySubheader =
  "Bring your team's communication into one place.";

const industryProps = {
  "primary-care": {
    flipped: true,
    header: "Primary Care",
    subHeader: defaultIndustrySubheader,
    industryBodyText: "primary care practices"
  },
  optometry: {
    flipped: false,
    header: "Optometry",
    subHeader: defaultIndustrySubheader,
    industryBodyText: "optometry practices"
  },
  dentistry: {
    flipped: true,
    header: "Dentistry",
    subHeader: defaultIndustrySubheader,
    industryBodyText: "dentistry practices"
  }
};

const Industry = props => {
  const industryParam = props.match.params[0];
  const childProps = industryProps[industryParam];

  return childProps ? <Connect {...childProps} /> : <NotFound />;
};

Industry.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  }).isRequired
};

export default Industry;
