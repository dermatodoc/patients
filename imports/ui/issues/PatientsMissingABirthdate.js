import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react';

import Grid from '@material-ui/core/Grid';

import StaticPatientCard from '../patients/StaticPatientCard.js';

import { Patients } from '../../api/patients.js';

const PatientsMissingABirthdate = ( { loading, patients, ...rest }) => {

	if (loading) return <div {...rest}>Loading...</div>;

	if (patients.length === 0) return <div {...rest}>All patients have a birthdate :)</div>;

	return (
	<Grid container spacing={3} {...rest}>
		{ patients.map(patient => ( <StaticPatientCard key={patient._id} patient={patient}/> )) }
	</Grid>
	);

}

export default withTracker(() => {
	const query = {
		$or: [
			{ birthdate : null } ,
			{ birthdate : '' } ,
		] ,
	} ;
	const handle = Meteor.subscribe('patients', query);
	if ( !handle.ready()) return { loading: true } ;
	return {
		loading: false,
		patients: Patients.find(query).fetch(),
	} ;
}) (PatientsMissingABirthdate) ;
