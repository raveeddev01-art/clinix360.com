import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";

import Header from "../components/header";
import CreateTeam from "../components/create-team";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Button from "react-bootstrap/lib/Button";

export default class Connect extends Component {
  render() {
    return (
      <div className="product-page">
        <Header />
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Connect</h1>
              <h3 className="m-b-30">Team Communication</h3>

              <div className="m-b-20">
                <CreateTeam />

                <Button
                  href={`https://${applicationHost}/signup/email`}
                  className="create-team-mobile"
                  block
                >
                  Create Team
                </Button>
              </div>

              <p className="m-b-0">
                Get started with an unlimited number of people on our free
                2-week trial.
              </p>
            </div>
          </div>
        </div>

        <div className="feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>
                    Secure all your healthcare communication in one place.
                  </h2>

                  <p>
                    Stitch Connect offers healthcare teams a HIPAA-compliant,
                    team communication experience across all devices. We
                    complement a great user experience with advanced security
                    architecture to bring the latest in communication technology
                    to the healthcare world. We use AWS to provide necessary
                    physical safeguards and Aptible to provide technical
                    safeguards, then carefully layer in administrative controls
                    for complete HIPAA compliance.
                  </p>
                </div>
              </div>

              <div className="flex-item">
                <img
                  src="/images/connect-feature-1.png"
                  alt="Stitch Connect"
                  className="img-responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="feature alt">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <img
                  src="/images/connect-feature-2.png"
                  alt="Stitch Connect"
                  className="img-responsive"
                />
              </div>

              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>Organize your conversations by groups or 1-on-1.</h2>

                  <p>
                    Stitch Connect organizes conversations into groups and
                    private messages. Public and private groups bring healthcare
                    teams together for powerful team dialogue. Discuss patients,
                    events, tasks and more. Private messages enable instant
                    1-to-1 communication. No more pagers, fax machines or phone
                    calls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>
                    Upload images, audio, or video into your conversations.
                  </h2>

                  <p>
                    Use Stitch Connect as a searchable archive of your team’s
                    files. You can upload almost any type — JPEG, PNG, PDF, MP3,
                    Word, Excel, PowerPoint, and more. We employ cutting edge
                    security tools, including isolated database containers, data
                    transmission security measures and advanced authentication
                    technology to HIPAA-compliantly store your uploads in the
                    cloud. You can relax knowing you’re safe with us.
                  </p>
                </div>
              </div>

              <div className="flex-item">
                <img
                  src="/images/connect-feature-3.png"
                  alt="Stitch Connect"
                  className="img-responsive"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="feature alt">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <img
                  src="/images/connect-feature-4.png"
                  alt="Stitch Connect"
                  className="img-responsive"
                />
              </div>

              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>
                    Notifications keep you in sync across all your devices.
                  </h2>

                  <p>
                    Never miss a beat in Stitch Connect. Access your account
                    everywhere you go with our web, desktop, and mobile apps.
                    Receive and customize notifications across all your
                    platforms so you stay in the conversation any way you like.
                    Need more reliability? We’ve got you covered with message
                    read receipts and escalating offline email and SMS
                    notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
