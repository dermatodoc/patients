import { Meteor } from 'meteor/meteor' ;
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom'

import { withStyles } from 'material-ui/styles';

import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
} from 'material-ui/ExpansionPanel';

import Divider from 'material-ui/Divider';

import List, { ListItem, ListItemText } from 'material-ui/List';

import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';

import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import InfoIcon from 'material-ui-icons/Info';
import DoneIcon from 'material-ui-icons/Done';
import HourglassFullIcon from 'material-ui-icons/HourglassFull';
import EditIcon from 'material-ui-icons/Edit';
import AlarmIcon from 'material-ui-icons/Alarm';
import WarningIcon from 'material-ui-icons/Warning';
import DeleteIcon from 'material-ui-icons/Delete';

import { format } from 'date-fns' ;

import { Patients } from '../api/patients.js';

const styles = theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  chips: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  } ,
  chip: {
    marginRight: theme.spacing.unit,
  },
});

function ConsultationCard(props) {

  const {
    classes ,
    loadingPatient ,
    patient ,
    consultation : {
      _id,
      patientId,
      datetime,
      reason,
      done,
      todo,
      treatment,
      next,
      more,
    } ,
  } = props;

  const deleteThisConsultation = event => {
    Meteor.call('consultations.remove', _id, (err, res) => {
      if (err) console.error(err);
      else {
	console.log(res);
      }
    }) ;
  } ;

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
	<div className={classes.chips}>
	  <Chip label={format(datetime,'D MMMM YYYY')} className={classes.chip}/>
	  <Chip label={format(datetime,'hh:mmA')} className={classes.chip}/>
	  <Chip avatar={(!loadingPatient && patient && patient.photo) ? <Avatar src={`data:image/png;base64,${patient.photo}`}/> : null} label={loadingPatient ? patientId : !patient ? 'Not found' : `${patient.firstname} ${patient.lastname}`} className={classes.chip} component={Link} to={`/patient/${patientId}`}/>
	</div>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
	<List>
	  <ListItem>
	    <Avatar><InfoIcon/></Avatar>
	    <ListItemText primary="Motif de la consultation" secondary={reason}/>
	  </ListItem>
	  <ListItem>
	    <Avatar><DoneIcon/></Avatar>
	    <ListItemText primary="Examens déjà réalisés" secondary={done}/>
	  </ListItem>
	  <ListItem>
	    <Avatar><HourglassFullIcon/></Avatar>
	    <ListItemText primary="Examens à réaliser" secondary={todo}/>
	  </ListItem>
	  <ListItem>
	    <Avatar><EditIcon/></Avatar>
	    <ListItemText primary="Traitement" secondary={treatment}/>
	  </ListItem>
	  <ListItem>
	    <Avatar><AlarmIcon/></Avatar>
	    <ListItemText primary="À revoir" secondary={next}/>
	  </ListItem>
	  <ListItem>
	    <Avatar><WarningIcon/></Avatar>
	    <ListItemText primary="Autres remarques" secondary={more}/>
	  </ListItem>
	</List>
      </ExpansionPanelDetails>
	  <Divider/>
      <ExpansionPanelActions>
	<Button color="primary" component={Link} to={`/edit/consultation/${_id}`}>
	  Edit<EditIcon/>
	</Button>
	<Button color="secondary" onClick={deleteThisConsultation}>
	  Delete<DeleteIcon/>
	</Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}

ConsultationCard.propTypes = {
  classes: PropTypes.object.isRequired,
  consultation: PropTypes.object.isRequired,
};


export default withTracker(({consultation}) => {
	const _id = consultation.patientId;
	const handle = Meteor.subscribe('patient', _id);
	if ( handle.ready() ) {
		const patient = Patients.findOne(_id);
		return { loadingPatient: false, patient } ;
	}
	else return { loadingPatient: true } ;
}) ( withStyles(styles, { withTheme: true})(ConsultationCard) ) ;