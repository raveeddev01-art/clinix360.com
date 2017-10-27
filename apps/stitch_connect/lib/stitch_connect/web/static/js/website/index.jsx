import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "mobx-react";

// import Header from "./header";
import WebsiteRouter from "./website_router";
import TitleStore from "../common/stores/title_store";

const stores = {};

class Website extends Component {
  componentWillMount() {
    const titleStore = new TitleStore(null, this.props);
    stores.titleStore = titleStore;
  }

  render() {
    return (
      <div>
        <Router>
          <Provider {...stores}>
            <WebsiteRouter />
          </Provider>
        </Router>
      </div>
    );
  }
}

export default Website;
