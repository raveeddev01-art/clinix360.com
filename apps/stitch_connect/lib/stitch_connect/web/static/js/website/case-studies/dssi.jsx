import React, { Component } from "react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import Header from "../components/header";
import Subheader from "../components/subheader";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

export default class CaseDSSI extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="case-study">
          <Subheader
            title="Customers"
            subtitle="Dermatology & Skin Surgery Institute"
          />

          <div className="overview text-center">
            <div className="container">
              <Row>
                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Specialty</h5>
                  <p>Dermatology</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Employees</h5>
                  <p>13 Staff</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Patients</h5>
                  <p>1,000 visits</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Location</h5>
                  <p>Texas</p>
                </Col>
              </Row>
            </div>
          </div>

          <div className="container">
            <div className="case-study-content">
              <h3 className="text-center">
                DSSI uses Stitch to offer a world-class patient experience and
                boost clinical efficiency
              </h3>

              <hr />

              <h4 className="m-b-30">A leader in dermatological care</h4>

              <p className="m-b-30">
                DSSI was founded in 2009 and has rapidly grown to a renowned
                dermatology center providing exemplary care for Texas patients.
                The institute specializes in microscopic tissue analysis, skin
                cancer surgical procedures and advanced reconstructive
                techniques. It provides care to a wide range of patients, from
                infancy to geriatrics.
              </p>

              <p className="m-b-40">
                The high quality of patient care DSSI offers has lead to
                tremendous growth of the organization. “We were in a 2,500
                square foot facility and in the last year we’ve almost tripled
                our size. We’re increasing our patients by the day and we’re
                growing fast,” says DSSI founder Brent Spencer. “We’re very
                customer service oriented in our practice,” explains Spencer,
                crediting part of the organization's growth to their focus on an
                incredible customer experience.
              </p>

              <h4 className="m-b-30">
                Real-time care coordination is a challenge
              </h4>

              <p className="m-b-30">
                DSSI, a high throughput clinical organization, requires multiple
                parties to communicate in real-time to achieve care
                coordination. “When we moved to our new facility, we found the
                clinical areas much more segregated from our front desk and
                check-in areas. We realized we had to come up with some type of
                communication platform to facilitate patient care,” says
                Spencer. Elena Hendriksen, Office and Billing Manager, explains
                that “it was tough when we had decisions that needed to be made
                immediately and one of the providers was in a room with a
                patient for 20-30 minutes. I would have something that needed to
                be urgently taken care of, and you don’t want to be
                disrespectful to the patient by taking time away from their
                appointment.”
              </p>

              <p className="m-b-30">
                This is a common problem faced by many healthcare organizations:
                asynchronous task handling. Providers see patients for extended
                periods of time throughout the clinical day, but urgent matters
                of patient care constantly arise while providers conduct
                consultations or perform procedures.
              </p>

              <p className="m-b-40">
                Given its focus on an outstanding customer experience, DSSI
                looked to Stitch to unblock providers during consultation and
                allow them to rapidly handle urgent clinical tasks without
                interrupting the patient experience.
              </p>

              <h4 className="m-b-30">
                Using Stitch to deliver a better patient experience
              </h4>

              <p className="m-b-40">
                DSSI rolled out Stitch across the organization for real-time
                communication. As a result, support staff can now instantly
                communicate with providers to resolve urgent clinical issues
                without interrupting patient consultations. “I definitely think
                Stitch has helped improve our patient care. Being able to access
                providers so quickly and ask quick questions is helpful,”
                explains Hendricksen. “For example, even though the patient may
                have been in the room with the doctor for 20-30 minutes, they’ll
                come up to the front desk and have additional clinical
                questions. So with Stitch we’re able to still have access to the
                provider immediately, while the patient is right in front of us,
                and take care of their issues efficiently.”
              </p>

              <div className="quote dssi-quote text-center">
                <i className="fa fa-quote-left fa-3x m-b-10" />
                <h5 className="m-b-20">
                  The interface on Stitch is very intuitive. It wasn’t something
                  that we had to dedicate any training to because people already
                  knew how to use it out of the box.
                </h5>

                <div className="name">
                  <strong>Brent Spencer</strong>
                </div>
                <div className="position">DSSI Owner</div>
              </div>

              <p className="m-b-40">
                Spencer gives an additional example of how DSSI has been able to
                improve the quality of patient care by using Stitch. “We’re able
                to use Stitch while we’re in the room with patients to give
                price estimates in real-time. We’ll be in an exam room and a
                patient will want to know how much a service will cost. We can
                quickly send that to the front desk, they’ll see it, and we’ll
                get an estimate back in less than a minute. So this can help
                improve patient care because they can make a decision right then
                and there instead of having to wait.”
              </p>

              <div className="quote dssi-quote text-center">
                <i className="fa fa-quote-left fa-3x m-b-10" />
                <h5 className="m-b-20">
                  I don’t know how we would function without it. It’s been
                  amazing.
                </h5>

                <div className="name">
                  <strong>Crystal Hall</strong>
                </div>
                <div className="position">DSSI Admin</div>
              </div>

              <p className="m-b-40">
                By funneling all communication through Stitch, DSSI also
                experienced a new benefit: conversation archival. Spencer
                explains that ”sometimes you’ll have patients say that you did
                something, so the archival ability is nice to have from a
                medical legal standpoint, among other things.” Healthcare teams
                generally communicate through SMS, sticky notes, phone calls,
                pagers and faxes, none of which are easily traceable or
                searchable.
              </p>

              {/* <div className="infographic text-center">
                <img
                  className="img-responsive"
                  src="/images/pbsc-infographic-2.png"
                  alt="PBSC Minimize Clinical Error"
                />
              </div> */}

              <h4 className="m-b-30">
                DSSI sees improvements to patient care and team productivity
              </h4>

              <p className="m-b-40">
                After deploying Stitch across the organization, DSSI saw marked
                improvements in their ability to deliver the highest possible
                quality of care:
              </p>

              <div className="infographic dssi-infographic text-center">
                <img
                  className="img-responsive"
                  src="/images/dssi-infographic-1.png"
                  alt="DSSI Results"
                />
              </div>

              <p className="m-b-40">
                DSSI has already communicated over 14,000 messages on Stitch.
                It’s become the central tool for clinical coordination at the
                institute, and helped DSSI further deepen its strength in
                patient-centered care. As DSSI continues to grow, Stitch aims to
                be a core tool the institute can rely on for delivering the
                highest quality patient care possible.
              </p>
            </div>
          </div>
        </div>

        <GetStarted />
        <Footer />
      </div>
    );
  }
}
