import { Meteor } from 'meteor/meteor' ;
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react' ;
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom'

import { withStyles } from 'material-ui/styles';

import { format } from 'date-fns' ;
import addDays from 'date-fns/add_days' ;
import subDays from 'date-fns/sub_days' ;
import addHours from 'date-fns/add_hours' ;
import isBefore from 'date-fns/is_before' ;

import { sum } from '@aureooms/js-itertools' ;

import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import NavigateBeforeIcon from 'material-ui-icons/NavigateBefore';
import NavigateNextIcon from 'material-ui-icons/NavigateNext';

import { Consultations } from '../api/consultations.js';

import ConsultationCard from './ConsultationCard.js';

const styles = theme => ({
	container: {
		padding: theme.spacing.unit * 3,
	},
	fabprev: {
		position: 'fixed',
		bottom: theme.spacing.unit * 3,
		right: theme.spacing.unit * 12,
	},
	fabnext: {
		position: 'fixed',
		bottom: theme.spacing.unit * 3,
		right: theme.spacing.unit * 3,
	},
});

class ConsultationsList extends React.Component {

	constructor ( props ) {
		super(props);
	}

	render ( ) {

		const { classes, day, consultations } = this.props ;

		const dayBefore = format( subDays(day, 1), 'YYYY-MM-DD' ) ;
		const dayAfter = format( addDays(day, 1), 'YYYY-MM-DD' ) ;

		const pause = addHours(day, 15);
		const am = sum(consultations.map(c => isBefore(c.datetime, pause)));
		const pm = sum(consultations.map(c => 1)) - am;

		return (
			<div>
				<Typography variant="display3">{`${format(day, 'dddd Do MMMM YYYY')} (AM: ${am}, PM: ${pm})`}</Typography>
				<div className={classes.container}>
					{ consultations.map(consultation => ( <ConsultationCard key={consultation._id} consultation={consultation}/> )) }
				</div>
				<Button variant="fab" className={classes.fabprev} color="primary" component={Link} to={`/calendar/${dayBefore}`}>
					<NavigateBeforeIcon/>
				</Button>
				<Button variant="fab" className={classes.fabnext} color="primary" component={Link} to={`/calendar/${dayAfter}`}>
					<NavigateNextIcon/>
				</Button>
			</div>
		);
	}

}

ConsultationsList.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
	day: PropTypes.object.isRequired,
};

export default withTracker(({ day }) => {
	const nextDay = addDays(day, 1);
	Meteor.subscribe('consultations');
	return {
		day,
		consultations: Consultations.find({ datetime : { $gte : day , $lt : nextDay } }, {sort: {datetime: -1}}).fetch() ,
	} ;
}) ( withStyles(styles, { withTheme: true })(ConsultationsList) );
