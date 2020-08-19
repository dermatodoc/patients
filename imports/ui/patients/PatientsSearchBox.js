import React from 'react' ;
import PropTypes from 'prop-types';

import { useHistory } from 'react-router-dom' ;
import Downshift from 'downshift';

import { patients } from '../../api/patients.js';
const patientFilter = patients.filter;

import SearchBox from '../input/SearchBox.js';

const reduceState = (state, changes) => {
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return {
	...changes,
	inputValue: '',
      };
    default:
      return changes;
  }
};

export default function PatientsSearchBox ( { patients } ) {

  const history = useHistory();

  const handleChange = (selectedItem, downshiftState) => {
    if ( selectedItem ) {
      history.push(`/patient/${selectedItem._id}`);
    }
  };

  const suggestions = patients.map(
    patient => ({
      label : `${patient.lastname} ${patient.firstname}` ,
      _id : patient._id ,
    })
  ) ;

  return (
    <SearchBox
      filter={patientFilter}
      suggestions={suggestions}
      itemToString={item => item ? item.label : ''}
      onChange={handleChange}
      stateReducer={reduceState}
      placeholder="Search a patient…"
    />
  );
}

PatientsSearchBox.propTypes = {
  patients: PropTypes.array.isRequired,
};
