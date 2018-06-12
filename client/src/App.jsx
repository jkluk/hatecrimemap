import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';

import HomePage from './containers/HomePage/HomePage';
import Header from './components/Header/Header';
import ReportIncidentPage from './containers/ReportIncidentPage/ReportIncidentPage';
import VerifyIncidentsPage from './containers/VerifyIncidentsPage/VerifyIncidentsPage';
import './App.css';

const App = () => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <Router>
      <div className="app">
        <Header />
        <Route exact path="/" component={HomePage} />
        <Route exact path="/reportincident" component={ReportIncidentPage} />
        <Route exact path="/verifyincidents" component={VerifyIncidentsPage} />
      </div>
    </Router>
  </MuiPickersUtilsProvider>
);

export default App;
