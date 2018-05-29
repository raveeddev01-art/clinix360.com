// TODO: REMOVE ME

// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import HelpBlock from "react-bootstrap/lib/HelpBlock";
// import FormGroup from "react-bootstrap/lib/FormGroup";
// import FormControl from "react-bootstrap/lib/FormControl";
// import { OnboardPage } from "common/components";

// function formatUsername(givenUsername) {
//   return givenUsername.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
// }

// class UsernameCard extends Component {
//   constructor(...args) {
//     super(...args);
//     this.state = {
//       username: "",
//       hasError: false,
//       hasPatternError: false,
//       loading: false
//     };
//   }

//   onChange = evt => {
//     this.setState({
//       username: formatUsername(evt.target.value)
//     });
//   };

//   onNext = () => {
//     const { username } = this.state;
//     this.setState({ hasPatternError: false });

//     if (!this.patternValidate()) {
//       return;
//     }

//     this.setState({ loading: true });
//     get(`/api/v1/users/validate-username?username=${username}`, {
//       hideNotify: true
//     })
//       .then(resp => {
//         this.setState({ loading: false });
//         if (resp.data) {
//           this.setState({ hasError: false });
//           this.props.onNext(username);
//         } else {
//           this.setState({ hasError: true });
//         }
//       })
//       .catch(() => {
//         this.setState({ hasError: true, loading: false });
//       });
//   };

//   get errorText() {
//     const { hasPatternError, hasUniquenessError } = this.state;

//     if (hasPatternError) {
//       return "The username should be lowercase and only use alphanumeric characters.";
//     }

//     if (hasUniquenessError) {
//       return "That username is already taken.";
//     }

//     return "";
//   }

//   patternValidate = () => {
//     const { username } = this.state;

//     if (/[^a-z0-9]/.test(username)) {
//       // starts with letter or number
//       this.setState({ hasPatternError: true });
//       return false;
//     }

//     return true;
//   };

//   render() {
//     const { username, loading } = this.state;
//     const { placeholder } = this.props;

//     return (
//       <div>
//         <OnboardPage
//           {...this.props}
//           title="Username"
//           errorText={this.errorText}
//           description={
//             <span>
//               Enter a <strong>username</strong>.
//             </span>
//           }
//           disableNext={!username}
//           loading={loading}
//           onNext={this.onNext}
//         >
//           <FormGroup bsSize="large">
//             <FormControl
//               required
//               autoFocus
//               placeholder={placeholder || "username"}
//               value={username}
//               onChange={this.onChange}
//               maxLength={20}
//             />
//           </FormGroup>
//           <HelpBlock className="m-b-20">
//             Your username is how others will mention you. It should be unique,
//             lowercase, and use only letters and numbers.
//           </HelpBlock>
//         </OnboardPage>
//       </div>
//     );
//   }
// }

// UsernameCard.propTypes = {
//   onNext: PropTypes.func.isRequired,
//   isLowerCase: PropTypes.bool,
//   placeholder: PropTypes.string
// };

// UsernameCard.defaultProps = {
//   onNext: () => {},
//   isLowerCase: true,
//   placeholder: ""
// };

// export default UsernameCard;
