import React from 'react';

import {list, range} from '@aureooms/js-itertools';

import SelectOneSetting from './SelectOneSetting.js';

const WeekStartsOnSetting = () => {
	const options = list(range(7));

	const DAYS = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];

	const optionToString = (x) => DAYS[x];

	return (
		<SelectOneSetting
			title="First day of the week"
			label="WeekStartsOn"
			setting="week-starts-on"
			options={options}
			optionToString={optionToString}
			defaultValue={1}
		/>
	);
};

export default WeekStartsOnSetting;
