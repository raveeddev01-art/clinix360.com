import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line as LineChart } from "react-chartjs-2";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

const primaryColor = "rgba(0, 51, 102, 1)";
const secondaryColor = "rgba(139, 0, 0, 1)";
const ternaryColor = "rgba(0, 0, 40, 1)";
const fallbackColor = "rgba(20, 20, 20, 1)";

const indexToColor = index => {
  return (
    {
      0: primaryColor,
      1: secondaryColor,
      2: ternaryColor
    }[index] || fallbackColor
  );
};

const makeChartOptions = props => ({
  maintainAspectRatio: true,
  legend: {
    display: props.multiLine
  }
});

const makeDataset = (props, index = 0) => {
  const label = props.multiLine ? props.labelForIndex(index) : props.title;
  const color = props.multiLine ? indexToColor(index) : primaryColor;

  return {
    label,
    fill: false,
    lineTension: 0,
    backgroundColor: color,
    borderColor: color,
    borderCapStyle: "butt",
    borderDash: [],
    borderWidth: 2,
    borderDashOffset: 0.0,
    borderJoinStyle: "miter",
    pointBorderColor: color,
    pointBackgroundColor: color,
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: color,
    pointHoverBorderColor: color,
    pointHoverBorderWidth: 2,
    pointRadius: 3,
    pointHitRadius: 10,
    data: []
  };
};

const makeDefaultState = props => ({
  chartData: {
    labels: [],
    datasets: [makeDataset(props)]
  },
  chartOptions: makeChartOptions(props),
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
    this.processBody(nextProps, reportsData.body);
  }

  processBody(props, dataset) {
    let total = 0;

    if (props.multiLine) {
      let index = 0;
      total = dataset.reduce((t, ds) => {
        const newT = t + this.processData(ds, index, true);
        index++;
        return newT;
      }, total);
    } else {
      total = this.processData(dataset);
    }

    this.setState({ total });
  }

  processData(reportsData, index = 0) {
    const dates = Object.keys(reportsData).sort(); // To make sure to get the dates sorted
    const points = [];
    let total = 0;
    dates.forEach(d => {
      points.push(reportsData[d]);
      total += reportsData[d];
    });

    const dataPoints = { dates, points, total };

    const { chartData } = this.state;
    // Mutating the state here, no need to call setState
    chartData.labels = dataPoints.dates;
    if (!chartData.datasets[index]) {
      chartData.datasets[index] = makeDataset(this.props, index);
    }

    chartData.datasets[index].data = dataPoints.points;

    return dataPoints.total;
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
