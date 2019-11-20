const express = require('express');
const PG = require('pg-promise')();
const PQ = PG.ParameterizedQuery;

const db = require('../models');
const {
  checkLoginInfo,
} = require('../utilities');

const router = express.Router();
const columns = 'date, datesubmitted, lon, lat, reporttype, locationname, verified, id, sourceurl, groupsharassed, validsourceurl, waybackurl, validwaybackurl';
const findPointsInUS = `SELECT ${columns} FROM hcmdata WHERE (lon < -66.796875 AND lon > -124.5849609375) AND (lat < 49.00905080938215 AND lat > 25.125392611512158)`;
const findUnreviewedPoints = `SELECT ${columns} FROM hcmdata WHERE verified = -1`;
const totalsColumns = 'name, sum_harassment, jewish_harassed_total, african_american_harassed_total, arab_harassed_total,\
asian_american_harassed_total, disabled_harassed_total, latinx_harassed_total, lgbt_harassed_total, muslim_harassed_total,\
native_american_harassed_total, pacific_islander_harassed_total, sikh_harassed_total, women_harassed_total, men_harassed_total,\
girls_harassed_total, boys_harassed_total, white_harassed_total, immigrants_harassed_total, trump_supporter_harassed_total, others_harassed_total';
const getStateTotals = `SELECT ${totalsColumns} FROM us_states ORDER BY name ASC`;
// const getUSATotals = `SELECT COUNT(`

router.use((req, res, next) => {
  /* queries to /maps api go through here first */
  next();
});

router.get('/', (req, res) => {
  res.send('Maps home route');
});

router.get('/statedata', (req, res) => {
  db.any(getStateTotals)
    .then(data => {
      res.status(200).json({status: 'success', data});
    })
    .catch(error => console.log('ERROR: ', error));
});

// router.get('/usedata', (req, res) => {  // We could just aggregate the data on the front-end...
//   db.any(getUSATotals)
//     .then(data => {
//       res.status(200).json({status: 'success', data})
//     });
//     .catch(error => console.log('ERROR: ', error));
// });

router.get('/countydata', (req,res) => {
  db.any(`SELECT ${totalsColumns}, county_state from us_counties`)
    .then(data => {
      res.status(200).json({status: 'success', data});
    })
    .catch(error => console.log('ERROR: ', error));
});

router.get('/countydata/:state', (req, res) => {
  db.any(`SELECT ${totalsColumns}, county_state FROM us_counties WHERE state_name='${req.params.state}'`)
    .then(data => {
      res.status(200).json({status: 'success', data});
    })
    .catch(error => console.log('ERROR: ', error));
});

router.get('/usapoints', (req, res) => {
  db.any(findPointsInUS)
    .then((mapdata) => {
      res.status(200)
        .json({
          status: 'success',
          mapdata,
        });
    })
    .catch(err => console.log('ERROR:', err));
});

router.get('/unreviewedpoints', (req, res) => {
  const { email, password, loggedIn } = req.query;
  if (loggedIn === 'false' && !checkLoginInfo(email, password)) {
    res.status(403).send('unauthorized');
    return;
  }

  db.any(findUnreviewedPoints)
    .then((mapdata) => {
      res.status(200)
        .json({
          status: 'success',
          mapdata,
        });
    })
    .catch(err => console.log('ERROR:', err));
});

router.post('/reviewedincident', (req, res) => {
  const updateUnreviewedIncident = new PQ('UPDATE hcmdata SET verified = $2 WHERE id = $1', Object.values(req.body));

  db.none(updateUnreviewedIncident)
    .then(() => res.send('Incident report reviewed'))
    .catch(err => console.log('ERROR:', err));
});

router.post('/incidentreport', (req, res) => {
  const values = [...Object.values(req.body), false, false];
  const addUnreviewedIncident = new PQ('INSERT INTO hcmdata(date, datesubmitted, groupsharassed, lat, locationname, lon, sourceurl, validsourceurl, verified, reviewedbystudent, reporttype, attemptedwaybackurl, validwaybackurl) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', values);

  db.none(addUnreviewedIncident)
    .then(() => res.send('Incident report added'))
    .catch(err => console.log('ERROR:', err));
});

router.delete('/incidentreport', (req, res) => {
  const deleteUnreviewedIncident = new PQ('DELETE FROM hcmdata WHERE id = $1', Object.values(req.body));

  db.result(deleteUnreviewedIncident)
    .then(() => res.send('Incident report deleted'))
    .catch(err => console.log('ERROR:', err));
});

// "Let it cache": https://stackoverflow.com/questions/37300997/multi-row-insert-with-pg-promise
const incident_groups_column = new PG.helpers.ColumnSet(['incident_id', 'groups_id'], {table: 'incident_groups'});

const groupsDict = {
  // pull from database
}

const insertGroupsValues = (id, groups) => {
  return groups.map(group => ({incident_id: id, groups_id: groupsDict[group]}));
}

// Clean data. Check url is a url by regex

// TODO: move to reporter controller
router.post('/incident', (req, res) => {

  db.tx(async t => {
    // Transaction: insert into incident, get ID => for each group, insert relation into incident_groups
    // Reference: https://stackoverflow.com/questions/40166201/how-to-return-the-serial-primary-key-from-a-db-insert-to-use-for-another-db-inse
    const id = await t.one(`INSERT INTO incident(lon, lat, locationname, verified, reporttype, type, sourceurl,
    validsourceurl, target_category, race_ethnicity_targeted, religion_targeted, gender_sexual_targeted,
    other_targeted, other_groups, reviewedbystudent, incident_date, submitted_date, attemptedwaybackurl, validwaybackurl)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING id`, [], c=>+c.id);  // interpolation

    return t.none(`INSERT INTO incident_groups(incident_id, group_id) VALUES(..)`, [id])
  }).then(data => {

  }).catch(error => {
    // fail
  })
});

module.exports = router;
