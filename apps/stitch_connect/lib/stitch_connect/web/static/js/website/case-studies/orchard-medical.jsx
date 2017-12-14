import React, { Component } from "react";

import Header from "../components/header";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

export default class CaseOrchardMedical extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="case-study">
          <div className="subheader ">
            <div className="container">
              <div className="landing-message text-center">
                <h1>Customers</h1>
                <h3>Orchard Medical Associates</h3>
              </div>
            </div>
          </div>

          <div className="overview text-center">
            <div className="container">
              <div className="flex-box">
                <div className="flex-item">
                  <h4 className="text-uppercase">Specialty</h4>
                  <p className="m-b-0">Primary Care</p>
                </div>

                <div className="flex-item">
                  <h4 className="text-uppercase">Employees</h4>
                  <p className="m-b-0">11 Staff</p>
                </div>

                <div className="flex-item">
                  <h4 className="text-uppercase">Patients</h4>
                  <p className="m-b-0">17,500 visits</p>
                </div>

                <div className="flex-item">
                  <h4 className="text-uppercase">Location</h4>
                  <p className="m-b-0">MA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="case-study-content">
              <h3 className="text-center">
                Orchard Medical uses Stitch as a phone system replacement to
                improve <br />the efficiency of clinical coordination
              </h3>

              <hr />

              <h4 className="m-b-30">A close-knit primary care practice</h4>

              <p className="m-b-40">
                Orchard Medical Associates is a comprehensive primary care
                practice based in Massachusetts. It’s an independently owned
                practice providing the full spectrum of care, from birth to
                death. The practice is focused on serving the local community
                and maintaining human, personal connections between providers
                and their patients. “We want to stay as private and personal for
                as long as we can. That's our mission. It's really about as
                basic as it can be, and it’s the best family in the world,” says
                Maria St. Marie, Practice Manager.
              </p>

              <h4 className="m-b-30">
                Handling clinical coordination one task at a time
              </h4>

              <p className="m-b-30">
                Most healthcare practices like Orchard Medical rely heavily on
                phone and in-person communication. “Before using Stitch, we
                would beep everyone at their stations. Everyone has a phone at
                their station, and so we would just beep them at their station
                with whatever question we had,” says St. Marie.
              </p>

              <p className="m-b-30">
                This creates a workflow where staff are often blocked; phone and
                in-person communication don’t offer a good way to communicate
                with someone who’s currently occupied. St. Marie gives an
                example: “Many times a patient, say Susan, would be calling in
                with a question, and we would try to let the Medical Assistant
                (MA) know, ‘Susan is waiting, she's calling in.’ But the MA
                would be on her phone with another patient. So we'd have to hold
                and hold just to reach the MA.”
              </p>

              <p className="m-b-40">
                On a busy clinical day, staff have dozens of tasks they need to
                complete and numerous colleagues they need to consult and
                collaborate with to deliver optimal patient care. Phone calls
                can be a great solution for extended dialogue, but they block
                any other staff from communication during that time period. This
                makes it a challenge to efficiently move through a workday that
                depends on communication with multiple colleagues and effective
                multi-tasking.
              </p>

              <h4 className="m-b-30">
                The search for an alternative to the phone system
              </h4>

              <p className="m-b-40">
                Orchard Medical wanted a better way for staff to coordinate
                throughout the clinical day, and turned to Stitch as a solution.
                St. Marie describes her experience spearheading adoption:
                “Getting set up on the app and learning how to use it was really
                pretty easy. It was myself and one of the other team members
                here — we just downloaded it and installed it and started using
                it right away. Then, we went around to all the stations and
                installed Stitch. The rest is pretty self explanatory. It really
                took no time at all and there wasn't an intense amount of
                training.”
              </p>

              <div className="quote text-center">
                <i className="fa fa-quote-left fa-3x m-b-10" />
                <h5 className="m-b-20">
                  I would think anybody could learn how to use <br />Stitch in a
                  matter of minutes.
                </h5>

                <div className="name">
                  <strong>Maria St. Marie</strong>
                </div>
                <div className="position">Practice Manager</div>
              </div>

              <h4 className="m-b-30">Unblocking the clinical workflow</h4>

              <p className="m-b-40">
                Stitch has changed the way care coordination happens at Orchard
                Medical. “Now, we just Stitch the MA and say ‘Susan is returning
                your call on Line 1.’ This way, when the MA is done, they have
                the message in front of them and they'll just pick up the phone
                and complete the waiting call. It saves us time from waiting and
                waiting,” says St. Marie. Stitch has enabled the core workflow
                at Orchard Medical to become asynchronous, leading to gains in
                efficiency and productivity.
              </p>

              <div className="infographic dssi-infographic text-center">
                <img
                  className="img-responsive"
                  src="/images/orchard-infographic-1.png"
                  alt="Orchard Medical Associates Results"
                />
              </div>

              <p className="m-b-40">
                “We can easily put a call on hold, let someone know a call is
                being returned, and then just forget about it and resume doing
                whatever else we need to do. That's instead of waiting to get
                back to someone, or waiting until someone's off the phone. It
                has cut back on quite a bit of time. We don't have to get up and
                go down the hall — we have a really big office — ask someone a
                question and come back. When you have 3 people on hold, it's
                just easier to send a Stitch, get your answer and move on,”
                explains St. Marie.
              </p>

              <h4 className="m-b-30">A new way of communicating</h4>

              <p className="m-b-40">
                Orchard Medical Associates sees over 17,000 patient visits a
                year. Stitch now filters nearly all clinical communication about
                these patients: medical questions, patient intake, scheduling
                logistics and billing clarifications. Ultimately, the effect has
                been an improvement in the ability of Orchard Medical to deliver
                the quality of care the organization is on a mission to provide.
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
