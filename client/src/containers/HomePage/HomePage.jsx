import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import MapWrapper from '../../components/MapWrapper/MapWrapper';
import SideMenu from '../../components/SideMenu/SideMenu';
// import { updateCurrentLayers, getMapData, storeMapData, getAllPoints, storeStateData } from '../../utils/filtering';
import { storeStateData, storeCountyData } from '../../utils/filtering';
import { counties } from '../../res/counties/statecounties.js';
import { states } from '../../res/states.js';
import { GeoJSON } from 'react-leaflet';
import './HomePage.css';

const styles = () => ({
  progress: {
    position: 'fixed',
    top: '50%',
    left: '50%',
  },
});

// TODO: Move to utilities file
const colorBins = [0, 50, 75, 100, 120];
var lockedLayer = null;
var lockedLayerColor = null;
function eachState(feature, layer, statetotals, total, setStateDisplay) {
  if(statetotals[feature.properties.NAME] && statetotals[feature.properties.NAME].sum_harassment > 0) {
    // const colorHashed = colorBins[Math.floor((5*statetotals[feature.properties.NAME].sum_harassment-1)/total)];
    let colorHashed = 0;
    if(statetotals[feature.properties.NAME].sum_harassment < total/10) colorHashed = colorBins[0];
    else if(statetotals[feature.properties.NAME].sum_harassment < total/8) colorHashed = colorBins[1];
    else if(statetotals[feature.properties.NAME].sum_harassment < total/6) colorHashed = colorBins[2];
    else if(statetotals[feature.properties.NAME].sum_harassment < total/4) colorHashed = colorBins[3];
    else if(statetotals[feature.properties.NAME].sum_harassment < total + 1) colorHashed = colorBins[4];
    layer.on('mouseover', function(event){
      if(!setStateDisplay(feature.properties.NAME)) return;  // setStateDisplay() will return false if we're locked onto something else
      // layer._path.classList.add("show-state");
      layer.setStyle({fillColor: 'rgb(200, 200, 200)'});
    });
    layer.on('mouseout', function(event){
      if(!setStateDisplay("none")) return;
      // layer._path.classList.remove("show-state");
      layer.setStyle({fillColor: `rgb(255, ${150-colorHashed}, ${150-colorHashed})`});
    });
    layer.on('click', function(event) {
      layer.setStyle({fillColor: `rgb(100, 100, 100)`});
      if(lockedLayer) {
        lockedLayer.setStyle({fillColor: `rgb(255, ${lockedLayerColor}, ${lockedLayerColor})`});
        if(lockedLayer === layer) {
          setStateDisplay("none", true);
          lockedLayer = null;
          lockedLayerColor = null;
          return;
        }
      }
      setStateDisplay(feature.properties.NAME, true);  // true parameter for locking

      lockedLayerColor = 150-colorHashed;
      lockedLayer = layer;
    });
    layer.setStyle({stroke: 1, weight: 1, opacity: 0.75, color: 'white', fillColor: `rgb(255, ${150-colorHashed}, ${150-colorHashed})`, fillOpacity: 0.75});
  } else {
    layer.setStyle({color: 'rgba(0, 0, 0, 0)'});
  }
}

function eachStatesCounties(feature, layer, countytotals, setCountyDisplay, total=33)
{
  if(countytotals[feature.properties.County_state] && countytotals[feature.properties.County_state].sum_harassment > 0) {
    // const colorHashed = colorBins[Math.floor((5*countytotals[feature.properties.County_state].sum_harassment-1)/total)];
    let colorHashed = 0;
    // if(countytotals[feature.properties.County_state].sum_harassment < total/10) colorHashed = colorBins[0];
    // else if(countytotals[feature.properties.County_state].sum_harassment < total/8) colorHashed = colorBins[1];
    // else if(countytotals[feature.properties.County_state].sum_harassment < total/6) colorHashed = colorBins[2];
    // else if(countytotals[feature.properties.County_state].sum_harassment < total/4) colorHashed = colorBins[3];
    // else if(countytotals[feature.properties.County_state].sum_harassment < total + 1) colorHashed = colorBins[4];
    colorHashed = colorBins[0];
    layer.on('mouseover', function(event){
      if(!setCountyDisplay(feature.properties.County_state)) return;  // setCountyDisplay() will return false if we're locked onto something else
      // layer._path.classList.add("show-state");
      layer.setStyle({fillColor: 'rgb(200, 200, 200)'});
    });
    layer.on('mouseout', function(event){
      if(!setCountyDisplay("none")) return;
      // layer._path.classList.remove("show-state");
      layer.setStyle({fillColor: `rgb(255, ${150-colorHashed}, ${150-colorHashed})`});
    });
    layer.on('click', function(event) {
      layer.setStyle({fillColor: `rgb(100, 100, 100)`});
      if(lockedLayer) {
        lockedLayer.setStyle({fillColor: `rgb(255, ${lockedLayerColor}, ${lockedLayerColor})`});
        if(lockedLayer === layer) {
          setCountyDisplay("none", true);
          lockedLayer = null;
          lockedLayerColor = null;
          return;
        }
      }
      setCountyDisplay(feature.properties.County_state, true);  // true parameter for locking

      lockedLayerColor = 150-colorHashed;
      lockedLayer = layer;
    });
    layer.setStyle({stroke: 1, weight: 1, opacity: 0.75, color: 'white', fillColor: `rgb(255, ${150-colorHashed}, ${150-colorHashed})`, fillOpacity: 0.75});
  } else {
    layer.setStyle({color: 'rgba(0, 0, 0, 0)'});
  }
}

class HomePage extends Component {
  state = {
    zoom: 4,
    isFetching: true,
    statetotals: {},
    currentLayers: new Set(['all']),
    countytotals: {},
    displayState: 'none',
    displayCounty: 'none',
    locked: false
  };

  getStateData() {
    axios.get('/api/maps/statedata')
      .then(({data: {data}}) => {
        this.setState({
          isFetching: false,
          statetotals: storeStateData(data)  // Converts array to objects with state names as keys
        });
      })
      .catch((err) => {
        this.setState({ isFetching: false });
        alert(`API call failed: ${err}`);
      });
  }

  getCountyData() {  // TODO: Lazy load?
    axios.get('/api/maps/countydata')
      .then(({data: {data}}) => {
        this.setState({
          countytotals: storeCountyData(data)
        });
      })
      .catch((err) => {
        alert(`API call failed: ${err}`);
      });
  }

  componentDidMount() {
    this.getStateData();
    this.getCountyData();
  }

  resetMapData = () => {
    this.setState({
      // mapdata: getAllPoints(),
      currentLayers: new Set(['all']),
     });
  }

  // Return value, success (in our terms, not react's)
  updateState = (state, lock = false) => {
    if(lock) {
      this.setState({displayState: state, locked: state!=="none"});  // we never want to lock onto None
      return true;
    } else if(!this.state.locked) {
      this.setState({displayState: state});
      return true;
    }
    return false;
  }

  updateCounty = (county, lock = false) => {
    console.log(county);
    if(lock) {
      this.setState({displayCounty: county, locked: county!=="none"});
      return true;
    } else if(!this.state.locked) {
      this.setState({displayCounty: county});
      return true;
    }
    return false;
  }

  getZoom = () => {
    return this.state.zoom;
  }

  updateZoom = (zoom = 4) => {
    if((this.state.zoom > 6 && zoom < 6) || (this.state.zoom < 6 && zoom > 6))  // threshold for switching between county and state, unlock display
      this.setState({zoom: zoom, lock: false}, () => this.state.zoom);
    else
      this.setState({zoom: zoom}, () => this.state.zoom);
  }



  render() {
    const { isFetching, statetotals, displayState, currentLayers } = this.state;
    const { classes } = this.props;

    return (
      <div className="homePage">
        {isFetching ? (
          <CircularProgress className={classes.progress} />
        ) : (
          <React.Fragment>
        {/* TODO: context for mapdata and statetotals? */}
            <MapWrapper zoom={this.getZoom} updateZoom={this.updateZoom} >
              { this.state.zoom >= 6 && counties.map((state, index) => <GeoJSON key={index} data={state} onEachFeature={(feature, layer) => eachStatesCounties(feature, layer, this.state.countytotals, this.updateCounty)} /> ) }     
              <GeoJSON data={states} onEachFeature={(feature, layer) => eachState(feature, layer, statetotals, 100, this.updateState)} />
            </MapWrapper>
            <SideMenu
              statetotals={statetotals} countytotals={this.state.countytotals} currentState={displayState} currentCounty={this.state.displayCounty} currentLayers={currentLayers} />
          </React.Fragment>
        )}
      </div>
    );
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HomePage);
