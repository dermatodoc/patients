import React from 'react';

import {scaleOrdinal} from '@visx/scale';

import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import purple from '@material-ui/core/colors/purple';
import grey from '@material-ui/core/colors/grey';

import StackedBarChart from './StackedBarChart';

import useAgeStats from './useAgeStats';

const Chart = (props) => {
	const {loading, count} = useAgeStats();

	const data = loading
		? []
		: Object.entries(count)
				.map(([key, value]) => ({
					key,
					female: 0,
					male: 0,
					other: 0,
					none: 0,
					...value
				}))
				.sort((a, b) => {
					const _a = Number.parseInt(a.key, 10);
					const _b = Number.parseInt(b.key, 10);
					if (Number.isNaN(_a)) return Number.isNaN(_b) ? 0 : 1;
					if (Number.isNaN(_b)) return -1;
					return _a < _b ? -1 : _a > _b ? 1 : 0;
				});

	const color = scaleOrdinal({
		domain: ['female', 'male', 'other', 'none'],
		range: [pink[500], blue[500], purple[500], grey[500]]
	});

	return <StackedBarChart {...props} data={data} color={color} />;
};

export default Chart;
