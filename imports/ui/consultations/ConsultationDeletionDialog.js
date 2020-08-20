import {Meteor} from 'meteor/meteor';

import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import {withStyles} from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '../modal/OptimizedDialog.js';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import DeleteIcon from '@material-ui/icons/Delete';
import CancelIcon from '@material-ui/icons/Cancel';

import {normalized} from '../../api/string.js';

const styles = (theme) => ({
	rightIcon: {
		marginLeft: theme.spacing(1)
	}
});

const ConsultationDeletionDialog = (props) => {
	const {open, onClose, patient, consultation, classes} = props;

	const [lastname, setLastname] = useState('');
	const [lastnameError, setLastnameError] = useState('');
	const [triedToOpen, setTriedToOpen] = useState(false);
	const render = open || triedToOpen;

	useEffect(() => {
		if (render && !triedToOpen) {
			setTriedToOpen(true);
		}
	}, [render, triedToOpen]);

	if (!triedToOpen) {
		return null;
	}

	const deleteThisConsultationIfPatientsLastNameMatches = (event) => {
		event.preventDefault();
		if (normalized(lastname) === normalized(patient.lastname)) {
			setLastnameError('');
			Meteor.call('consultations.remove', consultation._id, (err, _res) => {
				if (err) {
					console.error(err);
				} else {
					console.log(`Consultation #${consultation._id} deleted.`);
					onClose();
				}
			});
		} else {
			setLastnameError('Last names do not match');
		}
	};

	return (
		<Dialog
			open={open}
			component="form"
			aria-labelledby="consultation-deletion-dialog-title"
			onClose={onClose}
		>
			<DialogTitle id="consultation-deletion-dialog-title">
				Delete consultation for patient {patient.firstname} {patient.lastname}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					If you do not want to delete this consultation, click cancel. If you
					really want to delete this consultation from the system, enter the
					patient&apos;s last name below and click the delete button.
				</DialogContentText>
				<TextField
					autoFocus
					fullWidth
					margin="dense"
					label="Patient's last name"
					value={lastname}
					helperText={lastnameError}
					error={Boolean(lastnameError)}
					onChange={(e) => setLastname(e.target.value)}
				/>
			</DialogContent>
			<DialogActions>
				<Button type="submit" color="default" onClick={onClose}>
					Cancel
					<CancelIcon className={classes.rightIcon} />
				</Button>
				<Button
					color="secondary"
					onClick={deleteThisConsultationIfPatientsLastNameMatches}
				>
					Delete
					<DeleteIcon className={classes.rightIcon} />
				</Button>
			</DialogActions>
		</Dialog>
	);
};

ConsultationDeletionDialog.projection = {
	firstname: 1,
	lastname: 1
};

ConsultationDeletionDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	consultation: PropTypes.object.isRequired,
	patient: PropTypes.object.isRequired
};

export default withStyles(styles)(ConsultationDeletionDialog);
