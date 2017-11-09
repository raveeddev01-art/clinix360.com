import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Line as LineChart } from "react-chartjs-2";

import HelpBlock from "react-bootstrap/lib/HelpBlock";

const primaryColor = "rgba(0, 51, 102, 1)";

@inject("teamStore", "titleStore")
@observer
export default class Messages extends Component {
  constructor(props) {
    super(props);

    const chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Messages",
          fill: false,
          lineTension: 0,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: primaryColor,
          borderCapStyle: "butt",
          borderDash: [],
          borderWidth: 2,
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: primaryColor,
          pointBackgroundColor: primaryColor,
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: primaryColor,
          pointHoverBorderColor: primaryColor,
          pointHoverBorderWidth: 2,
          pointRadius: 3,
          pointHitRadius: 10,
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };

    const chartOptions = {
      maintainAspectRatio: true,
      legend: {
        display: false
      }
    };

    this.state = {
      chartData,
      chartOptions
    };
  }

  render() {
    const { chartData, chartOptions } = this.state;

    return (
      <div className="panel-chart">
        <div className="chart-heading">
          <div className="pull-left">
            <h3>Messages</h3>
            <HelpBlock key="messages_chart_help">
              Learn how your team has sent messages.
            </HelpBlock>
          </div>
        </div>

        <LineChart data={chartData} options={chartOptions} />

        <HelpBlock key="messages_chart_total" className="total">
          Total Messages Sent: 10,000
        </HelpBlock>
      </div>
    );
  }
}
