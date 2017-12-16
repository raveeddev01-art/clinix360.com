import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Button from "react-bootstrap/lib/Button";

export default class Engage extends Component {
  render() {
    return (
      <div className="product-page">
        <Header />
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Engage</h1>
              <h3 className="m-b-30">Patient Engagement</h3>

              <Button
                bsSize="lg"
                bsStyle="primary"
                target="_blank"
                href="https://teamstitch.typeform.com/to/Ncn8x8"
              >
                Request Access
              </Button>
            </div>
          </div>
        </div>

        <div className="feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>
                    Communicate with patients on a secure and powerful platform.
                  </h2>

                  <p>
                    Stitch Engage offers healthcare teams a HIPAA-compliant,
                    patient communication experience. Our secure interface
                    creates a single place for managing all patient
                    communications. Safely share data of any kind — diagnoses,
                    prescriptions, lab results and more. All accessible from any
                    device. Patients enjoy an intuitive and reliable
                    cross-platform experience as well, so you can focus on what
                    matters most: patient care.
                  </p>
                </div>
              </div>

              <div className="flex-item">
                <img
                  src="/images/engage-feature-1-alt.png"
                  alt="Stitch Engage"
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
                  src="/images/engage-feature-2.png"
                  alt="Stitch Engage"
                  className="img-responsive engage-feature-image-2"
                />
              </div>

              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>
                    Create patient-centric conversations for coordinated team
                    care.
                  </h2>

                  <p>
                    Stitch Engage creates a dedicated conversational interface
                    for every patient. Team members can jump into and out of
                    patient conversations as necessary, consolidating various
                    patient communication streams into a single place for
                    improved coordination and transparency. Need to message
                    internally about a patient? No problem. You can send
                    messages visible to the patient, or leave internal notes
                    visible only to care team members.
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
                    Present images, audio and video directly in conversations.
                  </h2>

                  <p>
                    In addition to standard text messaging, Stitch Engage allows
                    you to upload almost any type of file — JPEG, PNG, PDF, MP3,
                    Word, Excel, and more. No more faxing or mailing your
                    patients their files. Just seamlessly send them through
                    Stitch Engage. We employ cutting edge security tools,
                    including isolated database containers, data transmission
                    security measures and advanced authentication technology to
                    HIPAA-compliantly store your uploads in the cloud. Relax
                    knowing you’re safe with us.
                  </p>
                </div>
              </div>

              <div className="flex-item">
                <img
                  src="/images/engage-feature-3.png"
                  alt="Stitch Engage"
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
                  src="/images/engage-feature-4.png"
                  alt="Stitch Engage"
                  className="img-responsive"
                />
              </div>

              <div className="flex-item">
                <div className="info m-b-40">
                  <h2>Powerful premium features when you need them.</h2>

                  <p>
                    Communicating with patients comes in many forms. Standard
                    messaging is always free on Stitch Engage. For voice and
                    video calls to patients, our premium tiers have you covered.
                    Experience Engage as a complete telemedicine platform for
                    delivering care to your patients. Advanced security
                    controls, powerful templating tools and robust response
                    forms are all at your fingertips as soon as you need them.
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
