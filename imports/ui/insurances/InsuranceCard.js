import React from 'react' ;
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import red from '@material-ui/core/colors/red';

import TagCard from '../tags/TagCard.js';

import PatientChip from '../patients/PatientChip.js';
import InsuranceDeletionDialog from './InsuranceDeletionDialog.js';
import InsuranceRenamingDialog from './InsuranceRenamingDialog.js';

import { Patients } from '../../api/patients.js';

const styles = theme => ({
	avatar: {
		color: '#fff',
		backgroundColor: red[500],
	},
});

const NITEMS = 1;

function InsuranceCard ( { classes , item } ) {

	return (
		<TagCard
			tag={item}
			collection={Patients}
			subscription="patients-of-insurance"
			selector={{insurance: item.name}}
			root="/insurance"
			subheader={patients => `soigne ${patients.length} patients`}
			content={patients => (
				<div>
					{patients.slice(0,NITEMS).map(patient => <PatientChip key={patient._id} patient={patient}/>)}
					{patients.length > NITEMS && `et ${patients.length - NITEMS} autres`}
				</div>
			)}
			avatar={<Avatar className={classes.avatar}>In</Avatar>}
			DeletionDialog={InsuranceDeletionDialog}
			RenamingDialog={InsuranceRenamingDialog}
		/>
	) ;

}

InsuranceCard.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,

	item: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true})(InsuranceCard) ;