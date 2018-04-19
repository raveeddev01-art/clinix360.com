import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line as LineChart } from "react-chartjs-2";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

const primaryColor = "rgba(0, 51, 102, 1)";
const backgroundColor = "rgba(75,192,192,0.4)";

const defaultChartOptions = {
  maintainAspectRatio: true,
  legend: {
    display: false
  }
};

const defaultDataset = props => ({
  label: props.title,
  fill: false,
  lineTension: 0,
  backgroundColor,
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
  data: []
});

const makeDefaultState = props => ({
  chartData: {
    labels: [],
    datasets: [defaultDataset(props)]
  },
  chartOptions: defaultChartOptions,
  total: 0
});

export default class AnalyticsChart extends Component {
  constructor(props) {
    super(props);
    this.state = makeDefaultState(props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.reportsData ||
      nextProps.reportsData === this.props.reportsData
    )
      return;

    const { reportsData } = nextProps;
    const dataPoints = this.processData(reportsData.body);

    const { chartData } = this.state;
    // Mutating the state here, no need to call setState
    chartData.labels = dataPoints.dates;
    chartData.datasets[0].data = dataPoints.points;

    this.setState({
      // chartData,
      total: dataPoints.total
    });
  }

  processData(reportsData) {
    const dates = Object.keys(reportsData).sort(); // To make sure to get the dates sorted
    const points = [];
    let total = 0;
    dates.forEach(d => {
      points.push(reportsData[d]);
      total += reportsData[d];
    });
    return { dates, points, total };
  }

  render() {
    const { title, subtitle, makeHelperText } = this.props;
    const { chartData, chartOptions, total } = this.state;

    return (
      <div className="panel-chart">
        <div className="chart-heading">
          <h3>{title}</h3>
          <HelpBlock key="analytics_chart_help">{subtitle}</HelpBlock>
        </div>

        <LineChart data={chartData} options={chartOptions} />

        <HelpBlock key="analytics_chart_total" className="total">
          {makeHelperText(total)}
        </HelpBlock>
      </div>
    );
  }
}

AnalyticsChart.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  makeHelperText: PropTypes.func.isRequired,
  reportsData: PropTypes.object
};

AnalyticsChart.defaultProps = {
  reportsData: null
};
