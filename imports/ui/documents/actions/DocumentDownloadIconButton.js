import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import DocumentDownloadGenericButton from './DocumentDownloadGenericButton.js';

const DocumentDownloadIconButton = (props) => (
	<DocumentDownloadGenericButton component={IconButton} {...props}>
		<CloudDownloadIcon />
	</DocumentDownloadGenericButton>
);

export default DocumentDownloadIconButton;
