import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";

export default class Manage extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Manage</h1>
              <h3>Patient Management</h3>

              <a
                href="https://teamstitch.typeform.com/to/Yt22AI"
                className="btn btn-lg btn-default"
              >
                Join Beta
              </a>
            </div>
          </div>
        </div>

        <div className="product-feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="product-info">
                  <h2>Manage your patient data securely.</h2>

                  <p className="m-b-20">
                    Stitch Manage offers healthcare teams a HIPAA-compliant,
                    patient collaboration experience that transforms care
                    coordination. Stitch Manage includes everything you need to
                    stay on track and up to date with patients under care.
                    Referral and lab uploads, patient checklists, and team task
                    items allow your team to powerfully manage patients through
                    our patient-centric collaboration spaces.
                  </p>
                </div>
              </div>

              <div className="flex-item">
                <div className="product-image">
                  <img
                    src="/images/manage-feature-1-alt.png"
                    alt="Stitch Manage"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="product-image">
                  <img
                    src="/images/manage-feature-2.png"
                    alt="Stitch Manage"
                    className="img-responsive"
                  />
                </div>
              </div>

              <div className="flex-item">
                <div className="product-info">
                  <h2>
                    Create a dedicated collaboration space for every patient.
                  </h2>

                  <p className="m-b-20">
                    Stitch Manage creates a patient-centric collaboration space
                    for each patient. Rapidly add in your patient population via
                    individual or batch uploads. Need an MRN? We can
                    automatically generate that for you too. With Stitch Manage,
                    your team can efficiently access a complete list of all
                    patients and share information with improved organization.
                    Use Stitch Manage to track patient progress, post key data
                    points and coordinate on patient care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="product-info">
                  <h2>Thread conversations for coordinated care.</h2>

                  <p className="m-b-20">
                    It's easy for important information to drown in the flow of
                    healthcare conversations. That's why we've built powerful
                    conversation threads into Stitch Manage. Continue the
                    discussion through comments on key posts so your team never
                    loses track of what matters and where to find it. Progress
                    notes, file uploads, lab results, referrals and
                    prescriptions can all be turned into organized and ongoing
                    discussions in Stitch Manage.
                  </p>
                </div>
              </div>

              <div className="flex-item">
                <div className="product-image">
                  <img
                    src="/images/manage-feature-3.png"
                    alt="Stitch Manage"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-feature">
          <div className="container">
            <div className="flex-box">
              <div className="flex-item">
                <div className="product-image">
                  <img
                    src="/images/manage-feature-4.png"
                    alt="Stitch Manage"
                    className="img-responsive"
                  />
                </div>
              </div>

              <div className="flex-item">
                <div className="product-info">
                  <h2>Upload images, audio, or video for access anywhere.</h2>

                  <p className="m-b-20">
                    Healthcare is all about data. That's why we've made it easy
                    to upload files of nearly any type — JPEG, PNG, PDF, MP3,
                    Word, Excel, and more. No more faxing or mailing your
                    colleagues files. Just instantly share them in Stitch
                    Manage. Need to access them in the field? We've got you
                    covered. Stitch Manage has iOS and Android mobile support
                    with complete feature parity, so you can relax knowing your
                    data is available to you wherever you are.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}
