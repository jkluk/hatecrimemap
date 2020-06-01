import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import './Charts.css';
import { CHARTS, getChartData } from '../../utils/chart-utils';
import { Bar } from 'react-chartjs-2';
import ChartsText from './ChartText';

const styles = theme => ({

});
/*
          <Bar data={getChartData(CHARTS.RACE_ETHNICITY, this.props.data)} options={wholeYAxis} />
          <Bar data={getChartData(CHARTS.RELIGION, this.props.data)} options={wholeYAxis} />
          <Bar data={getChartData(CHARTS.GENDER_SEXUALITY, this.props.data)} options={wholeYAxis} />
          <Bar data={getChartData(CHARTS.OTHER, this.props.data)} options={wholeYAxis} />
*/
class Charts extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      currentDisplay: CHARTS.TOP,
      options: {
        scales: {
          yAxes: [{
            ticks: {
              // beginAtZero:true,
              // callback: function(value) {if(value % 1 ===0) {return value;}},
              min: 0,
              max: parseInt(props.max) || 50
              // stepSize: 1
            }
          }]
        }
      },
      drilldown: {}
    }
  }

  barUnClick = () => {
    this.setState({currentDisplay: CHARTS.TOP})
  }

  barClick = (elems) => {
    // index into `data` of the bar clicked
    const dataIdx = elems[0]._index
    switch(dataIdx) {
      case 0:
        this.setState({currentDisplay: dataIdx+1, drilldown: this.props.data["Race/Ethnicity"].children})
        break
      case 1:
        this.setState({currentDisplay: dataIdx+1, drilldown: this.props.data["Religion"].children})
        break
      case 2:
        this.setState({currentDisplay: dataIdx+1, drilldown: this.props.data["Gender/Sexuality"].children})
        break
      case 3:
        this.setState({currentDisplay: dataIdx+1, drilldown: this.props.data["Miscellaneous"].children})
    }

    
  }

  render() {
    if (this.props.data && this.state.options) {
      if(this.state.currentDisplay != CHARTS.TOP) {
        return (
          <div className="charts">
            <Bar data={getChartData(this.state.currentDisplay, this.state.drilldown)} options={this.state.options}
                 onElementsClick={this.barUnClick} />
            <ChartsText data={this.state.drilldown} />
          </div>
        )
      }

      return (
        <div className="charts">
          <Bar data={getChartData(CHARTS.TOP, this.props.data)} options={this.state.options}
               onElementsClick={this.barClick} />
          <ChartsText data={this.props.data} />
        </div>
      )
    }

    return null;
  }
}

export default withStyles(styles)(Charts);