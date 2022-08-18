import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import ResponsiveEmbed from "react-bootstrap/lib/ResponsiveEmbed";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";

import Header from "../components/header";
import Subheader from "../components/subheader";
import OurCustomers from "../components/our-customers";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

export default class Customers extends Component {
  render() {
    return (
      <div>
        <Header />

        <div className="customers-page">
          <Subheader
            title="Trusted by the best teams"
            subtitle="InvoChat organizations big and small have made InvoChat their home base for work."
          />

          <section className="luminance-section">
            <div className="container">
              <Panel className="luminance-card m-b-0">
                <Panel.Body>
                  <div className="flex-box">
                    <div className="flex-item">
                      <h2 className="m-b-20">Luminance Recovery</h2>

                      <p className="m-b-20">
                        Luminance Recovery is a residential drug addiction
                        treatment and rehabilitation center. Treatment begins
                        with detox, which includes 24-hour care, stabilization,
                        and medical attention. After detox, clients move to the
                        next phase of recovery: a 30, 60, or 90-day inpatient
                        recovery program. Luminance adopted InvoChat to help
                        improve critical communications and keep clients in the
                        recovery program.
                      </p>

                      <LinkContainer to="/customers/luminance-recovery">
                        <Button bsStyle="primary" block>
                          Read More
                        </Button>
                      </LinkContainer>
                    </div>

                    <div className="flex-item">
                      <ResponsiveEmbed a16by9>
                        <embed src="https://www.youtube.com/embed/v1fjEFYMiyA?rel=0" />
                      </ResponsiveEmbed>
                    </div>
                  </div>
                </Panel.Body>
              </Panel>
            </div>
          </section>

          <OurCustomers withoutText />

          <section className="customer-studies">
            <div className="container">
              <h2>Care teams of all kinds run on InvoChat</h2>
              <h3>
                From primary care practices to nationwide pharmacies, InvoChat
                keeps InvoChat teams moving forward.
              </h3>

              <div className="flex-box">
                <div className="flex-item">
                  <Panel>
                    <Panel.Body>
                      <img src="/images/customer-pbsc.png" alt="" />
                      <h4 className="m-b-20">Princeton Brain & Spine</h4>
                      <p className="m-b-30">
                        Princeton Brain & Spine is one of America's leading
                        neurosurgical practices. As a multi-site practice, PB&S
                        sought out InvoChat to improve the collaboration between
                        providers in different locations.
                      </p>

                      <LinkContainer to="/customers/princeton-brain-spine">
                        <Button bsStyle="primary" block>
                          Read More
                        </Button>
                      </LinkContainer>
                    </Panel.Body>
                  </Panel>
                </div>

                <div className="flex-item">
                  <Panel>
                    <Panel.Body>
                      <img src="/images/customer-dssi.png" alt="" />
                      <h4 className="m-b-20">
                        Dermatology & Skin Surgery Institute
                      </h4>
                      <p className="m-b-30">
                        DSSI provides state-of-the-art procedures for skin
                        cancer removal, microscopic tissue analysis, and
                        advanced reconstructive techniques. DSSI used InvoChat to
                        sync providers and staff during patient consultations.
                      </p>

                      <LinkContainer to="/customers/dermatology-skin-surgery-institute">
                        <Button bsStyle="primary" block>
                          Read More
                        </Button>
                      </LinkContainer>
                    </Panel.Body>
                  </Panel>
                </div>
              </div>

              <div className="flex-box">
                <div className="flex-item">
                  <Panel>
                    <Panel.Body>
                      <img src="/images/customer-citywide.png" alt="" />
                      <h4 className="m-b-20">UCSF Citywide</h4>
                      <p className="m-b-30">
                        Citywide Case Management is a division of UCSF's
                        Department of Psychiatry, providing comprehensive
                        services to 200 severely mentally ill adults. Citywide
                        sought InvoChat to manage field communication during
                        client work.
                      </p>

                      <LinkContainer to="/customers/UCSF-citywide">
                        <Button bsStyle="primary" block>
                          Read More
                        </Button>
                      </LinkContainer>
                    </Panel.Body>
                  </Panel>
                </div>

                <div className="flex-item">
                  <Panel>
                    <Panel.Body>
                      <img src="/images/customer-orchard.png" alt="" />
                      <h4 className="m-b-20">Orchard Medical Associates</h4>
                      <p className="m-b-30">
                        Orchard Medical Associates is a primary care practice
                        focused on expert medical care and attentive disease
                        prevention. Orchard Medical integrated InvoChat to improve
                        the flow of patient care throughout the office.
                      </p>

                      <LinkContainer to="/customers/orchard-medical-associates">
                        <Button bsStyle="primary" block>
                          Read More
                        </Button>
                      </LinkContainer>
                    </Panel.Body>
                  </Panel>
                </div>
              </div>
            </div>
          </section>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
