import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";

import Scrollbar from "common/components/scrollbar";

class InboxMenu extends Component {
  render() {
    return (
      <div className="inbox-menu">
        <div className="flex-header">
          <Form>
            <i className="fa fa-search" />
            <FormControl type="email" placeholder="Search" />
          </Form>

          <Button>
            <i className="fa fa-pencil-square-o" />
          </Button>
        </div>

        <div className="flex-content">
          <div className="status-filter">
            <a href="#" className="active">
              Open (9)
            </a>
            <a href="#">Closed (1029)</a>
          </div>

          <Scrollbar
            className="scrollbar"
            viewRef={ref => {
              this.scrollbar = ref;
            }}
          >
            <div className="menu-nav m-b-20">
              <Link to="/engage" className="item unread">
                <div className="item__icon">
                  <i className="fa fa-circle" />
                </div>

                <div className="item__content">
                  <div className="heading">
                    <div className="user">Andrew Brynum</div>
                    <div className="date">9:45 AM</div>
                  </div>

                  <div className="message">
                    I have a question about my recent medication. I’m not sure
                    how about what dosage I should be taking. Can you
                  </div>
                </div>
              </Link>

              <Link to="/engage" className="item unread">
                <div className="item__icon">
                  <i className="fa fa-circle" />
                </div>

                <div className="item__content">
                  <div className="heading">
                    <div className="user">Beatrice Betty</div>
                    <div className="date">Yesterday</div>
                  </div>

                  <div className="message">
                    Can you let me know when my test results will be back in? I
                    need to send them to my specialist.
                  </div>
                </div>
              </Link>

              <Link to="/engage" className="item">
                <div className="item__icon">
                  <i className="fa fa-circle" />
                </div>

                <div className="item__content">
                  <div className="heading">
                    <div className="user">Charlie Chaplin</div>
                    <div className="date">Yesterday</div>
                  </div>

                  <div className="message">
                    Trying to take the medication but I can’t.
                  </div>
                </div>
              </Link>

              <Link to="/engage" className="item active">
                <div className="item__icon">
                  <i className="fa fa-circle" />
                </div>

                <div className="item__content">
                  <div className="heading">
                    <div className="user">Deidre Smith</div>
                    <div className="closed">
                      <i className="fa fa-check" /> Closed
                    </div>
                  </div>

                  <div className="message">
                    I’m glad to hear you’re feeling better now! I still think
                    you should come back in for another visit if it doesn’t
                  </div>
                </div>
              </Link>

              <Link to="/engage" className="item">
                <div className="item__icon">
                  <i className="fa fa-circle" />
                </div>

                <div className="item__content">
                  <div className="heading">
                    <div className="user">John Smith</div>
                    <div className="date">5/6/17</div>
                  </div>

                  <div className="message">
                    Ok! I will keep you updated. I think I’ll be able to come
                    into the office next week.
                  </div>
                </div>
              </Link>
            </div>
          </Scrollbar>
        </div>
      </div>
    );
  }
}

export default withRouter(InboxMenu);
