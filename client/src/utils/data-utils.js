/*
Is a utilities the best place for this?
*/
import axios from 'axios';


var _stateData = {};
var _countyData = {};

// a better place for truth of states?
const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
"District of Columbia", "Florida", "Georgia",
"Guam",
"Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
"Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
"Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
"Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
"Texas", "Utah",
"United States Virgin Islands",
 "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"];


/**
 * Also defined in totals.js, these filters split up the fragmented data call further,
 * i.e. if a new filter by db.incident field is added, the result may have a row's _count_
 * split up into multiple rows with the various field's values
 */
const filters = ['published']; // can filters be shared between front and back-end?

/**
 * Form the skeleton data structure that will be used throughout the HomePage HOC,
 * dynamically grabbing the db.groups structure
 */
async function getStateStructure() {
	let groups = await axios.get('/api/totals/groups')
	// {key: "", name: "", }

	let stateData = {}
	STATES.forEach(state => {
		stateData[state] = { count: 0 }
		function groupToCounts(groups, arr){
			return groups.map(eachGroup => {
	      	  arr[eachGroup.name] = { count: 0 }
		      if(eachGroup.children.length > 0) {
		      	arr[eachGroup.name].children = {}
		        groupToCounts(eachGroup.children, arr[eachGroup.name].children);
		      }
		    });
		};
		groupToCounts(groups.data.ret, stateData[state])
	})

	console.log(stateData)

	return stateData
}

/**
 * Feed each counts (county>state>race/ethnicity>filters) into the structure created above
 */
export function storeStateData(data, start) {
	// `/api/totals/` returns: {name, parent, group, count}[]

	// let maxGroup = 0;
	let stateData = start
	// secondary groups. does not work for deeper nested groups yet
	data.forEach(state_group => {
		let { name, parent, group, count } = state_group;
		// we want to remove this if statement, the StateStructure should exactly reflect the data
		if(stateData[name][parent].children[group]) // skip those whose groups don't match with that incident's primary group
		{
			count = parseInt(count)
			stateData[name][parent].children[group].count = count
			stateData[name].count += count
		}
	}) 

	let maxState = 0;

	// aggregate primary groups' counts
	for (let key in stateData) {
		let state = stateData[key]
		if (state.count > maxState) maxState = state.count; // max total of all states, for coloring
		for (let parent in state) {
			if (!(state[parent] instanceof Object)) continue; // not a parent
			state[parent].count = Object.values(state[parent].children).reduce((a, b) => ({count: a.count + b.count}), ({count: 0})).count
		}
	}


	stateData.max = maxState;
	return JSON.parse(JSON.stringify(stateData));  // return copy of object
}


/**
 * Passed a *filled* data structure and a state, aggregate the counts for that state.
 * Any number of filters may be passed in that limits the counts to those that fit the criteria.
 * E.g. getStateCount(data, 'California')
 *      getStateCount(data, 'California', 'Asian', 'published', 'Male')
 *
 */
export function getStateCounts(data, stateName, ... filters) {
	if (!data) return [];
	const state = data.find(e => e.state == stateName);
	if (!state) return [];
	return state.counties;
}

export function getStateSum(data, state, ... filters) {
	return getStateCounts(data, state, filters).map(e=>e.count).reduce((a, b) => (a+b), 0);
}

// Short-hand with cache for _max_
export function getStateTotal(data, state) {
	// var stateCounts = getStateCounts(data, state)
	// if (stateCounts.total) { // cache
	// 	return stateCounts.total;
	// }
	return getStateSum(data, state);
}

/**
 * Passed a *filled* data structure and a county, aggregate the counts for that county.
 * Any number of filters may be passed in that limits the counts to those that fit the criteria.
 *
 */
export function getCountyCounts(data, county, ... filters) {
	return (data.map(state => state.counties.filter(c => c.county==county))).flat(2); // we don't need to look in all 50 states
}

export function getCountySum(data, county, ... filters) {
	return getCountyCounts(data, county, filters).map(e=>e.count).reduce((a, b) => (a+b), 0);
}

// Short-hand with cache for _max_
export function getCountyTotal(data, county) {
	// var CountyCounts = getCountyCounts(data, County)
	// if (CountyCounts.total) { // cache
	// 	return CountyCounts.total;
	// }
	return getCountySum(data, county);
}

export function filterSum(data, ... filters) {
	if (!data) return 0;
	if (!filters) return data.map(e => e.count).reduce(((a,b) => a+b), 0);
	return data.filter(each => filters.some(f => Object.values(each).includes(f))).map(e => e.count).reduce(((a,b) => a+b), 0); 
}

export async function getAllFragments() {
	return axios.get('/api/totals/all')
	.then(res => { return res.data })
	.catch((err) => {
		alert(`API call failed: ${err}`);
		return {};
	});
}

export function storeCountyData(countyData) {
	let max = 0;
	countyData.forEach(county => {
		max = max < county.county_total ? county.county_total : max;
		_countyData[county.county_state] = {... county };
	});
	_countyData.max = max;
	return _countyData;
}

function getStateData() {
	return axios.get('/api/totals/')
	.then(res => { console.log(res); return res.data })
	.catch((err) => {
		alert(`API call failed: ${err}`);
		return {};
	});
}

function getPublishedStateData() {
	return axios.get('/api/totals/published')
	.then(res => { console.log(res); return res.data })
	.catch((err) => {
		alert(`API call failed: ${err}`);
		return {};
	});
}

function getCountyData() {  // TODO: Lazy load?
	return axios.get('/api/maps/countydata')
	.then(res => { return res.data })
	.catch((err) => {
		alert(`API call failed: ${err}`);
		return {};
	});
}

export async function getAllData() {
	return Promise.all([getStateData(), getPublishedStateData(), getStateStructure()]); // TODO: remove once we get county data working
	return Promise.all([getStateData(), getCountyData()]);
}

const colorBins = ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"];
var lockedLayer = null;
var lockedLayerColor = null;

function hashStateColor(sum, max) {
	let colorHashed;

	if(sum < max/10) colorHashed = colorBins[0];
    else if(sum < max/8) colorHashed = colorBins[1];
    else if(sum < max/5) colorHashed = colorBins[2];
    else if(sum < max/3) colorHashed = colorBins[3];
    else if(sum < max + 1) colorHashed = colorBins[4];

	return colorHashed;
}

export function resetStateColor(layer, statesData) {
	const STATE_NAME = layer.feature.properties.NAME;
	if(!STATE_NAME) return;
	const stateData = statesData[STATE_NAME];

	if(!stateData || stateData.total <= 0) {
		layer.setStyle({color: 'rgba(0, 0, 0, 0)'});
		return;
	}

	let colorHashed = hashStateColor(stateData.count, statesData.max);
    
    layer.setStyle({fillColor: colorHashed})
}

export function eachState(feature, layer, data, max, setStateDisplay) {
	const STATE_NAME = feature.properties.NAME;
	const stateData = getStateCounts(data, STATE_NAME);
	const stateTotal = getStateTotal(data, STATE_NAME);
		console.log(data, STATE_NAME, stateData, stateTotal)
	if(!stateData || stateTotal == 0) {
		layer.setStyle({color: 'rgba(0, 0, 0, 0)'});
		return;
	}
    // const colorHashed = colorBins[Math.floor((5*stateData.total-1)/total)];
    let colorHashed = hashStateColor(stateTotal, max);
    console.log(colorHashed)
    layer.on('mouseover', function(event){
	    if(!setStateDisplay(STATE_NAME)) return;  // setStateDisplay() will return false if we're locked onto something else
	    // layer._path.classList.add("show-state");
	    layer.setStyle({fillColor: 'rgb(200, 200, 200)'});
	});
    layer.on('mouseout', function(event){
    	if(!setStateDisplay("none")) return;
    	// layer._path.classList.remove("show-state");
    	layer.setStyle({fillColor: colorHashed});
	});
	layer.on('click', function(event) {
		layer.setStyle({fillColor: `rgb(100, 100, 100)`});
		if(lockedLayer) {
			lockedLayer.setStyle({fillColor: lockedLayerColor});
			if(lockedLayer === layer) {
				setStateDisplay("none", true);
				lockedLayer = null;
				lockedLayerColor = null;
				return;
			}
		}
		setStateDisplay(STATE_NAME, true);  // true parameter for locking

		lockedLayer = layer;
	});
	layer.setStyle({stroke: 1, weight: 1, opacity: 0.75, color: 'white', fillColor: colorHashed, fillOpacity: 0.75});
}

export function eachStatesCounties(feature, layer, data, max, setCountyDisplay)
{
	const COUNTY_NAME = feature.properties.NAME;
	const countyData = getCountyCounts(data, COUNTY_NAME);
	const countyTotal = getCountyTotal(data, COUNTY_NAME);
	if(!countyData || countyTotal == 0) {
		layer.setStyle({color: 'rgba(0, 0, 0, 0)'});
		return;
	}
    // const colorHashed = colorBins[Math.floor((5*stateData.total-1)/total)];
    let colorHashed = hashStateColor(countyTotal, max);
    layer.on('mouseover', function(event){
	    if(!setCountyDisplay(COUNTY_NAME)) return;  // setCountyDisplay() will return false if we're locked onto something else
	    // layer._path.classList.add("show-state");
	    layer.setStyle({fillColor: 'rgb(200, 200, 200)'});
	});
    layer.on('mouseout', function(event){
    	if(!setCountyDisplay("none")) return;
    	// layer._path.classList.remove("show-state");
    	layer.setStyle({fillColor: colorHashed});
	});
	layer.on('click', function(event) {
		layer.setStyle({fillColor: `rgb(100, 100, 100)`});
		if(lockedLayer) {
			lockedLayer.setStyle({fillColor: lockedLayerColor});
			if(lockedLayer === layer) {
				setCountyDisplay("none", true);
				lockedLayer = null;
				lockedLayerColor = null;
				return;
			}
		}
		setCountyDisplay(COUNTY_NAME, true);  // true parameter for locking

		lockedLayer = layer;
	});
	layer.setStyle({stroke: 1, weight: 1, opacity: 0.75, color: 'white', fillColor: colorHashed, fillOpacity: 0.75});
}