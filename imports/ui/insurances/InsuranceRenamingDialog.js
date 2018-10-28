import React from 'react';
import PropTypes from 'prop-types';

import TagRenamingDialog from '../tags/TagRenamingDialog.js';

import { Insurances } from '../../api/insurances.js';

export default function InsuranceRenamingDialog ( { open , onClose , tag } ) {

  return (
    <TagRenamingDialog
      open={open}
      onClose={onClose}
      title="insurance"
      collection={Insurances}
      subscription="insurances"
      method="insurances.rename"
      tag={tag}
    />
  ) ;

}

InsuranceRenamingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tag: PropTypes.object.isRequired,
} ;