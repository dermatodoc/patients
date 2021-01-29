import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import {makeStyles} from '@material-ui/core/styles';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import DocumentChips from './DocumentChips.js';

import DocumentDownloadIconButton from './actions/DocumentDownloadIconButton.js';
import DocumentDeletionIconButton from './actions/DocumentDeletionIconButton.js';

const useStyles = makeStyles((theme) => ({
	item: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2)
	},
	chips: {
		// display: 'flex',
		// justifyContent: 'center',
		// flexWrap: 'wrap'
	}
}));

const DocumentListItem = (props) => {
	const classes = useStyles();

	const {document, PatientChip, VersionsChip} = props;

	const {_id} = document;

	return (
		<ListItem component={Paper} className={classes.item} variant="outlined">
			<ListItemText
				primary={
					<div className={classes.chips}>
						<DocumentChips
							document={document}
							VersionsChip={VersionsChip}
							PatientChip={PatientChip}
						/>
					</div>
				}
			/>
			<ListItemSecondaryAction>
				<DocumentDeletionIconButton document={document} />
				<DocumentDownloadIconButton document={document} />
				<IconButton
					component={Link}
					rel="noreferrer"
					target="_blank"
					to={`/document/${_id.toHexString ? _id.toHexString() : _id}`}
					aria-label="Open in New Tab"
				>
					<OpenInNewIcon />
				</IconButton>
			</ListItemSecondaryAction>
		</ListItem>
	);
};

DocumentListItem.defaultProps = {
	PatientChip: DocumentChips.defaultProps.PatientChip,
	VersionsChip: DocumentChips.defaultProps.VersionsChip
};

DocumentListItem.propTypes = {
	document: PropTypes.object.isRequired,
	PatientChip: PropTypes.elementType,
	VersionsChip: PropTypes.elementType
};

DocumentListItem.projection = {
	...DocumentChips.projection
};

export default DocumentListItem;
