import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import SetPicker from '../input/SetPicker';

import {useSetting} from '../../client/settings';

import PropsOf from '../../util/PropsOf';

interface BaseProps {
	className?: string;
	setting: string;
	makeSuggestions: (
		value: any[]
	) => (x: string) => {loading?: boolean; results: any[]};
	title: string;
	label?: string;
	placeholder?: string;
	itemToString?: (x: any) => any;
}

type Props = BaseProps &
	Omit<
		PropsOf<typeof SetPicker>,
		'onChange' | 'value' | 'useSuggestions' | 'itemToKey' | 'itemToString'
	>;

const InputManySetting = (props: Props) => {
	const {
		className,
		setting,
		makeSuggestions,
		title,
		label,
		placeholder,
		...rest
	} = props;

	const {loading, value, setValue} = useSetting(setting);

	const onChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
	};

	return (
		<div className={className}>
			<Typography variant="h4">{title}</Typography>
			<SetPicker
				readOnly={loading}
				useSuggestions={makeSuggestions(value)}
				itemToKey={(x) => x}
				itemToString={(x) => x}
				createNewItem={(x) => x}
				TextFieldProps={{
					label,
					margin: 'normal'
				}}
				value={value}
				placeholder={loading ? 'loading...' : placeholder}
				onChange={onChange}
				{...rest}
			/>
		</div>
	);
};

InputManySetting.defaultProps = {
	makeSuggestions: () => () => ({results: []}),
	label: undefined,
	placeholder: undefined
};

InputManySetting.propTypes = {
	className: PropTypes.string,
	setting: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	makeSuggestions: PropTypes.func,
	label: PropTypes.string,
	placeholder: PropTypes.string
};

export default InputManySetting;