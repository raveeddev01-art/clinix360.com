// TODO: REMOVE ME

// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import HelpBlock from "react-bootstrap/lib/HelpBlock";
// import FormGroup from "react-bootstrap/lib/FormGroup";
// import FormControl from "react-bootstrap/lib/FormControl";
// import { OnboardPage } from "common/components";
// import { isValidUnicodeString } from "lib/utils";

// class NameCard extends Component {
//   constructor(...args) {
//     super(...args);
//     this.state = {
//       firstName: "",
//       lastName: "",
//       alertMessage: ""
//     };
//   }

//   onChange = field => evt => {
//     this.setState({
//       [field]: evt.target.value
//     });
//   };

//   onNext = () => {
//     const { firstName, lastName } = this.state;

//     if (!isValidUnicodeString(firstName)) {
//       return this.setState({
//         alertMessage: "First name contains invalid characters."
//       });
//     }

//     if (!isValidUnicodeString(lastName)) {
//       return this.setState({
//         alertMessage: "Last name contains invalid characters."
//       });
//     }

//     return this.props.onNext({
//       firstname: firstName,
//       lastname: lastName,
//       alertMessage: ""
//     });
//   };

//   render() {
//     const { firstName, lastName, alertMessage } = this.state;

//     return (
//       <div>
//         <OnboardPage
//           {...this.props}
//           title="Name"
//           errorText={alertMessage}
//           description={
//             <span>
//               Enter your <strong>full name</strong>
//             </span>
//           }
//           disableNext={!firstName || !lastName}
//           onNext={this.onNext}
//         >
//           <FormGroup bsSize="large">
//             <FormControl
//               required
//               autoFocus
//               placeholder="First Name"
//               value={firstName}
//               maxLength={80}
//               onChange={this.onChange("firstName")}
//             />
//           </FormGroup>
//           <FormGroup bsSize="large">
//             <FormControl
//               required
//               placeholder="Last Name"
//               value={lastName}
//               maxLength={80}
//               onChange={this.onChange("lastName")}
//             />
//           </FormGroup>
//           <HelpBlock className="m-b-20">
//             Your full name will be shown in the team directory and next to your
//             profile and messages.
//           </HelpBlock>
//         </OnboardPage>
//       </div>
//     );
//   }
// }

// NameCard.propTypes = {
//   onNext: PropTypes.func.isRequired
// };

// NameCard.defaultProps = {
//   onNext: () => {}
// };

// export default NameCard;
