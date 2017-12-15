import React, { Component } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Panel from "react-bootstrap/lib/Panel";
import Button from "react-bootstrap/lib/Button";

export default class Blog extends Component {
  render() {
    return (
      <div className="blog-page">
        <Header />

        <div className="subheader text-center">
          <div className="container">
            <h1>To the Point</h1>
            <h3 className="m-b-30">
              Stories and updates from the Stitch Health team, customers and
              partners.
            </h3>
          </div>
        </div>

        <div className="container">
          <Row>
            <Col sm={10} smOffset={1}>
              <h3 className="text-center date">
                <span>December 18th, 2017</span>
              </h3>
              <Panel className="m-b-50">
                <h2 className="text-center m-b-40">
                  Introducing Stitch: tools for making healthcare a great
                  customer experience
                </h2>

                <h3 className="m-b-30">Healthcare is hard</h3>

                <p className="m-b-30">
                  Healthcare is a uniquely frustrating experience. Patients are
                  often disappointed by fragmented coordination of their care,
                  face difficulty in communicating with their providers and
                  struggle to find care when and where they need it. The result
                  is a patient experience that leaves many consumers of health
                  care deeply unsatisfied.
                </p>

                <p className="m-b-30">
                  Healthcare is challenging for providers too. Patients are
                  complex, often presenting with multiple chronic conditions
                  compounded by socioeconomic challenges. When a patient sees a
                  single provider, there’s often an entire team of doctors,
                  nurses, case managers, social workers, and pharmacists working
                  together to coordinate every step of the patient experience:
                  check-in, demographic and history intake, vitals collection,
                  physical examination, referral processing, tests and labs
                  ordering, prescribing medications, and social work follow up.
                </p>

                <p className="m-b-30">
                  And while there have been many advances in healthcare over the
                  years, the industry’s means of care coordination has largely
                  stayed the same: a mish-mash of phone calls, faxes, pagers,
                  spreadsheets, and emails.
                </p>

                <p className="m-b-30">
                  It seems crazy that healthcare, which deals with life and
                  death issues, runs this way when modern tools are
                  revolutionizing nearly every other industry. Fortunately, two
                  key trends have finally primed the industry for a major
                  paradigm shift:
                </p>

                <h3 className="m-b-30">
                  1. Consumerization and customer first healthcare
                </h3>

                <p className="m-b-30">
                  Historically, healthcare tools have been built for a singular
                  purpose: billing. This focus has naturally emerged as a result
                  of our fee-for-service compensation model. And the core
                  software tool for healthcare, the Electronic Medical Record,
                  reflects this priority. EMRs are optimized for code entry and
                  insurance reimbursement, not offering a great customer
                  experience.
                </p>

                <p className="m-b-30">
                  Today, in the wake of the consumerization of healthcare, we’re
                  experiencing a new prioritization on the customer experience.
                  And the evidence is everywhere. For example,{" "}
                  <a href="https://www.wsj.com/articles/what-doctors-are-doing-about-bad-reviews-online-1498442580">
                    77% of consumers say they use online reviews
                  </a>{" "}
                  as the first step in finding a new physician. And it turns out
                  that{" "}
                  <a href="https://www.beckershospitalreview.com/hospital-management-administration/patients-no-1-complaint-front-desk-staff.html">
                    96% of patient complaints are related to customer service
                  </a>, while only 4 percent are about the quality of clinical
                  care or misdiagnoses.
                </p>

                <p className="m-b-30">
                  On top of that, pay-for-performance is picking up steam among
                  policymakers and private and public payers, including Medicare
                  and Medicaid. For example, the ACA expands the use of
                  pay-for-performance approaches in Medicare. And Hospital
                  Consumer Assessment of Healthcare Providers and Systems
                  (HCAHPS) survey scores now tie hospital reimbursement to
                  patient satisfaction.
                </p>

                <h3 className="m-b-30">
                  2. Renaissance of enterprise software
                </h3>

                <p className="m-b-30">
                  Companies like Slack, Atlassian, Salesforce, and Zendesk have
                  revolutionized how collaboration is viewed in the tech
                  industry. A new value paradigm has arrived that places heavy
                  emphasis on tools that help teams be more connected and
                  productive. Healthcare has closely watched these changes,
                  priming the industry to receive a new wave of enterprise
                  tools.
                </p>

                <p className="m-b-30">
                  Meanwhile, the technology itself has finally hit a critical
                  threshold. Mobile is now robust enough to power the complex
                  workflows of providers in the field. Cross-platform technology
                  can now keep teams in sync across different settings,
                  providing necessary reliability for an industry built on life
                  and death communication.
                </p>

                <p className="m-b-30">
                  This conjunction of trends in healthcare consumerization and
                  technology development means that there’s never been a better
                  time than now to offer healthcare teams a new way to work
                  together.
                </p>

                <h3 className="m-b-30">
                  That’s why today, we’re introducing Stitch – a home base for
                  healthcare teams to work together.
                </h3>

                <p className="m-b-30">
                  Unlike the software of yesterday, Stitch’s suite of tools
                  focuses on three core pillars of patient care: team
                  collaboration, patient engagement, and patient management.
                  Stitch is specifically designed for how healthcare teams work:
                </p>

                <ul className="m-b-30">
                  <li>
                    <strong>Team-oriented:</strong> Tying different pieces of
                    work into a single, cohesive view so all team players can
                    see and contribute to the bigger picture
                  </li>

                  <li>
                    <strong>Patient-centered:</strong> Creating a single source
                    of truth for all collaboration around a patient
                  </li>

                  <li>
                    <strong>Cross-platform:</strong> Making Stitch easily
                    available anywhere providers operate (desktop, iOS, or
                    Android)
                  </li>
                </ul>

                <p className="m-b-30">
                  By offering these capabilities, we believe Stitch can empower
                  healthcare teams to work better together and with their
                  patients.
                </p>

                <p className="m-b-30">
                  While today marks the public release of our ecosystem of
                  healthcare tools, we’re proud to already be working with 70
                  leading healthcare organizations, including{" "}
                  <a href="https://luminancerecovery.com/">
                    Luminance Recovery
                  </a>,{" "}
                  <a href="http://www.princetonbrainandspine.com/">
                    Princeton Brain & Spine
                  </a>, and <a href="http://dermntx.com/">DSSI</a>. We are also
                  thrilled to announce our Series A funding, led by Bill Gurley
                  of Benchmark, with participation from Y Combinator Continuity,
                  to help us bring Stitch to more healthcare organizations and
                  their patients.
                </p>

                <p className="m-b-40">
                  The mission of Stitch is to empower healthcare teams to build
                  high-quality customer experiences for their patients. If
                  you’re passionate about this movement, join us! We’re{" "}
                  <a href="https://teamstitchapp.com/jobs">hiring</a>.
                </p>

                <ul className="list-inline text-center m-b-30 share-buttons">
                  <li>
                    <a href="#" className="btn-facebook">
                      <i className="fa fa-facebook" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="btn-twitter">
                      <i className="fa fa-twitter" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="btn-linkedin">
                      <i className="fa fa-linkedin" />
                    </a>
                  </li>
                </ul>
              </Panel>
            </Col>
          </Row>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
