import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import Button from '@material-ui/core/Button';

import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';

import withDocumentVersions from '../withDocumentVersions.js';
import {myEncodeURIComponent} from '../../../client/uri.js';

const DocumentVersionsButton = ({
	document: {identifier, reference},
	loading,
	versions,
	...rest
}) => {
	if (loading || versions.length <= 1) return null;

	return (
		<Button
			color="primary"
			component={Link}
			to={`/document/versions/${myEncodeURIComponent(
				identifier
			)}/${myEncodeURIComponent(reference)}`}
			{...rest}
		>
			{versions.length} versions
			<DynamicFeedIcon />
		</Button>
	);
};

DocumentVersionsButton.propTypes = {
	loading: PropTypes.bool.isRequired,
	versions: PropTypes.array.isRequired
};

const Component = withDocumentVersions(DocumentVersionsButton);

Component.propTypes = {
	...withDocumentVersions.propTypes
};

export default Component;
