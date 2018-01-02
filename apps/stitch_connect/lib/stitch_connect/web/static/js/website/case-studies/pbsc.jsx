import React, { Component } from "react";

import Header from "../components/header";
import Subheader from "../components/subheader";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

export default class CasePBSC extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="case-study">
          <Subheader title="Customers" subtitle="Princeton Brain & Spine" />

          <div className="overview text-center">
            <div className="container">
              <Row>
                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Specialty</h5>
                  <p>Neurosurgical</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Employees</h5>
                  <p>60 Staff</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Patients</h5>
                  <p>5,500 visits</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Location</h5>
                  <p>NJ & PA</p>
                </Col>
              </Row>
            </div>
          </div>

          <div className="container">
            <div className="case-study-content">
              <h3 className="text-center">
                Princeton Brain & Spine uses Stitch to coordinate care across
                multiple locations and improve the patient experience
              </h3>

              <hr />

              <h4 className="m-b-30">
                Leading the nation in neurosurgical practice
              </h4>

              <p className="m-b-30">
                Princeton Brain & Spine is one of America's leading
                neurosurgical practices, with multiple locations in New Jersey
                and Pennsylvania. It specializes in the treatment of brain
                tumors, spinal disease, stenosis, degenerative conditions,
                trigeminal neuralgia and vascular conditions.
              </p>

              <p className="m-b-30">
                The foundation of the practice is centered around the patient.
                “When you’re here, you will be treated with respect, our time
                and you will be given the very best of us,” says Dr. Nirav Shah,
                Medical Director. “We’ve built a circle of trust, compassion and
                skill that is almost unheard of in today’s world.”
              </p>

              <p className="m-b-40">
                Lyndsey Caliendo, Director of Operations and Business
                Development, credits Princeton Brain & Spine’s success to the
                organizational philosophy of innovation and experimentation.
                “Doctors here are all really interested in new and changing
                technologies, and growing in healthcare with technology. They’re
                really open to new ideas and trying new tools.” When Princeton
                Brain & Spine hit a communication challenge as it scaled, the
                organization turned to Stitch as a new innovation to evaluate.
              </p>

              <h4 className="m-b-30">
                Communicating across multiple locations is a challenge
              </h4>

              <p className="m-b-30">
                As a multi-site practice coordinating patient care, Princeton
                Brain & Spine sought out Stitch to improve the collaboration
                between providers in different locations. “Part of the
                operations challenge of our practice is that our physicians are
                going in and out of rooms with a virtual scribe. So the scribe
                is never really in the same office as the physician,” explains
                Caliendo. Princeton Brain & Spine uses GoToMeeting to virtually
                connect scribes and physicians, an innovative model that allows
                the organization to scale across multiple locations and work
                with the best medical talent. But with colleagues working from
                multiple locations, there comes a major communication challenge.
              </p>

              <p className="m-b-30">
                Even within a location, there were signs that communication
                needed to be improved. Daniel Somma, Clinical Assistant and
                Medical Scribe, explains that “before we had Stitch, we would
                just call each other. It was very tough for the scribes to
                multitask. We didn’t have phones in the exam rooms, so if we
                found out that a patient had an extra report that we needed to
                get from another office, we would have to leave the room, go to
                the front desk, or call the front desk.”
              </p>

              <p className="m-b-40">
                To solve the problem of inter- and intra-office communication,
                Princeton Brain & Spine turned to Stitch.
              </p>

              <h4 className="m-b-30">
                A smooth transition to running on Stitch
              </h4>

              <p className="m-b-40">
                Adopting a new technology can be met with inertia — especially
                so with a tool that touches every member of the team. But by
                using internal product champions, Princeton Brain & Spine easily
                navigated the transition to Stitch. “It was a very easy
                transition. Everyone was really happy with it, even the
                physicians. It didn’t just do what we were hoping it would do,
                which was to connect the physicians, scribes and the front
                office; it also created a bridge to the billing office as well,”
                explains Caliendo.
              </p>

              <div className="quote text-center">
                <i className="fa fa-quote-left fa-3x m-b-10" />
                <h5 className="m-b-20">
                  Being able to provide real-time responses leads to a huge
                  increase in the quality of patient care.
                </h5>

                <div className="name">
                  <strong>Lyndsey Caliendo</strong>
                </div>
                <div className="position">Director of Operations</div>
              </div>

              <p className="m-b-40">
                By bringing the full team on board, Princeton Brain & Spine was
                able to connect every part of the patient journey via Stitch:
                check-in, consultation, billing, scheduling and follow-up. With
                the entire team able to coordinate on each individual patient,
                Princeton Brain & Spine saw reductions in their patient wait
                times through improved care coordination.
              </p>

              <div className="infographic text-center">
                <h5 className="m-b-30">
                  How much has Stitch helped{" "}
                  <span>
                    reduce <br />patient wait times
                  </span>?
                </h5>
                <img
                  className="img-responsive"
                  src="/images/pbsc-infographic-1.png"
                  alt="PBSC Wait Times Graphic"
                />
              </div>

              <p className="m-b-40">
                By using Stitch’s deep search function, team members were also
                able to more easily find the critical information needed to
                provide the correct care. As a result, a significant portion of
                team members reported reductions in the likelihood of a clinical
                error occurring as a result of communication issues:
              </p>

              <div className="infographic text-center">
                <img
                  className="img-responsive"
                  src="/images/pbsc-infographic-2.png"
                  alt="PBSC Minimize Clinical Error"
                />
              </div>

              <p className="m-b-40">
                Finally, Princeton Brain & Spine members reported feeling more
                confident that their internal communications were being seen.
                Features like message read receipts helped team members improve
                accountability and improve response times:
              </p>

              <div className="infographic text-center">
                <img
                  className="img-responsive"
                  src="/images/pbsc-infographic-3.png"
                  alt="PBSC Response Time"
                />
              </div>

              <h4 className="m-b-30">A new way of communicating</h4>

              <p className="m-b-40">
                Princeton Brain & Spine has already sent over 50,000 messages on
                Stitch. The platform now filters nearly all communication at the
                practice: patient flow, script ordering, billing logistics and
                clinical clarifications. Ultimately, the effect has been an
                increase in the quality of patient care and the efficiency of
                the organization. “We can communicate immediately with someone
                to get an answer, or to tell them that something needs to be
                done quickly. This has been really helpful. So I definitely
                think Stitch has reduced clinical errors,” believes Somma. “I
                would absolutely recommend Stitch to other practices,” adds
                Caliendo.
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
