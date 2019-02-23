import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import PrintIcon from '@material-ui/icons/Print';

import jsPDF from 'jspdf';

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let EnhancedTableToolbar = props => {

  const { classes, printNodeRef } = props;

  const printTarget = ReactDOM.findDOMNode(printNodeRef.current);

  console.debug(jsPDF, printNodeRef, printTarget);

  const print = source => e => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    // source can be HTML-formatted string, or a reference
    // to an actual DOM element from which the text will be scraped.
    const margins = {
      top: 0,
      bottom: 0,
      left: 0,
      width: 200,
    };
    const width = margins.width;
    // all coords and widths are in jsPDF instance's declared units
    // 'inches' in this case
    pdf.fromHTML(
      source, // HTML string or DOM elem ref.
      margins.left, // x coord
      margins.top, {// y coord
          width, // max width of content on PDF
      },
      dispose => {
          pdf.save('results.pdf');
      } ,
      margins
    );
  } ;

  return (
    <Toolbar
      className={classes.root}
    >
      <div className={classes.title}>
          <Typography variant="h6" id="tableTitle">
            Results
          </Typography>
      </div>
      <div className={classes.spacer}/>
      <div className={classes.actions}>
        <Tooltip title="Print">
          <IconButton aria-label="Print" onClick={print(printTarget)} disabled={!printTarget}>
            <PrintIcon/>
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  anomalyRow: {
    backgroundColor: '#fa8',
  },
  headerRow: {
    backgroundColor: '#ddd',
  },
  subheaderRow: {
    backgroundColor: '#eee',
  },
  endRow: {
    '& th' : {
      color: '#666 !important',
    },
    '& td' : {
      color: '#666 !important',
    },
  },
  commentRow: {
    '& th' : {
      color: '#666 !important',
    },
    '& td' : {
      color: '#666 !important',
    },
  },
  row: {
  },
  normalCell: {
    color: '#444',
  },
});

class HealthOneLabResultsTable extends React.Component {

  constructor ( props ) {
    super(props);
    this.printNodeRef = React.createRef();
  }

  render () {
    const { classes , document } = this.props;

    if (!document.results || document.results.length === 0) {
      return (
        <Typography>No results</Typography>
      ) ;
    }

    const rows = [] ;

    for ( const result of document.results ) {
      let className = classes.row;
      if (result.flag === '*') className = classes.anomalyRow ;
      else if (result.flag === 'C') className = classes.commentRow ;
      else if (result.code && result.code.startsWith('t_')) {
        if (result.name && result.name.match(/^[A-Z ]*$/)) {
          className = classes.headerRow ;
        }
        else {
          className = classes.subheaderRow ;
        }
      }
      else if (result.code === 'TEXTEF') className = classes.endRow ;
      rows.push({
        className,
        ...result,
      }) ;
    }

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar printNodeRef={this.printNodeRef}/>
        <Table className={classes.table} ref={this.printNodeRef}>
          <TableHead>
            <TableRow>
              <TableCell numeric>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell numeric>Measure</TableCell>
              <TableCell numeric>Normal</TableCell>
              <TableCell>Flag</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => {
              const isResult = row.code && row.code.match(/^\d+$/);
              const comment = row.measure ? row.measure.split('\t') : [];
              comment.pop();
              return (
                <TableRow key={i} className={row.className}>
                  {isResult && <TableCell numeric>{row.code}</TableCell>}
                  {isResult && <TableCell component="th" scope="row">
                    {row.name === 'COMMENTAIRES' ? '' : row.name}
                  </TableCell>}
                  {!isResult && <TableCell component="th" scope="row" colSpan={2}>
                    {row.name}
                  </TableCell>}
                  { row.flag === 'C' || row.code === 'TEXTEF' ? comment.length != 3 ?
                    <TableCell colSpan={3}>{row.measure}</TableCell>
                    :
                    <React.Fragment>
                      <TableCell>{comment[0]}</TableCell>
                      <TableCell numeric>{comment[1]}</TableCell>
                      <TableCell numeric>{comment[2]}</TableCell>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell numeric>{row.measure}</TableCell>
                      <TableCell className={classes.normalCell} numeric>{row.normal}</TableCell>
                    </React.Fragment>
                  }
                  <TableCell>{row.flag}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }

}

HealthOneLabResultsTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HealthOneLabResultsTable);
