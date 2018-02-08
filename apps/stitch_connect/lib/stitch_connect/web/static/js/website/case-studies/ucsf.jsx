import React, { Component } from "react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import Header from "../components/header";
import GetStarted from "../components/get-started";
import Footer from "../components/footer";

export default class CaseUCSF extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="case-study">
          <div className="subheader ">
            <div className="container">
              <div className="landing-message text-center">
                <h1>Customers</h1>
                <h3>UCSF Citywide</h3>
              </div>
            </div>
          </div>

          <div className="overview text-center">
            <div className="container">
              <Row>
                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Specialty</h5>
                  <p>Behavioral Health</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Employees</h5>
                  <p>10 Staff</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Patients</h5>
                  <p>400 visits</p>
                </Col>

                <Col xs={6} sm={3}>
                  <h5 className="text-uppercase">Location</h5>
                  <p>San Francisco</p>
                </Col>
              </Row>
            </div>
          </div>

          <div className="container">
            <div className="case-study-content">
              <h3 className="text-center">
                UCSF Citywide implements Stitch to unite team communication
                across the city and improve client care
              </h3>

              <hr />

              <h4 className="m-b-30">
                A UCSF and SF Department of Public Health joint effort
              </h4>

              <p className="m-b-30">
                Since 1981, the Division of Citywide Case Management Programs
                has operated under the direction of the Department of Psychiatry
                at Zuckerberg San Francisco General Hospital and Trauma Center.
                Its mission is to support the recovery of San Francisco’s
                highest risk mentally ill adults and to reduce their use of
                institutional and acute care: psychiatric emergency services,
                hospital care or jails. Citywide Focus serves 400 of the highest
                consumers of San Francisco Community Behavioral Health Services
                (CBHS) acute services.
              </p>

              <p className="m-b-40">
                Tara Collins, MD, MPH is UCSF Faculty and part of the Citywide
                effort. “We're here to help people with chronic and severe
                mental illness lead fulfilling lives to the best of their
                ability. Our focus is to assist people in their recovery and
                improve their quality of life and function, and keep people out
                of the hospital and housed,” says Collins. “We have people who
                went to the emergency room multiples times a day, every day, and
                now not at all.”
              </p>

              <h4 className="m-b-30">
                Intensive case management brings unique communication challenges
              </h4>

              <p className="m-b-30">
                Citywide works with a smaller number of patients that require an
                extraordinary level of attention and management. “One of the
                things about intensive case management is that case managers are
                really busy. They're out and about doing things with clients in
                their communities, so we might have only 1 or 2 people here and
                everybody else is out,” explains Collins.
              </p>

              <p className="m-b-30">
                Case managers operate all over the city of San Francisco working
                closely with patients, which makes phone and email communication
                extremely difficult. Citywide tried texting as a solution, “but
                different people are out on different days, different people
                have different work schedules, vacations, sick days, etc., so
                you might be working on a text message chain with people from
                the day before, and then the next day the list completely
                changes. It was constantly ‘Can you please take me off of this?’
                or ‘We need to add somebody on this.’ or ‘Somebody missed
                that,’” recounts Collins.
              </p>

              <p className="m-b-40">
                Citywide recognized the need for a better way to communicate,
                and turned to Stitch.
              </p>

              <h4 className="m-b-30">A quick transition to using Stitch</h4>

              <p className="m-b-40">
                Organizations often face challenges in adopting new
                technologies, and one of the best approaches is to utilize a
                product champion. At Citywide, that was Collins. “Making sure
                everyone used Stitch boiled down to me going around to
                everyone's desk and saying, ‘Did you put Stitch on your phone? I
                can show you how. Did you know you can use Stitch on a computer
                too? Let me should you how to do that.’ Following a successful
                rollout, Citywide began benefiting from the impacts of Stitch.
              </p>

              <h4 className="m-b-30">
                Uniting a team spread out across San Francisco
              </h4>

              <p className="m-b-30">
                Jeremy Lightell is a Clinical Social Worker and has been at UCSF
                Citywide for over 4 years. He explains the significance of
                uniting team communication: “Especially with a team like ours
                that is spread out in the community, it's really important.
                There will be days where I'm in the Sunset, I'm in the Mission,
                I'm in the Tenderloin, but we still need to coordinate. We're
                working with a population that has a variety of different needs.
                Being able to get information and coordinate with each other
                quickly from various locations is very helpful.”
              </p>

              <p className="m-b-30">
                Collins recalls a specific example of working with Lightell, “I
                remember you were at a primary care appointment with a client
                and needed the meds list. So I just sent you the meds list on
                Stitch and you were able to take it in immediately. You can just
                send it because it's HIPAA compliant. I don't have to attach it
                to an email or scan it or do anything else to it. I can just
                send it and it's there. Quick.”
              </p>

              <p className="m-b-40">
                Stitch has also helped Citywide case managers feel more secure
                in their work while out in the city. Lightell explains, “In more
                emergency situations, there might be more risk if you're out in
                the community and a client becomes hostile. You can utilize a
                quick way of getting colleagues aware of the situation or out
                there to be with you. At least just let your team know what's
                going on so someone has an idea. You're insulated and it can
                feel like anything goes sometimes. Being able to have that
                connection to your team through Stitch is very valuable.”
              </p>

              <h4 className="m-b-30">
                Improving the patient experience and clinical workflow
              </h4>

              <p className="m-b-40">
                Collins also believes it has helped improve the patient
                experience at Citywide. “With the nurses, we have a medication
                room downstairs and clients are coming in all throughout the
                morning picking up meds. If I'm not at my desk and a nurse needs
                to get in touch with me about medications – and a lot of times
                there's an urgent situation such as a missing medications or a
                client needs to pick it up early – they can get in touch with me
                really quickly through Stitch.” By having a real-time line of
                communication to Collins, nurses can quickly service patients
                and improve their experience in the healthcare system.
              </p>

              <div className="quote dssi-quote text-center">
                <i className="fa fa-quote-left fa-3x m-b-10" />
                <h5 className="m-b-20">
                  I can get all the information I need immediately, right in
                  Stitch.
                </h5>

                <div className="name">
                  <strong>Tara Collins</strong>
                </div>
                <div className="position">
                  UCSF Faculty, Department of Psychiatry
                </div>
              </div>

              <p className="m-b-40">
                Stitch also lets Citywide health care providers operate more
                asynchronously. “Sometimes you're in a situation where you can't
                pick up the phone but you can send a message. I can send
                messages on Stitch when I'm seeing someone. I can take a break
                and send a message. You can't really take a break if you're in a
                room with a client to make a phone call and talk about another
                client's PHI. But you can do this really quickly through
                Stitch,” says Collins.
              </p>

              <h4 className="m-b-30">Generating results across the board</h4>

              <p className="m-b-40">
                Citywide implemented Stitch to help coordinate care across their
                patient population, and in several months saw significant
                benefits on the platform:
              </p>

              <div className="infographic dssi-infographic text-center">
                <img
                  className="img-responsive"
                  src="/images/ucsf-infographic-1.png"
                  alt="UCSF Results"
                />
              </div>

              <p className="m-b-40">
                Asked if there’s anything other behavioral health programs
                should know about Stitch, Collins replied, “Simply that it's
                easy to use and it gets the job done.” Lightell added, “It's
                reliable and great software.” Asked about what he looks forward
                to in the future of Stitch, Lightell expressed interest about
                the upcoming release of Stitch Manage: “I'm always looking for
                ways to organize the work I need to do for clients. Blood draws,
                labs, etc. It would be interesting to try patient-centric task
                management.” The mission of Stitch is to enable healthcare teams
                to easily provide quality patient experiences. As Citywide looks
                to add tools that improve the quality of care, Stitch aims to be
                an enduring and powerful partner.
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
