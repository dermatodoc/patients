import React from 'react';
import PropTypes from 'prop-types';

import downloadDocument from './downloadDocument.js';

const DocumentDownloadGenericButton = ({
	document,
	children,
	component: Component,
	...rest
}) => {
	const onClick = () => downloadDocument(document);

	return (
		<Component color="primary" onClick={onClick} {...rest}>
			{children}
		</Component>
	);
};

DocumentDownloadGenericButton.propTypes = {
	document: PropTypes.object.isRequired,
	component: PropTypes.elementType.isRequired
};

export default DocumentDownloadGenericButton;
