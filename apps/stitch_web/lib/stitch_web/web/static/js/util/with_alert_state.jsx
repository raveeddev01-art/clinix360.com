// Passed to component to add alert state
// and callbacks for controlling state

const withAlertState = GivenComponent => {
  class ExtendedComponent extends GivenComponent {
    constructor(props) {
      super(props);

      this.state = Object.assign({}, this.state || {}, {
        alertMessage: "",
        alertStyle: "",
        alertVisible: false
      });
    }

    onSuccess = message => {
      this.setState({
        alertMessage: message,
        alertVisible: true,
        alertStyle: "success"
      });
    };

    onError = message => {
      this.setState({
        alertMessage: message,
        alertVisible: true,
        alertStyle: "danger"
      });
    };

    hideAlert = () => {
      this.setState({
        alertVisible: false
      });
    };
  }

  return ExtendedComponent;
};

export default withAlertState;
