import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

@inject("newsStore")
@observer
class WhatsNew extends Component {
  render() {
    return (
      <div className="files-addon">
        {this.props.newsStore.news.map(news => (
          <div key={`news-${news.id}`} className="news-story">
            <h2>{moment(news.inserted_at).format("MMM Do, YYYY")}</h2>
            <h2>{news.title}</h2>
            <div
              className="news-story__body"
              dangerouslySetInnerHTML={{ __html: news.html_body }}
            />
            {news.permalink && (
              <a
                className="news-story__permalink"
                target="_blank"
                href={news.permalink}
              >
                Learn more
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default WhatsNew;
