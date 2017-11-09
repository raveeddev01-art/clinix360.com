import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Line as LineChart } from "react-chartjs-2";

import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

const primaryColor = "rgba(0, 51, 102, 1)";

const datePeriodNames = {
  week: "Last 1 week",
  month: "Last 30 days",
  allTime: "All time"
};

@inject("teamStore", "titleStore")
@observer
export default class Messages extends Component {
  constructor(props) {
    super(props);

    const chartData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Files",
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
          <h3>Files</h3>
          <HelpBlock key="messages_chart_help">
            Learn how your team has uploaded files.
          </HelpBlock>
        </div>

        <LineChart data={chartData} options={chartOptions} />

        <HelpBlock key="messages_chart_total" className="total">
          Total Files Uploaded: 500
        </HelpBlock>
      </div>
    );
  }
}
