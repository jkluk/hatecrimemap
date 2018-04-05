import React, { Component } from 'react';
import axios from 'axios';

import MapWrapper from '../../components/MapWrapper/MapWrapper';
import SideMenu from '../../components/SideMenu/SideMenu';
import { getMapData, storeMapData } from '../../utils/filtering';
import './HomePage.css';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      mapdata: [],
    };
    this.updateMapData = this.updateMapData.bind(this);
  }

  componentDidMount() {
    axios.get('/api/maps/allpoints')
      .then(({ data: { mapdata } }) => {
        this.setState({
          isFetching: false,
          mapdata,
        });
        storeMapData('allpoints', mapdata);
      })
      .catch((err) => {
        this.setState({ isFetching: false });
        alert(`API call failed: ${err}`);
      });
  }

  updateMapData({ target: { name } }) {
    this.setState({ mapdata: getMapData(name) });
  }

  render() {
    const { isFetching, mapdata } = this.state;
    return (
      <div className="homePage">
        {!isFetching &&
          <React.Fragment>
            <MapWrapper mapdata={mapdata} zoom={4} />
            <SideMenu updateMapData={this.updateMapData} />
          </React.Fragment>}
      </div>
    );
  }
}