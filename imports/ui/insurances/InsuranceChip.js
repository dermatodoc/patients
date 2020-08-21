import React from 'react';

import {Link} from 'react-router-dom';

import Chip from '@material-ui/core/Chip';

import {myEncodeURIComponent} from '../../client/uri.js';

const InsuranceChip = ({item, ...rest}) => {
	let style;
	let component;
	let to;

	if (item) {
		if (!rest.onDelete) {
			component = Link;
			to = `/insurance/${myEncodeURIComponent(item.name)}`;
			style = {cursor: 'pointer'};
		}
	}

	return <Chip {...rest} style={style} component={component} to={to} />;
};

export default ({label, ...rest}) => (
	<InsuranceChip item={{name: label}} label={label} {...rest} />
);