import React, { Component } from 'react';
import axios from 'axios';

import MapContainer from '../../components/MapContainer/MapContainer';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      isFetching: true,
      data: [],
    };
  }

  componentDidMount() {
    axios.get('/api/maps/allpoints')
      .then((res) => {
        this.setState({
          message: res.data.message,
          isFetching: false,
          data: res.data.data,
        });
      })
      .catch((err) => {
        this.setState({
          message: `API call failed: ${err}`,
          isFetching: false,
        });
      });
  }

  render() {
    const { message, isFetching, data } = this.state;
    return (
      <div>
        {!isFetching &&
          <MapContainer mapdata={data} zoom={3} />}
        <p className="App-intro">
          {isFetching
            ? 'Fetching data'
            : message}
        </p>
      </div>
    );
  }
}
