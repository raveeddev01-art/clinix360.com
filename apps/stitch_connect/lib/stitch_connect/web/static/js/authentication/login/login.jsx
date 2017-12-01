import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Alert from "react-bootstrap/lib/Alert";

@inject("registrationStore", "titleStore")
@observer
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      loading: false,
      passwordReset: false,
      errorMessage: ""
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Sign In");
    const { location } = this.props;
    if (location.state && location.state.passwordReset === true) {
      this.setState({
        passwordReset: true
      });
    }
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = evt => {
    this.setState({ saving: true });
    evt.preventDefault();
    const { history } = this.props;
    const { email, password } = this.state;

    this.setState({ saving: true });
    post("/api/v1/web_login", {
      body: { email, password },
      hideNotify: true
    })
      .then(() => {
        history.push("/apps");
      })
      .catch(err => {
        this.setState({
          saving: false,
          passwordReset: false,
          errorMessage: err.data.message
        });
      });
  };

  _renderLoadingIcon = () => {
    const { saving } = this.state;
    return saving ? (
      <i className="fa fa-circle-o-notch fa-spin fa-fw on-right" />
    ) : null;
  };

  render() {
    return (
      <div>
        {this.state.errorMessage && (
          <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
        )}
        {this.state.passwordReset && (
          <Alert bsStyle="success">Your password is now reset.</Alert>
        )}
        <div className="authentication-card text-center m-b-20">
          <h2>{this.props.registrationStore.teamName}</h2>
          <h5 className="text-muted url-heading">
            {this.props.registrationStore.teamSlug}.teamstitch.com
          </h5>

          <h5>
            Enter your <strong>email address</strong> and{" "}
            <strong>password</strong>.
          </h5>

          <form action="/login" method="post" onSubmit={this.handleSubmit}>
            <input type="hidden" name="_csrf_token" value={window.csrfToken} />

            <FormGroup bsSize="large">
              <FormControl
                name="email"
                required
                autoFocus
                type="email"
                placeholder="Email"
                value={this.state.email}
                onChange={this.handleChange}
              />
            </FormGroup>

            <FormGroup bsSize="large">
              <FormControl
                name="password"
                required
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange}
              />
            </FormGroup>

            <Button
              type="submit"
              bsStyle="primary"
              bsSize="lg"
              className="btn-block"
              disabled={!this.state.email || !this.state.password}
            >
              Login
              {this._renderLoadingIcon()}
            </Button>

            <h5>
              Forgot your password?{" "}
              <Link to="/reset-password">
                <strong>Reset Password</strong>
              </Link>
            </h5>
          </form>
        </div>

        <h5>
          Don't have an account with this team?<br />
          <strong>Contact the team administrator</strong>.
        </h5>

        <h5>
          Wrong team?{" "}
          <a href={`https://${applicationHost}/signin`}>
            <strong>Sign in to a different team</strong>
          </a>
        </h5>

        <h5>
          Just getting started?{" "}
          <a href={`https://${applicationHost}/signup/email`}>
            <strong>Create a new team</strong>
          </a>
        </h5>
      </div>
    );
  }
}

export default withRouter(Login);
