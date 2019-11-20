import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import isUrl from 'is-url';
import DatePicker from 'material-ui-pickers/DatePicker';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { withStyles } from '@material-ui/core/styles';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step, StepLabel,
  Button,
  Paper,
  StepContent,
  Tooltip,
  Select, MenuItem
} from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';

import LocationSearchInput from '../../components/LocationSearchInput/LocationSearchInput';
import GHCheckboxList from '../../components/GHCheckboxList/GHCheckboxList';
import { createDataToSubmit } from '../../utils/utilities';

import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import CheckboxTree from 'react-checkbox-tree';
/*
nodes = [
  {value: id_of_group, label: Name, children: [grab all whose parent is id_of_group]},
];

    state = {
        checked: [node values],
        expanded: [node values],
    };
*/

const styles = ({ spacing }) => ({
  root: {
    margin: '0 auto',
    marginTop: spacing.unit * 2,
    width: '45%',
  },
  stepper: {
    minWidth: '500px',
  },
  button: {
    marginTop: spacing.unit,
    marginRight: spacing.unit,
  },
  actionsContainer: {
    marginBottom: spacing.unit * 2,
  },
  resetContainer: {
    padding: spacing.unit * 3,
  },
  checkboxWrapper: {
    marginLeft: spacing.unit,
  },
});

const getSteps = () => [
  'Harassment Location',
  'Date of Harassment',
  'Main Reason of Target',
  'Harassed Demographics',
  'Verification Link',
];

const getInitialState = () => ({
  targetCategory: '',
  groups: {},
  groupsChecked: [],
  groupsExpanded: [],
  latLng: {},
  location: '',
  sourceurl: '',
  date: null,
  activeStep: 0,
  associatedLink: true,
  isDateSelected: false,
});

class ReportIncidentPage extends Component {

  constructor(props) {
    super(props)
    this.state = getInitialState();
  }

  groupToNodes = (groups) => {
    return groups.map(eachGroup => {
      eachGroup['value'] = eachGroup['key'];
      delete eachGroup['key'];
      eachGroup['label'] = eachGroup['name'];
      delete eachGroup['name'];
      if(eachGroup.children) {
        eachGroup.children = this.groupToNodes(eachGroup.children);
      }

      if(eachGroup['level'] == 0) {  // disable toplevel categories, they're just for grouping
        eachGroup['showCheckbox'] = false;
        this.setState((prevState) => prevState.groupsExpanded.push(eachGroup['value']));
      }

      // Do other node customizations, e.g. custom icons or class

      return eachGroup;
    });
  }

  async componentDidMount() {
    axios.get('/api/totals/query')  // change to /groups
      .then(res => this.setState({groups: this.groupToNodes(res.data.ret)}))
      .catch((err) => {
        alert(`API call failed: ${err}`);
        return {};
      })
  }

  getStepContent = (index) => {
    const { location, sourceurl, groupsHarassed, date, associatedLink } = this.state;
    const { classes } = this.props;

    switch (index) {
      case 0:
        return (
          <LocationSearchInput
            name="location"
            onChange={this.handleLocationChange}
            onSelect={this.selectLocation}
            value={location}
          />
        );
      case 1:
        return (
          <DatePicker
            value={this.state.date}
            onChange={this.handleDateChange}
            label="Select a date"
            format="MM/DD/YYYY"
            showTodayButton
            maxDate={new Date()}
          />
        );
      case 2:
        return (
          <Select
            name="targetSelect"
            id="targetSelect"
            value={this.state.targetCategory}
            onChange={this.handleTargetChange}
            displayEmpty
          >
            <MenuItem value="" disabled>Please Select One</MenuItem>
            <MenuItem value={10}>Testtttttttttttttttt</MenuItem>
          </Select>
        );
      case 3:
        return (
          <div className={classes.checkboxWrapper}>
            <CheckboxTree
              nodes={this.state.groups}
              checked={this.state.groupsChecked}
              expanded={this.state.groupsExpanded}
              onCheck={groupsChecked => this.setState({ groupsChecked })}
              onExpand={groupsExpanded => this.setState({ groupsExpanded })}
              icons={{
                check: <CheckBox style={{color: '#f50057'}} />,
                uncheck: <CheckBoxOutlineBlank style={{color: 'rgba(0, 0, 0, 0.54)'}}/>,
                parentClose: null,
                parentOpen: null,
                leaf: null
              }}
              noCascade={true}  // Should "Asian American" automatically select everything under?
            />
            <p>{this.state.groupsChecked.join(" ")}</p>
          </div>
        );
      case 4:
        return (
          <div>
            <Tooltip title="Please include http:// in any links" placement="left">
              <TextField
                name="sourceurl"
                onChange={this.handleChange}
                helperText="http://www.example.com/"
                defaultValue={sourceurl}
              />
            </Tooltip>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!associatedLink}
                  onChange={this.updateAssociatedLink}
                  value="associatedLink"
                />
              }
              label="No associated link"
            />
          </div>
        );
      default:
        return 'error';
    }
  }

  isFormFilledOut = () => {
    const {
      activeStep,
      location,
      isDateSelected,
      groupsChecked,
      sourceurl,
      latLng,
      associatedLink,
    } = this.state;

    switch (activeStep) {
      case 0:
        return location !== '' && latLng.lat;
      case 1:
        return isDateSelected;
      case 2:
        return this.state.targetCategory !== '';
      case 3:
        return groupsChecked.length > 0;
      case 4:
        return (isUrl(sourceurl) && associatedLink) || (sourceurl === '' && !associatedLink);
      default:
        return true;
    }
  }

  selectLocation = (location) => {
    this.handleLocationChange(location);
    geocodeByAddress(location)
      .then(results => getLatLng(results[0]))
      .then(latLng => this.setState({ latLng }))
      .catch(() => alert('Oops! There was an error. Please try again.'));
  }

  handleLocationChange = location => this.setState({ location, latLng: {} });

  handleDateChange = date => this.setState({ date: date.toDate(), isDateSelected: true });

  handleTargetChange = event => this.setState({ targetCategory: event.target.value });

  handleChange = ({ target: { name, value } }) => this.setState({ [name]: value });

  updateAssociatedLink = () => this.setState(oldState => ({ associatedLink: !oldState.associatedLink }));

  handleNext = () => this.setState(oldState => ({ activeStep: oldState.activeStep + 1 }));

  handleBack = () => this.setState(oldState => ({ activeStep: oldState.activeStep - 1 }));

  handleReset = () => {
    this.setState({ activeStep: 0 });
    this.reportIncident();
  }

  reportIncident = () => {
    const dataToSubmit = createDataToSubmit(this.state);
    this.resetState();
    axios.post('/api/maps/incidentreport', dataToSubmit)
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }

  resetState = () => this.setState(getInitialState());

  render() {
    const { activeStep } = this.state;
    const { classes } = this.props;
    const steps = getSteps();
    const buttonOnclick = activeStep === steps.length - 1 ? this.handleReset : this.handleNext;


    return (
      <Paper className={classes.root}>
        <Stepper className={classes.stepper} activeStep={activeStep} orientation="vertical">
          {steps.map((label, i) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <div>{this.getStepContent(i)}</div>
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={this.handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      disabled={!this.isFormFilledOut()}
                      variant="raised"
                      color="primary"
                      onClick={buttonOnclick}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    );
  }
}

ReportIncidentPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ReportIncidentPage);
