import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import React from 'react';

import {Link} from 'react-router-dom';

import Chip from '@material-ui/core/Chip';

import color from 'color';

import {Allergies, allergies} from '../../api/allergies.js';

import {myEncodeURIComponent} from '../../client/uri.js';

const AllergyChip = ({item, ...rest}) => {
	const style = {};
	let component;
	let to;

	if (item) {
		if (item.color) {
			style.backgroundColor = item.color;
			style.color = color(item.color).isLight() ? '#111' : '#ddd';
		}

		if (!rest.onDelete) {
			component = Link;
			to = `/allergy/${myEncodeURIComponent(item.name)}`;
			style.cursor = 'pointer';
		}
	}

	return <Chip {...rest} style={style} component={component} to={to} />;
};

export default withTracker(({label}) => {
	const handle = Meteor.subscribe(allergies.options.singlePublication, label);
	if (handle.ready()) {
		const item = Allergies.findOne({name: label});
		return {item};
	}

	return {};
})(AllergyChip);
