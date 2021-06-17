import {Meteor} from 'meteor/meteor';

import React, {useReducer, useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';

import {Prompt} from 'react-router';

import {map} from '@iterable-iterator/map';
import {list} from '@iterable-iterator/list';

import {makeStyles, createStyles} from '@material-ui/core/styles';
import {useSnackbar} from 'notistack';

import Grid from '@material-ui/core/Grid';

import Typography from '@material-ui/core/Typography';

import Fab from '@material-ui/core/Fab';

import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import UndoIcon from '@material-ui/icons/Undo';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import dateFormat from 'date-fns/format';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import startOfToday from 'date-fns/startOfToday';
import TextField from '../input/TextField.js';
import FixedFab, {computeFixedFabStyle} from '../button/FixedFab.js';

import {useInsurancesFind} from '../../api/insurances.js';
import {useDoctorsFind} from '../../api/doctors.js';
import {useAllergiesFind} from '../../api/allergies.js';
import {useSetting} from '../../client/settings.js';

import eidParseBirthdate from '../../api/eidParseBirthdate.js';
import useNoShowsForPatient from '../../api/useNoShowsForPatient.js';

import {
	// makeAnyIndex,
	makeRegExpIndex
} from '../../api/string.js';

import SetPicker from '../input/SetPicker.js';
import makeSubstringSuggestions from '../input/makeSubstringSuggestions.js';
import ColorizedTextarea from '../input/ColorizedTextarea.js';

import AllergyChip from '../allergies/AllergyChip.js';
import DoctorChip from '../doctors/DoctorChip.js';
import InsuranceChip from '../insurances/InsuranceChip.js';

import ManageConsultationsForPatientButton from '../consultations/ManageConsultationsForPatientButton.js';
import AttachFileButton from '../attachments/AttachFileButton.js';

import PatientDeletionDialog from './PatientDeletionDialog.js';

const styles = (theme) =>
	createStyles({
		root: {
			padding: theme.spacing(3),
			paddingBottom: theme.spacing(5)
		},
		photoPlaceHolder: {
			display: 'inline-flex',
			fontSize: '4rem',
			margin: 0,
			width: 140,
			height: 200,
			alignItems: 'center',
			justifyContent: 'center',
			color: '#fff',
			backgroundColor: '#999',
			verticalAlign: 'top',
			marginBottom: theme.spacing(2)
		},
		left: {
			textAlign: 'center'
		},
		photo: {
			width: 140,
			height: 200,
			verticalAlign: 'top',
			marginBottom: theme.spacing(2)
		},
		formControl: {
			overflow: 'auto',
			'& input, & div': {
				color: 'black !important'
			}
		},
		setPicker: {
			height: '100%'
		},
		multiline: {
			height: '100%',
			overflow: 'auto',
			'& textarea': {
				color: 'black !important'
			}
		},
		button: {
			margin: theme.spacing(1)
		},
		problem: {
			color: 'red'
		},
		noShowsAdornment: {
			color: '#999'
		},
		editButton: computeFixedFabStyle({theme, col: 1}),
		saveButton: computeFixedFabStyle({theme, col: 1}),
		undoButton: computeFixedFabStyle({theme, col: 2}),
		attachButton: computeFixedFabStyle({theme, col: 2}),
		deleteButton: computeFixedFabStyle({theme, col: 4})
	});

const useStyles = makeStyles(styles);

const initialState = {
	patient: undefined,
	editing: false,
	dirty: false,
	deleting: false
};

/**
 * reducer.
 *
 * @param {Object} state
 * @param {{type: string, key?: string, value?: any, payload?: any}} action
 */
const reducer = (state, action) => {
	switch (action.type) {
		case 'update':
			return {
				...state,
				patient: {...state.patient, [action.key]: action.value},
				dirty: true
			};
		case 'editing':
			return {...state, editing: true};
		case 'not-editing':
			return {...state, editing: false, dirty: false};
		case 'deleting':
			return {...state, deleting: true};
		case 'not-deleting':
			return {...state, deleting: false};
		case 'init':
			return {
				...state,
				editing: false,
				dirty: false,
				deleting: false,
				patient: action.payload
			};
		default:
			throw new Error(`Unknown action type ${action.type}.`);
	}
};

const PatientPersonalInformation = (props) => {
	const {value: importantStrings} = useSetting('important-strings');

	const importantStringsDict = useMemo(() => {
		// return makeAnyIndex(importantStrings);
		return makeRegExpIndex(importantStrings);
	}, [importantStrings]);

	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		dispatch({type: 'init', payload: props.patient});
	}, [JSON.stringify(props.patient)]);

	const {editing, dirty, deleting, patient} = state;
	const {loading} = props;

	const {enqueueSnackbar, closeSnackbar} = useSnackbar();

	const classes = useStyles();

	const saveDetails = (_event) => {
		const key = enqueueSnackbar('Processing...', {
			variant: 'info',
			persist: true
		});
		Meteor.call('patients.update', patient._id, patient, (err, _res) => {
			closeSnackbar(key);
			if (err) {
				console.error(err);
				enqueueSnackbar(err.message, {variant: 'error'});
			} else {
				const message = `Patient #${patient._id} updated.`;
				console.log(message);
				enqueueSnackbar(message, {variant: 'success'});
				dispatch({type: 'not-editing'});
			}
		});
	};

	const {value: reifiedNoShows} = useNoShowsForPatient(props.patient._id);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!patient) {
		return <div>Patient not found.</div>;
	}

	const placeholder = !editing ? '?' : 'Write some information here';

	const minRows = 8;
	const maxRows = 100;

	const update =
		(key, f = (v) => v) =>
		(e) => {
			dispatch({type: 'update', key, value: f(e.target.value)});
		};

	const updateList = (key) => update(key, (v) => list(map((x) => x.name, v)));

	const _birthdate = eidParseBirthdate(patient.birthdate);
	const thisMorning = startOfToday();
	const ageInterval = {start: _birthdate, end: thisMorning};
	const detailedAge = formatDuration(intervalToDuration(ageInterval), {
		delimiter: ','
	});
	const shortAge = detailedAge.split(',')[0];
	const displayedAge =
		(ageInterval.end < ageInterval.start ? '-' : '') + shortAge;

	const totalNoShow = (patient.noshow || 0) + (reifiedNoShows || 0);

	return (
		<Paper className={classes.root}>
			<Prompt
				when={dirty}
				message="You are trying to leave the page while in edit mode. Are you sure you want to continue?"
			/>
			<Grid container spacing={3}>
				<Grid item sm={4} md={2} className={classes.left}>
					{patient.photo ? (
						<img
							className={classes.photo}
							src={`data:image/png;base64,${patient.photo}`}
							title={`${patient.firstname} ${patient.lastname}`}
						/>
					) : (
						<div className={classes.photoPlaceHolder}>
							{patient.firstname ? patient.firstname[0] : '?'}
							{patient.lastname ? patient.lastname[0] : '?'}
						</div>
					)}
					{!patient.birthdate ? (
						''
					) : (
						<Typography variant="h5">
							{dateFormat(_birthdate, 'd MMM yyyy')}
						</Typography>
					)}
					{!patient.birthdate ? (
						''
					) : (
						<Typography variant="h5">{displayedAge}</Typography>
					)}
					{!totalNoShow ? (
						''
					) : (
						<Typography className={classes.problem} variant="h4">
							PVPP = {totalNoShow}
						</Typography>
					)}
				</Grid>
				<Grid item sm={8} md={10}>
					<form>
						<Grid container spacing={3}>
							{editing && (
								<>
									<Grid item xs={2}>
										<TextField
											fullWidth
											className={classes.formControl}
											label="NISS"
											value={patient.niss}
											readOnly={!editing}
											margin="normal"
											onChange={update('niss')}
										/>
									</Grid>
									<Grid item xs={3}>
										<TextField
											fullWidth
											className={classes.formControl}
											label="Last name"
											value={patient.lastname}
											readOnly={!editing}
											margin="normal"
											onChange={update('lastname')}
										/>
									</Grid>
									<Grid item xs={3}>
										<TextField
											fullWidth
											className={classes.formControl}
											label="First name"
											value={patient.firstname}
											readOnly={!editing}
											margin="normal"
											onChange={update('firstname')}
										/>
									</Grid>
									<Grid item xs={2}>
										<FormControl
											fullWidth
											margin="normal"
											className={classes.formControl}
										>
											<InputLabel htmlFor="sex">Sex</InputLabel>
											<Select
												value={patient.sex || ''}
												inputProps={{
													readOnly: !editing,
													name: 'sex',
													id: 'sex'
												}}
												onChange={update('sex')}
											>
												<MenuItem value="">
													<em>None</em>
												</MenuItem>
												<MenuItem value="female">Female</MenuItem>
												<MenuItem value="male">Male</MenuItem>
												<MenuItem value="other">Other</MenuItem>
											</Select>
										</FormControl>
									</Grid>
									<Grid item xs={2}>
										<TextField
											fullWidth
											className={classes.formControl}
											type="date"
											disabled={!editing}
											label="Birth date"
											InputLabelProps={{
												shrink: true
											}}
											value={dateFormat(_birthdate, 'yyyy-MM-dd')}
											margin="normal"
											onChange={update('birthdate')}
										/>
									</Grid>
								</>
							)}
							<Grid item xs={12} md={6}>
								<ColorizedTextarea
									fullWidth
									readOnly={!editing}
									label="Antécédents"
									placeholder={placeholder}
									rows={minRows}
									rowsMax={maxRows}
									className={classes.multiline}
									InputLabelProps={{
										shrink: true
									}}
									InputProps={{
										style: {
											height: '100%',
											alignItems: 'start'
										}
									}}
									value={patient.antecedents}
									margin="normal"
									dict={importantStringsDict}
									onChange={update('antecedents')}
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<ColorizedTextarea
									fullWidth
									readOnly={!editing}
									label="Traitement en cours"
									placeholder={placeholder}
									rows={minRows}
									rowsMax={maxRows}
									className={classes.multiline}
									InputLabelProps={{
										shrink: true
									}}
									InputProps={{
										style: {
											height: '100%',
											alignItems: 'start'
										}
									}}
									value={patient.ongoing}
									margin="normal"
									dict={importantStringsDict}
									onChange={update('ongoing')}
								/>
							</Grid>

							<Grid item xs={12} md={12}>
								<SetPicker
									withoutToggle
									itemToKey={(x) => x._id}
									itemToString={(x) => x.name}
									createNewItem={(name) => ({name})}
									useSuggestions={makeSubstringSuggestions(
										useAllergiesFind,
										patient.allergies
									)}
									readOnly={!editing}
									TextFieldProps={{
										label: 'Allergies',
										margin: 'normal'
									}}
									Chip={AllergyChip}
									chipProps={{
										avatar: <Avatar>Al</Avatar>
									}}
									value={list(map((x) => ({name: x}), patient.allergies || []))}
									placeholder={placeholder}
									onChange={updateList('allergies')}
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									multiline
									readOnly={!editing}
									label="Rue et Numéro"
									InputLabelProps={{
										shrink: true
									}}
									placeholder={placeholder}
									rows={1}
									className={classes.multiline}
									value={patient.streetandnumber}
									margin="normal"
									onChange={update('streetandnumber')}
								/>
							</Grid>
							<Grid item xs={12} md={2}>
								<TextField
									fullWidth
									multiline
									readOnly={!editing}
									label="Code Postal"
									InputLabelProps={{
										shrink: true
									}}
									placeholder={placeholder}
									rows={1}
									className={classes.multiline}
									value={patient.zip}
									margin="normal"
									onChange={update('zip')}
								/>
							</Grid>
							<Grid item xs={12} md={4}>
								<TextField
									fullWidth
									multiline
									readOnly={!editing}
									label="Commune"
									InputLabelProps={{
										shrink: true
									}}
									placeholder={placeholder}
									rows={1}
									className={classes.multiline}
									value={patient.municipality}
									margin="normal"
									onChange={update('municipality')}
								/>
							</Grid>

							<Grid item xs={12} md={4}>
								<TextField
									fullWidth
									multiline
									readOnly={!editing}
									InputLabelProps={{
										shrink: true
									}}
									InputProps={{
										style: {
											height: '100%',
											alignItems: 'start'
										}
									}}
									label="Numéro de téléphone"
									placeholder={placeholder}
									rows={1}
									className={classes.multiline}
									value={patient.phone}
									margin="normal"
									onChange={update('phone')}
								/>
							</Grid>
							<Grid item xs={12} md={4}>
								<SetPicker
									withoutToggle
									className={classes.setPicker}
									itemToKey={(x) => x._id}
									itemToString={(x) => x.name}
									createNewItem={(name) => ({name})}
									useSuggestions={makeSubstringSuggestions(
										useDoctorsFind,
										patient.doctors
									)}
									readOnly={!editing}
									TextFieldProps={{
										fullWidth: true,
										label: 'Médecin Traitant',
										margin: 'normal',
										style: {
											height: '100%'
										}
									}}
									InputProps={{
										style: {
											height: '100%'
										}
									}}
									Chip={DoctorChip}
									chipProps={{
										avatar: <Avatar>Dr</Avatar>
									}}
									value={list(map((x) => ({name: x}), patient.doctors || []))}
									placeholder={placeholder}
									onChange={updateList('doctors')}
								/>
							</Grid>
							<Grid item xs={12} md={4}>
								<SetPicker
									withoutToggle
									className={classes.setPicker}
									itemToKey={(x) => x._id}
									itemToString={(x) => x.name}
									createNewItem={(name) => ({name})}
									useSuggestions={makeSubstringSuggestions(
										useInsurancesFind,
										patient.insurances
									)}
									readOnly={!editing}
									TextFieldProps={{
										fullWidth: true,
										label: 'Mutuelle',
										margin: 'normal',
										style: {
											height: '100%'
										}
									}}
									InputProps={{
										style: {
											height: '100%'
										}
									}}
									Chip={InsuranceChip}
									chipProps={{
										avatar: <Avatar>In</Avatar>
									}}
									value={list(
										map((x) => ({name: x}), patient.insurances || [])
									)}
									placeholder={placeholder}
									onChange={updateList('insurances')}
								/>
							</Grid>

							<Grid item xs={9}>
								<ColorizedTextarea
									fullWidth
									readOnly={!editing}
									label="About"
									placeholder={placeholder}
									rows={2}
									rowsMax={maxRows}
									className={classes.multiline}
									InputLabelProps={{
										shrink: true
									}}
									InputProps={{
										style: {
											height: '100%',
											alignItems: 'start'
										}
									}}
									value={patient.about}
									margin="normal"
									dict={importantStringsDict}
									onChange={update('about')}
								/>
							</Grid>
							<Grid item xs={3}>
								<TextField
									readOnly={!editing}
									InputProps={{
										startAdornment: reifiedNoShows ? (
											<InputAdornment
												className={classes.noShowsAdornment}
												position="start"
											>
												{reifiedNoShows}+
											</InputAdornment>
										) : undefined,
										style: {
											height: '100%'
										}
									}}
									label="PVPP (sans RDV)"
									placeholder={placeholder}
									className={classes.multiline}
									value={patient.noshow || 0}
									margin="normal"
									onChange={update('noshow', (v) =>
										v === '' ? 0 : Number.parseInt(v, 10)
									)}
								/>
							</Grid>
						</Grid>
					</form>
				</Grid>
			</Grid>
			{editing ? (
				<>
					<Fab
						className={classes.saveButton}
						color="primary"
						disabled={!dirty}
						onClick={saveDetails}
					>
						<SaveIcon />
					</Fab>
					<Fab
						className={classes.undoButton}
						color={dirty ? 'secondary' : 'default'}
						onClick={() => dispatch({type: 'init', payload: props.patient})}
					>
						<UndoIcon />
					</Fab>
				</>
			) : (
				<>
					<Fab
						className={classes.editButton}
						color="default"
						onClick={() => dispatch({type: 'editing'})}
					>
						<EditIcon />
					</Fab>
					<AttachFileButton
						Button={Fab}
						className={classes.attachButton}
						color="default"
						method="patients.attach"
						item={patient._id}
					>
						<AttachFileIcon />
					</AttachFileButton>
					<ManageConsultationsForPatientButton
						Button={FixedFab}
						col={3}
						color="primary"
						patientId={patient._id}
						tooltip="More actions!"
					/>
					<Fab
						className={classes.deleteButton}
						color="secondary"
						onClick={() => dispatch({type: 'deleting'})}
					>
						<DeleteIcon />
					</Fab>
				</>
			)}
			<PatientDeletionDialog
				open={deleting}
				patient={props.patient}
				onClose={() => dispatch({type: 'not-deleting'})}
			/>
		</Paper>
	);
};

PatientPersonalInformation.propTypes = {
	loading: PropTypes.bool,
	patient: PropTypes.object.isRequired
};

export default PatientPersonalInformation;
