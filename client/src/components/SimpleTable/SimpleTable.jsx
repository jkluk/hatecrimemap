import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import uuidv4 from 'uuid/v4';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  cell: {
    width: '20px',
  },
});

const SimpleTable = ({ columnHeaders, tableData, classes }) => (
  <Paper className={classes.root}>
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.cell} key="id">ID</TableCell>
          {columnHeaders.map(header => <TableCell className={classes.cell} key={header}>{header}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {tableData.map((row, i) => (
          <TableRow className={classes.row} key={row[0]}>
            {row.map(cell => <TableCell className={classes.cell} key={uuidv4()}>{cell}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

SimpleTable.propTypes = {
  columnHeaders: PropTypes.array.isRequired,
  tableData: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleTable);
