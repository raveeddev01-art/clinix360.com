import React, { Component } from "react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import Header from "../components/header";
import Footer from "../components/footer";

export default class Baa extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="container baa-page">
          <Row>
            <Col sm={8} smOffset={2}>
              <div className="page-header">
                <h1>HIPAA Business Associate Agreement (BAA)</h1>
              </div>
              <p className="m-b-20">
                This Business Associate Agreement Addendum (this “Agreement”) by
                and between you (the “Covered Entity”) and Stitch Technologies,
                Inc. (“us”, “we”, the “Business Associate”) is, together with
                the <a href="/terms-of-service">Terms of Service</a> as amended
                by this Agreement, (a) is intended by the parties as a final,
                complete and exclusive expression of the terms of their
                agreement; and (b) supersedes all prior agreements and
                understandings (whether oral or written) between the parties
                with respect to the subject matter hereof.
              </p>

              <p>
                YOU ACKNOWLEDGE AND AGREE THAT, BY CLICKING ON THE "I AGREE" OR
                "I ACCEPT" BUTTON, OR ACCESSING OR USING THE SITE, SERVICES OR
                APPS, OR BY DOWNLOADING OR POSTING ANY CONTENT FROM OR THROUGH
                THE SITE, SERVICES OR APPS, YOU ARE INDICATING THAT YOU HAVE
                READ, AND UNDERSTAND AND AGREE TO BE BOUND BY, THESE TERMS,
                WHETHER OR NOT YOU HAVE REGISTERED VIA THE SITE OR APPS. IF YOU
                DO NOT AGREE TO THESE TERMS, THEN YOU HAVE NO RIGHT TO ACCESS OR
                USE THE SITE, SERVICES, APPS OR COLLECTIVE CONTENT.
              </p>

              <p>The parties hereby agree as follows:</p>

              <div className="page-header makeid" id="1-definitions">
                <h3>1. Definitions</h3>
              </div>

              <p>Specific definitions:</p>

              <ol className="list-alpha">
                <li>
                  <strong>Business Associate</strong>. “Business Associate”
                  shall generally have the same meaning as the term “business
                  associate” at 45 CFR 160.103, and in reference to the party to
                  this agreement, shall mean us.
                </li>
                <li>
                  <strong>Covered Entity</strong>. “Covered Entity” shall
                  generally have the same meaning as the term “covered entity”
                  at 45 CFR 160.103, and in reference to the party to this
                  agreement, shall mean you.
                </li>
                <li>
                  <strong>HIPAA Rules</strong>. “HIPAA Rules” shall mean the
                  Privacy, Security, Breach Notification, and Enforcement Rules
                  at 45 CFR Part 160 and Part 164.
                </li>
              </ol>

              <p>
                The following terms used in this Agreement shall have the same
                meaning as those terms in the HIPAA Rules:{" "}
                <strong>Breach</strong>, <strong>Data Aggregation</strong>,{" "}
                <strong>Designated Record Set</strong>,{" "}
                <strong>Disclosure</strong>,{" "}
                <strong>Health Care Operations</strong>,{" "}
                <strong>Individual</strong>, <strong>Minimum Necessary</strong>,{" "}
                <strong>Notice of Privacy Practices</strong>,{" "}
                <strong>Protected Health Information</strong>,{" "}
                <strong>Required By Law</strong>, <strong>Secretary</strong>,{" "}
                <strong>Security Incident</strong>,
                <strong>Subcontractor</strong>,{" "}
                <strong>Unsecured Protected Health Information</strong> and{" "}
                <strong>Use</strong>.
              </p>

              <div
                className="page-header makeid"
                id="2-our-obligations-and-activities"
              >
                <h3>2. Our Obligations and Activities</h3>
              </div>

              <p>We agree to:</p>

              <ol className="list-alpha">
                <li>
                  Not use or disclose protected health information other than as
                  permitted or required by this Agreement or as required by law;
                </li>
                <li>
                  Use appropriate safeguards, and comply with Subpart C of 45
                  CFR Part 164 with respect to electronic protected health
                  information, to prevent use or disclosure of protected health
                  information other than as provided for by the Agreement or the{" "}
                  <a href="/terms-of-service">Terms of Service</a>;
                </li>
                <li>
                  Report to you any use or disclosure of protected health
                  information not provided for by the Agreement of which we
                  become aware, including breaches of unsecured protected health
                  information as required at 45 CFR 164.410, and any security
                  incident of which we become aware;
                </li>
                <li>
                  In accordance with 45 CFR 164.502(e)(1)(ii) and 164.308(b)(2),
                  if applicable, ensure that any subcontractors that create,
                  receive, maintain, or transmit protected health information on
                  our behalf agree to the same restrictions, conditions, and
                  requirements that apply to us with respect to such
                  information, and we will first provide you a list of any
                  subcontractors to gain your permission for such access;
                </li>
                <li>
                  Make available to you protected health information in a
                  designated record set as necessary to satisfy your obligations
                  under 45 CFR 164.524;
                </li>
                <li>
                  Make any amendments to protected health information in a
                  designated record set as directed or agreed to by you pursuant
                  to 45 CFR 164.526, or take other measures as necessary to
                  satisfy your obligations under 45 CFR 164.526;
                </li>
                <li>
                  Maintain and make available the information required to
                  provide an accounting of disclosures to you as necessary to
                  satisfy your obligations under 45 CFR 164.528;
                </li>
                <li>
                  Comply with the requirements of Subpart E that apply to you in
                  the performance of your obligations under Subpart E of 45 CFR
                  Part 164, to the extent we are to carry out one or more of
                  such obligations; and
                </li>
                <li>
                  Make our internal practices, books, and records available to
                  the Secretary for purposes of determining compliance with the
                  HIPAA Rules.
                </li>
              </ol>

              <div
                className="page-header makeid"
                id="3-permitted-uses-and-disclosures-by-business-associate"
              >
                <h3>3. Permitted Uses and Disclosures by Business Associate</h3>
              </div>

              <ol className="list-alpha">
                <li>
                  We shall only use or disclose protected health information as
                  necessary to perform the services set forth in the{" "}
                  <a href="/terms-of-service">Terms of Service</a> agreement
                  between the parties.
                </li>
                <li>
                  We shall use or disclose protected health information as
                  required by law.
                </li>
                <li>
                  We agree to make uses and disclosures and requests for
                  protected health information consistent with your minimum
                  necessary policies and procedures.
                </li>
                <li>
                  We shall not use or disclose protected health information in a
                  manner that would violate Subpart E of 45 CFR Part 164 if done
                  by you, except for the specific uses and disclosures set forth
                  below.
                </li>
                <li>
                  We may use protected health information for our own proper
                  managerial and administrative duties, or to carry out our
                  legal responsibilities, and we will not disclose PHI to anyone
                  not needing this information to perform these duties and
                  responsibilities.
                </li>
                <li>
                  We may disclose protected health information for our own
                  proper managerial and administrative functions, or to carry
                  out our legal responsibilities, provided the disclosures are
                  required by law, or that we obtain reasonable assurances from
                  the person to whom the information is disclosed that the
                  information will remain confidential and used or further
                  disclosed only as required by law or for the purposes for
                  which it was disclosed to the person, and the person notifies
                  us of any instances of which it is aware in which the
                  confidentiality of the information has been breached.
                </li>
                <li>
                  We may provide data aggregation services relating to your
                  health care operations, and we will first provide you a list
                  of these services to seek your permission, and you will not be
                  directly or indirectly identified.
                </li>
              </ol>

              <div
                className="page-header makeid"
                id="4-provisions-for-covered-entity-to-inform-business-associate-of-privacy-practices-and-restrictions"
              >
                <h3>
                  4. Provisions for Covered Entity to Inform Business Associate
                  of Privacy Practices and Restrictions
                </h3>
              </div>

              <ol className="list-alpha">
                <li>
                  You agree to notify us of any limitations in your notice of
                  privacy practices under 45 CFR 164.520, to the extent that
                  such limitation may affect our use or disclosure of protected
                  health information.
                </li>
                <li>
                  You agree to notify us of any changes in, or revocation of,
                  the permission by an individual to use or disclose his or her
                  protected health information, to the extent that such changes
                  may affect our use or disclosure of protected health
                  information.
                </li>
                <li>
                  You agree to notify us of any restriction on the use or
                  disclosure of protected health information that you have
                  agreed to or are required to abide by under 45 CFR 164.522, to
                  the extent that such restriction may affect our use or
                  disclosure of protected health information.
                </li>
              </ol>

              <div
                className="page-header makeid"
                id="5-permissible-requests-by-covered-entity"
              >
                <h3>5. Permissible Requests by Covered Entity</h3>
              </div>

              <p>
                You shall not request that we use or disclose protected health
                information in any manner that would not be permissible under
                Subpart E of 45 CFR Part 164 if done by you, except as specified
                in Section 3 of this Agreement.
              </p>

              <div className="page-header makeid" id="6-term-and-termination">
                <h3>6. Term and Termination</h3>
              </div>

              <ol className="list-alpha">
                <li>
                  <strong>Term</strong>. The Term of this Agreement shall be
                  effective as of the Agreement Effective Date, and shall
                  continue in perpetuity until either party terminates the
                  agreement.
                </li>
                <li>
                  <strong>Termination</strong>. Either party has the right to
                  terminate this Agreement for any reason upon 90 days prior
                  written notice to the other party. A material breach of this
                  Agreement will be treated as a material breach of the{" "}
                  <a href="/terms-of-service">Terms of Service</a>.
                </li>
                <li>
                  <strong>
                    Obligations of Business Associate Upon Termination
                  </strong>.
                  <p>
                    Upon termination of this Agreement for any reason, with
                    respect to protected health information received from you,
                    or created, maintained, or received by us on your behalf, we
                    shall:
                  </p>
                  <ol>
                    <li>
                      Retain only that protected health information which is
                      necessary for us to continue to properly perform our own
                      managerial and administrative duties, or to carry out our
                      legal responsibilities, by employees of our company on a
                      need to know basis;
                    </li>
                    <li>
                      Destroy the remaining protected health information that we
                      still maintain in any form;
                    </li>
                    <li>
                      Continue to use appropriate safeguards and comply with
                      Subpart C of 45 CFR Part 164 with respect to electronic
                      protected health information to prevent use or disclosure
                      of the protected health information, other than as
                      provided for in this Section, for as long as we retain the
                      protected health information;
                    </li>
                    <li>
                      Not use or disclose the protected health information we
                      retain other than for the purposes for which such
                      protected health information was originally retained, and
                      subject to the conditions in Section 3 of this Agreement
                      which applied prior to termination; and
                    </li>
                    <li>
                      Destroy the protected health information we retain when it
                      is no longer needed to properly perform our own managerial
                      and administrative duties, or to carry out our legal
                      responsibilities.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>Survival</strong>. The obligations the parties under
                  this Section shall survive the termination of this Agreement.
                </li>
              </ol>
            </Col>
          </Row>
        </div>
        <Footer />
      </div>
    );
  }
}
