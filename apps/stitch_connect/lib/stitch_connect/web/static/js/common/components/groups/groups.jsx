import React, { Component, PropTypes } from "react";
import Select from "react-select";

class Groups extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value, options: [] };
  }

  componentWillMount() {
    get("/api/v1/groups").then(response => {
      this.setState({
        options: response.data.map(group => ({
          value: group.id,
          label: group.name
        }))
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
  }

  onChange = newValue => {
    const { onChange } = this.props;
    if (typeof onChange === "function") {
      onChange(newValue);
    }
  };

  render() {
    const { value, options } = this.state;
    return (
      <Select
        className="multi-select-large"
        options={options}
        simpleValue
        value={value}
        onChange={this.onChange}
        clearable={false}
        searchable={false}
      />
    );
  }
}

Groups.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func
};

Groups.defaultProps = {
  value: 0,
  onChange: () => {}
};

export default Groups;
