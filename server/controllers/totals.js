const express = require('express');
const PQ = require('pg-promise').ParameterizedQuery;

const db = require('../models');
const {
	checkLoginInfo,
} = require('../utilities');

const router = express.Router();

const totals_columns = ["sum_harassment", "jewish_harassed_total", "african_american_harassed_total", "arab_harassed_total",
						"asian_american_harassed_total", "disabled_harassed_total", "latinx_harassed_total",
						"lgbt_harassed_total", "muslim_harassed_total", "native_american_harassed_total",
						"pacific_islander_harassed_total", "sikh_harassed_total", "women_harassed_total", "men_harassed_total", 
						"girls_harassed_total", "boys_harassed_total", "white_harassed_total", "immigrants_harassed_total",
						"trump_supporter_harassed_total", "others_harassed_total"];
const totals_match_pattern = ['%', '%jewish%', '%african american%', '%arab%', '%asian american%', '%disabled%', '%latinx%', '%lgbt%',
								'%muslim%', '%native american%', '%pacific islander%', '%sikh%', '%women%', '%men%', '%girls%',
								'%boys%', '%white%', '%immigrants%', '%trump supporter%', '%others%'];
const state_table_name = 'us_states';
const county_table_name = 'us_counties';
const state_totals_table_name = 'totals';
const county_totals_table_name = 'county_totals';
const data_table_name = 'hcmdata';

const updateState = `update ${state_totals_table_name} set
					${totals_columns.map( (column_name, i) => {
						return (column_name + "= (SELECT count(*) FROM " + data_table_name + " as data_table where groupsharassed ilike '" + totals_match_pattern[i]
											+ "' and ST_Intersects(" + state_table_name + ".geom, ST_SetSRID(ST_MakePoint(data_table.lon, data_table.lat), 4326))),")
					})}`;

const updateCounty = `update ${county_totals_table_name} set
					${totals_columns.map( (column_name, i) => {
						return (column_name + "= (SELECT count(*) FROM " + data_table_name + " as data_table where groupsharassed ilike '" + totals_match_pattern[i]
											+ "' and ST_Intersects(" + county_table_name + ".geom, ST_SetSRID(ST_MakePoint(data_table.lon, data_table.lat), 4326))),")
					})}`;
					
const columns = ["jewish", "african_american", "arab", "asian_american", "disabled", "latinx", "lgbt", "muslim", "native_american",
					"pacific_islander", "sikh", "women", "men", "girls", "boys", "white", "immigrants", "trump_supporter", "others"]

router.use((req, res, next) => {
	/* queries to /totals api go through here first */
	next();
});

router.get('/', (req, res) => {
	db.any(`select ${columns} from us_states order by name asc`)
	.then((result) => {
		res.status(200)
		.json({
			status: 'success',
			result
		});
	})
	.catch(err => console.log('ERROR: ', err));
});

router.get('/:category', (req, res) => {
	db.any(`select ${req.params.category + '_harassed_total, sum_harassment, name'} from us_states order by name asc`)
	.then(result => {
		res.status(200)
		.json({
			status: 'success',
			result
		});
	})
	.catch(err => console.log('ERROR: ', err));
});

router.get('/update', (req, res) => {
	res.write('Updating totals...');
	db.one(updateAll)
	.then((result) => {
		res.status(200)
		.json({
			status: 'success',
			mapdata,
		});
	})
	.catch(err => console.log('ERROR:', err));
});

router.get('/update/:state', (req, res) => {
	db.one(updateAll + " WHERE us_states.name ilike '%" + req.params.state + "%'")
	.then(result => {
		res.status(200)
		.json({
			status: 'success',
			result
		});
	})
	.catch(err => console.log('ERROR: ', err));
});


module.exports = router;