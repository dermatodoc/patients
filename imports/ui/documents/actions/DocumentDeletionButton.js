import React from 'react';

import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';

import DocumentDeletionGenericButton from './DocumentDeletionGenericButton.js';

const DocumentDeletionButton = (props) => (
	<DocumentDeletionGenericButton component={Button} {...props}>
		Delete
		<DeleteIcon />
	</DocumentDeletionGenericButton>
);

export default DocumentDeletionButton;
