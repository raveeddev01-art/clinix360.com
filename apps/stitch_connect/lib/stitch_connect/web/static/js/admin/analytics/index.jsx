import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Line as LineChart } from "react-chartjs-2";

import Panel from "react-bootstrap/lib/Panel";

// import Row from "react-bootstrap/lib/Row";
// import Col from "react-bootstrap/lib/Col";
// import FormGroup from "react-bootstrap/lib/FormGroup";
// import FormControl from "react-bootstrap/lib/FormControl";
// import HelpBlock from "react-bootstrap/lib/HelpBlock";
// import Button from "react-bootstrap/lib/Button";

const header = (
  <h1>
    <i className="fa fa-envelope-o" /> Analytics
  </h1>
);

@inject("teamStore", "titleStore")
@observer
export default class Analytics extends Component {
  constructor(props) {
    super(props);

    const chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Messages",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          // pointRadius: 5,
          pointHitRadius: 10,
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };

    const chartOptions = {
      maintainAspectRatio: false
      // showLines: false
    };

    this.state = {
      chartData,
      chartOptions
    };
  }

  componentWillMount() {
    this.props.titleStore.setPageName("Analytics");
  }

  randomScalingFactor() {
    return Math.round(Math.random() * 100);
  }

  render() {
    const { chartData, chartOptions } = this.state;

    return (
      <Panel className="admin-panel" header={header}>
        <LineChart data={chartData} options={chartOptions} />
      </Panel>
    );
  }
}
