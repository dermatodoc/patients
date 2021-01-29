import React, {useState} from 'react';
import PropTypes from 'prop-types';

import DocumentDeletionDialog from '../DocumentDeletionDialog.js';

const DocumentDownloadGenericButton = ({
	document,
	children,
	component: Component,
	...rest
}) => {
	const [deleting, setDeleting] = useState(false);

	if (document.deleted) return null;

	return (
		<>
			<Component color="secondary" onClick={() => setDeleting(true)} {...rest}>
				{children}
			</Component>
			<DocumentDeletionDialog
				open={deleting}
				document={document}
				onClose={() => setDeleting(false)}
			/>
		</>
	);
};

DocumentDownloadGenericButton.propTypes = {
	document: PropTypes.object.isRequired,
	component: PropTypes.elementType.isRequired
};

export default DocumentDownloadGenericButton;
