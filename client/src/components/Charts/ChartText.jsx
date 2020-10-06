import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import './ChartText.css';

const styles = theme => ({
});

const ChartText = (props) => {

  if(!props.data) {
    return null;
  }

  console.log(props.data)

  return (
    <div>
     	{props.data.labels.map((e, ind) => <p key={e}>{e}: {props.data.datasets[0].data[ind]}</p>)}
    </div>
  )
};

ChartText.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChartText);