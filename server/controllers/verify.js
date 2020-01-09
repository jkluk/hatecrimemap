const express = require('express');
const PG = require('pg-promise')();
const PQ = PG.ParameterizedQuery;

const db = require('../models');
const router = express.Router();
const session = require('express-session');

router.use('*', (req, res, next) => {
  const user = req.session.user;
  if (user) {
    next();
  } else {
    res.send('Not authorized');
  }
});

const columns = 'date, datesubmitted, lon, lat, reporttype, locationname, verified, id, sourceurl, groupsharassed, validsourceurl, waybackurl, validwaybackurl';
const findUnreviewedPoints = `SELECT ${columns} FROM hcmdata WHERE verified = -1`;

router.get('/unreviewedpoints', (req, res) => {
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

module.exports = router;