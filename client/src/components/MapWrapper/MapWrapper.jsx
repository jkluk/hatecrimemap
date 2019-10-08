import React from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';

import { getSourceLI } from '../../utils/utilities';
import './MapWrapper.css';


function updateLevel(e, currZoom) {
  console.log(currZoom, e);
  currZoom = e.target._zoom;
}

const MapWrapper = (props) => {
  const mapCenter = [38, -95];

  return (
    <Map id="MapWrapper" center={mapCenter} zoom={props.zoom()} onZoomEnd={(e) => props.updateZoom(e.target._zoom)}>
      <TileLayer attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png" />
      {props.children}
    </Map>
  );
};

MapWrapper.propTypes = {
  // mapdata: PropTypes.arrayOf(PropTypes.object).isRequired,
  // zoom: PropTypes.function.isRequired,
};

export default MapWrapper;