import moment from "moment";

moment.updateLocale("en", {
  calendar: {
    lastWeek: "MMM Do [at] LT",
    sameElse: "MMM Do [at] LT"
  }
});
