import React from 'react';

import {Link} from 'react-router-dom';

import {makeStyles} from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';

import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';

import eidFormatBirthdate from '../../client/eidFormatBirthdate.js';

const useStyles = makeStyles((theme) => ({
	card: {
		display: 'flex',
		minHeight: 200
	},
	details: {
		display: 'flex',
		flex: 1,
		flexDirection: 'column'
	},
	header: {
		flex: '1 0 auto'
	},
	content: {
		flex: '1 0 auto'
	},
	photoPlaceHolder: {
		display: 'flex',
		fontSize: '4rem',
		margin: 0,
		width: 140,
		height: 200,
		alignItems: 'center',
		justifyContent: 'center',
		color: '#fff',
		backgroundColor: '#999'
	},
	photo: {
		width: 140,
		height: 200
	},
	actions: {
		display: 'flex',
		paddingLeft: theme.spacing(2)
	},
	male: {
		color: '#fff',
		backgroundColor: blue[500]
	},
	female: {
		color: '#fff',
		backgroundColor: pink[500]
	},
	name: {
		display: 'flex'
	}
}));

export default function StaticPatientCard({patient}) {
	const classes = useStyles();

	const {_id, birthdate, photo, niss} = patient;

	const firstname = patient.firstname || '?';
	const lastname = patient.lastname || '?';
	const sex = patient.sex || 'N';

	return (
		<Grid item sm={12} md={12} lg={6} xl={4}>
			<Card className={classes.card} component={Link} to={`/patient/${_id}`}>
				<div className={classes.details}>
					<CardHeader
						className={classes.header}
						avatar={
							<Avatar className={classes[sex]}>
								{sex.slice(0, 1).toUpperCase()}
							</Avatar>
						}
						title={`${lastname.toUpperCase()} ${firstname}`}
						subheader={eidFormatBirthdate(birthdate)}
					/>
					<CardContent className={classes.content} />
					<CardActions disableSpacing className={classes.actions}>
						<Chip label={niss || '?'} />
					</CardActions>
				</div>
				{photo ? (
					<CardMedia
						className={classes.photo}
						image={`data:image/png;base64,${photo}`}
						title={`${firstname} ${lastname}`}
					/>
				) : (
					<div className={classes.photoPlaceHolder}>
						{firstname[0]}
						{lastname[0]}
					</div>
				)}
			</Card>
		</Grid>
	);
}

StaticPatientCard.projection = {
	firstname: 1,
	lastname: 1,
	birthdate: 1,
	sex: 1,
	niss: 1,
	photo: 1
};
