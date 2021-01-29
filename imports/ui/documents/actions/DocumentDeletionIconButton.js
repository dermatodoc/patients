import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import DocumentDeletionGenericButton from './DocumentDeletionGenericButton.js';

const DocumentDeletionIconButton = (props) => (
	<DocumentDeletionGenericButton component={IconButton} {...props}>
		<DeleteIcon />
	</DocumentDeletionGenericButton>
);

export default DocumentDeletionIconButton;
