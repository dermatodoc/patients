import React from 'react';

import Button from '@material-ui/core/Button';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import DocumentDownloadGenericButton from './DocumentDownloadGenericButton.js';

const DocumentDownloadButton = (props) => (
	<DocumentDownloadGenericButton component={Button} {...props}>
		Download
		<CloudDownloadIcon />
	</DocumentDownloadGenericButton>
);

export default DocumentDownloadButton;
