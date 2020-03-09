import { Meteor } from 'meteor/meteor' ;
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react' ;

import { makeStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom' ;

import Chip from '@material-ui/core/Chip';

import color from 'color' ;

import { Allergies , allergies } from '../../api/allergies.js' ;

import { myEncodeURIComponent } from '../../client/uri.js';

const useStyles = makeStyles(
	theme => ({
		chip: {
			transition: theme.transitions.create(['bacgroundColor', 'color'], {
			  easing: theme.transitions.easing.sharp,
			  duration: theme.transitions.duration.leavingScreen,
			}),
		}
	})
) ;

function AllergyChip ( props ) {

	const classes = useStyles();

	const { item , ...rest } = props ;

	let style = undefined;
	let component = undefined;
	let to = undefined;

	if ( item ) {
		if (item.color) {
			style = {
				backgroundColor: item.color,
				color: color(item.color).isLight() ? '#111' : '#ddd',
			} ;
		}
		if (!rest.onDelete) {
			component = Link;
			to = `/allergy/${myEncodeURIComponent(item.name)}`;
		}
	}

	return (
		<Chip
			className={classes.chip}
			{...rest}
			style={style}
			component={component}
			to={to}
		/>
	);

}


export default withTracker(({label}) => {
	const handle = Meteor.subscribe(allergies.options.singlePublication, label);
	if ( handle.ready() ) {
		const item = Allergies.findOne({name: label});
		return { item } ;
	}
	else return { } ;
}) ( AllergyChip ) ;
