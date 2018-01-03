import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Feature from "../components/feature";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Button from "react-bootstrap/lib/Button";

export default class Manage extends Component {
  render() {
    return (
      <div className="product-page">
        <Header />
        <div className="subheader">
          <div className="container">
            <div className="landing-message text-center">
              <h1>Manage</h1>
              <h3 className="m-b-30">Patient Management</h3>

              <Button
                target="_blank"
                rel="noopener noreferrer"
                href="https://teamstitch.typeform.com/to/Yt22AI"
              >
                Request Access
              </Button>
            </div>
          </div>
        </div>

        <Feature
          heading="Manage your patient data securely."
          image="/images/manage-feature-1-alt.png"
        >
          Stitch Manage offers healthcare teams a HIPAA-compliant, patient
          collaboration experience that transforms care coordination. Stitch
          Manage includes everything you need to stay on track and up to date
          with patients under care. Referral and lab uploads, patient
          checklists, and team task items allow your team to powerfully manage
          patients through our patient-centric collaboration spaces.
        </Feature>

        <Feature
          featureClassName="alt"
          heading="Create a dedicated collaboration space for every patient."
          image="/images/manage-feature-2.png"
        >
          Stitch Manage creates a patient-centric collaboration space for each
          patient. Rapidly add in your patient population via individual or
          batch uploads. Need an MRN? We can automatically generate that for you
          too. With Stitch Manage, your team can efficiently access a complete
          list of all patients and share information with improved organization.
          Use Stitch Manage to track patient progress, post key data points and
          coordinate on patient care.
        </Feature>

        <Feature
          heading="Thread conversations for coordinated care."
          image="/images/manage-feature-3.png"
        >
          It's easy for important information to drown in the flow of healthcare
          conversations. That's why we've built powerful conversation threads
          into Stitch Manage. Continue the discussion through comments on key
          posts so your team never loses track of what matters and where to find
          it. Progress notes, file uploads, lab results, referrals and
          prescriptions can all be turned into organized and ongoing discussions
          in Stitch Manage.
        </Feature>

        <Feature
          featureClassName="alt"
          heading="Upload images, audio, or video for access anywhere."
          image="/images/manage-feature-4.png"
        >
          Healthcare is all about data. That's why we've made it easy to upload
          files of nearly any type — JPEG, PNG, PDF, MP3, Word, Excel, and more.
          No more faxing or mailing your colleagues files. Just instantly share
          them in Stitch Manage. Need to access them in the field? We've got you
          covered. Stitch Manage has iOS and Android mobile support with
          complete feature parity, so you can relax knowing your data is
          available to you wherever you are.
        </Feature>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
