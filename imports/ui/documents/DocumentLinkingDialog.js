import { Meteor } from 'meteor/meteor' ;
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react';
import PropTypes from 'prop-types';

import { list } from '@aureooms/js-itertools' ;
import { take } from '@aureooms/js-itertools' ;
import { filter } from '@aureooms/js-itertools' ;

import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import LinkIcon from '@material-ui/icons/Link';
import CancelIcon from '@material-ui/icons/Cancel';

import { Patients } from '../../api/patients.js';

import SetPicker from '../input/SetPicker.js';

const styles = theme => ({
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  dialogPaper: {
      overflow: "visible"
  },
}) ;

const patientToString = x => `${x.lastname} ${x.firstname} (${x._id})` ;

const patientFilter = (suggestions, inputValue) => {

  const matches = x => !inputValue || patientToString(x).toLowerCase().includes(inputValue.toLowerCase()) ;

  const keep = 5 ;

  return list( take( filter(matches, suggestions) , keep ) ) ;

} ;

class DocumentLinkingDialog extends React.Component {

  constructor ( props ) {
    super( props ) ;
    this.state = {
      patients: props.existingLink ? [ props.existingLink ] : [],
    };
  }

  render () {

    const { open , onClose , document, classes, allPatients } = this.props ;

    const { patients } = this.state;

    const linkThisDocument = event => {
      event.preventDefault();
      const documentId = document._id;
      const patientId = patients[0]._id;
      Meteor.call('documents.link', documentId, patientId, (err, res) => {
	if ( err ) console.error( err ) ;
	else {
	  console.log(`Document #${documentId} linked to patient #${patientId}.`)
	  onClose();
	}
      });
    };

    return (
	<Dialog
	  classes={{paper: classes.dialogPaper}}
	  open={open}
	  onClose={onClose}
	  component="form"
	  aria-labelledby="document-linking-dialog-title"
	>
	  <DialogTitle id="document-linking-dialog-title">Link document {document._id}</DialogTitle>
	  <DialogContent
	    className={classes.dialogPaper}
	  >
	    <DialogContentText>
	      If you do not want to link this document, click cancel.
	      If you really want to link this document,
	      enter the name of the patient to link it to
	      and
	      click the link button.
	    </DialogContentText>
	    <SetPicker
	      suggestions={allPatients}
	      itemToKey={x=>x._id}
	      itemToString={patientToString}
	      filter={patientFilter}
	      TextFieldProps={{
		label: "Patient to link document to",
		margin: "normal",
	      }}
	      value={patients}
	      onChange={e => this.setState({ patients : e.target.value })}
	      maxCount={1}
	    />
	  </DialogContent>
	  <DialogActions>
	    <Button type="submit" onClick={onClose} color="default">
	      Cancel
	      <CancelIcon className={classes.rightIcon}/>
	    </Button>
	    <Button onClick={linkThisDocument} disabled={patients.length === 0} color="secondary">
	      Link
	      <LinkIcon className={classes.rightIcon}/>
	    </Button>
	  </DialogActions>
	</Dialog>
    );
  }

}

DocumentLinkingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
} ;

export default withTracker(() => {
  Meteor.subscribe('patients');
  return {
    allPatients: Patients.find({}, { sort: { lastname: 1 } }).fetch() ,
  };
}) ( withStyles(styles, { withTheme: true }) (DocumentLinkingDialog) ) ;