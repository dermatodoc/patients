import React from 'react';
import PropTypes from 'prop-types';

import SearchBoxInternalsContainer from './SearchBoxInternalsContainer';
import SearchBoxInternalsAdornment from './SearchBoxInternalsAdornment';
import SearchBoxInternalsInput from './SearchBoxInternalsInput';
import SearchBoxInternalsSuggestions from './SearchBoxInternalsSuggestions';

export default function SearchBoxWithSuggestionsInternals(props) {
	const {
		useSuggestions,
		itemToKey,
		itemToString,
		placeholder,
		getInputProps,
		getItemProps,
		isOpen,
		inputValue,
		selectedItem,
		highlightedIndex
	} = props;

	const suggestions = useSuggestions(inputValue);

	return (
		<SearchBoxInternalsContainer>
			<SearchBoxInternalsAdornment />
			<SearchBoxInternalsInput
				inputProps={{
					placeholder,
					...getInputProps()
				}}
			/>
			{isOpen ? (
				<SearchBoxInternalsSuggestions
					{...{
						suggestions,
						itemToKey,
						itemToString,
						getItemProps,
						selectedItem,
						highlightedIndex
					}}
				/>
			) : null}
		</SearchBoxInternalsContainer>
	);
}

SearchBoxWithSuggestionsInternals.propTypes = {
	useSuggestions: PropTypes.func.isRequired,
	itemToString: PropTypes.func.isRequired,
	itemToKey: PropTypes.func.isRequired,
	getInputProps: PropTypes.func.isRequired,
	getItemProps: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	inputValue: PropTypes.string,
	highlightedIndex: PropTypes.number,
	placeholder: PropTypes.string
};