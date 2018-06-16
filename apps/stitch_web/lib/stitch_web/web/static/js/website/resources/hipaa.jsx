import React, { Component } from "react";

import Header from "../components/header";
import Subheader from "../components/subheader";
import Footer from "../components/footer";

export default class Hipaa extends Component {
  render() {
    return (
      <div className="security-page">
        <Header />

        <Subheader
          title="HIPAA Compliance"
          subtitle="Take a look at how we’ve made Stitch HIPAA compliant right out of the box."
        />

        <div className="container">
          <div className="copy-section">
            <h2>What is HIPAA?</h2>

            <p>
              HIPAA is the{" "}
              <a href="https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act">
                Health Insurance Portability and Accountability Act
              </a>. It’s a set of physical, technical and administrative
              standards intended to secure the sharing of medical data – also
              known protected health information (PHI).
            </p>
          </div>

          <div className="copy-section">
            <h2>Why is Stitch HIPAA compliant?</h2>

            <p>
              In September of 2013, the{" "}
              <a href="https://www.cms.gov/Regulations-and-Guidance/HIPAA-Administrative-Simplification/TransactionCodeSetsStands/index.html?redirect=/TransactionCodeSetsStands/02_TransactionsandCodeSetsRegulations.asp#TopOfPage">
                Final Omnibus Rule Update was passed
              </a>. It expanded the applicability of HIPAA from the traditional
              entities like hospitals and insurers to anyone who stores, manages
              or transmits PHI. These entities are now called Business
              Associates So, companies like Stitch.
            </p>
          </div>

          <div className="copy-section">
            <h2>Do I need HIPAA compliance?</h2>

            <p>
              All Covered Entities need to be HIPAA compliant. A Covered Entity
              is anyone who provides treatment, payment and operations in
              healthcare. So, this includes clinics, hospitals, independent
              practices, home health agencies, pharmacies and insurance
              companies.{" "}
              <a href="https://www.federalregister.gov/articles/2013/01/25/2013-01073/modifications-to-the-hipaa-privacy-security-enforcement-and-breach-notification-rules-under-the#h-95">
                The fines for HIPAA violations
              </a>{" "}
              can be pretty severe, up to $50,000 for a single incident. That’s
              why we’ve built Stitch. We want to provide a world-class
              communication experience where you don’t have to worry about
              security and can focus on what you do best: care for patients.
            </p>
          </div>

          <div className="copy-section">
            <h2>How does Stitch achieve HIPAA compliance?</h2>

            <p className="m-b-20">
              We take security very seriously at Stitch. We know you’re relying
              on us to protect your patient data, so we use only the highest
              levels of security and strictest practices to secure your PHI. To
              help us do this, we use{" "}
              <a href="https://www.aptible.com">Aptible</a>, a world-class HIPAA
              compliance deployment and management platform. Specifically, there
              are 4 HIPAA Rules that Stitch complies with to achieve the highest
              level of HIPAA compliance:
            </p>

            <ul>
              <li>
                HIPAA Security Rule:{" "}
                <span>
                  This breaks down to three layers: physical, technical and
                  administrative. Physical safeguards pertain to who can access
                  PHI and how that access is controlled. Stitch is hosted with{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://aws.amazon.com/compliance/hipaa-compliance/"
                  >
                    AWS
                  </a>, which provides much of the physical safeguarding.
                  Technical safeguards describe data transmission standards,
                  auditing practices and authentication measures. Administrative
                  safeguards mandate internal training, policies and procedures
                  we implement to secure your patient data. You can access the
                  HHS documentation{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.hhs.gov/hipaa/for-professionals/security/index.html"
                  >
                    here
                  </a>
                  .
                </span>
              </li>

              <li>
                HIPAA Privacy Rule:{" "}
                <span>
                  This rule instructs on how to handle a data breach and
                  disclose PHI to relevant individuals or parties. You can
                  access the HHS documentation{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.hhs.gov/hipaa/for-professionals/privacy/index.html"
                  >
                    here
                  </a>.
                </span>
              </li>

              <li>
                HIPAA Enforcement Rule:{" "}
                <span>
                  This is where the penalties, investigations and procedures for
                  violations are spelled out. You can access the HHS
                  documentation{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.hhs.gov/hipaa/for-professionals/special-topics/enforcement-rule/index.html"
                  >
                    here
                  </a>.
                </span>
              </li>

              <li>
                HIPAA Breach Notification Rule:{" "}
                <span>
                  This rule instructs us on how to handle a breach, including
                  the timeline for notifying patients and/or other parties
                  depending on the size of the breach. You can access the HHS
                  documentation{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html"
                  >
                    here
                  </a>.
                </span>
              </li>
            </ul>
          </div>

          <div className="copy-section">
            <h2>Can I see more information on Stitch’s technical security?</h2>

            <p>
              Absolutely. Here’s a dedicated risk assessment prepared for our
              specific technology:{" "}
              <a href="https://www.dropbox.com/s/9oe9qgr1vduvfmc/Stitch%20Risk%20Assessment%20v3.0.pdf?dl=1">
                Stitch Risk Assessment
              </a>.
            </p>
          </div>

          <div className="copy-section">
            <h2>How does the Business Associates Agreement (BAA) work?</h2>

            <p className="m-b-20">
              A Business Associate is a vendor or subcontractor who has access
              to PHI transmitted or stored by a covered entity. So, if you’re a
              medical clinic and you send patient data through Stitch, you’re a
              Covered Entity and we’re a Business Associate.
            </p>

            <p>
              Signing the BAA will ensure that we uphold our end of safeguarding
              and managing patient data properly. It will also clearly outline
              what services you should expect us to render, and what we are
              responsible for. A BAA is necessary for you to complete your HIPAA
              compliance. If you’re the admin for your carespace, you’ll be
              prompted to complete the BAA after creating your account.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
