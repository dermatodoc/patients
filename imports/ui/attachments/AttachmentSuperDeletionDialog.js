import React from 'react';
import PropTypes from 'prop-types';

import {makeStyles} from '@material-ui/core/styles';
import {useSnackbar} from 'notistack';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Button from '@material-ui/core/Button';

import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import CancelIcon from '@material-ui/icons/Cancel';

import {Uploads} from '../../api/uploads';
import {normalized} from '../../api/string';

import ConfirmationTextField, {
	useConfirmationTextFieldState
} from '../input/ConfirmationTextField';

import withLazyOpening from '../modal/withLazyOpening';
import useIsMounted from '../hooks/useIsMounted';
import AttachmentThumbnail from './AttachmentThumbnail';

const useStyles = makeStyles((theme) => ({
	rightIcon: {
		marginLeft: theme.spacing(1)
	},
	thumbnail: {
		height: 300
	}
}));

const AttachmentSuperDeletionDialog = (props) => {
	const {open, onClose, attachment} = props;

	const classes = useStyles();
	const {enqueueSnackbar, closeSnackbar} = useSnackbar();

	const getError = (expected, value) =>
		normalized(expected) === normalized(value)
			? ''
			: 'Attachment names do not match';

	const {validate, props: ConfirmationTextFieldProps} =
		useConfirmationTextFieldState(attachment.name, getError);

	const isMounted = useIsMounted();

	const trashThisAttachmentIfAttachmentNameMatches = (event) => {
		event.preventDefault();
		if (validate()) {
			const key = enqueueSnackbar('Processing...', {variant: 'info'});
			Uploads.remove({_id: attachment._id}, (err) => {
				closeSnackbar(key);
				if (err) {
					const message = `[Trash] Error during removal: ${err.message}`;
					console.error(message, {err});
					enqueueSnackbar(message, {variant: 'error'});
				} else {
					const message = '[Trash] File removed from DB and FS';
					console.log(message);
					enqueueSnackbar(message, {variant: 'success'});
					if (isMounted()) onClose();
				}
			});
		}
	};

	return (
		<Dialog
			open={open}
			// component="form"
			aria-labelledby="attachment-deletion-dialog-title"
			onClose={onClose}
		>
			<DialogTitle id="attachment-deletion-dialog-title">
				Delete attachment {attachment.name}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					If you do not want to delete this attachment, click cancel. If you
					really want to delete this attachment from the system, enter its
					filename below and click the delete button.
				</DialogContentText>
				<AttachmentThumbnail
					className={classes.thumbnail}
					height={600}
					attachmentId={attachment._id}
				/>
				<ConfirmationTextField
					fullWidth
					autoFocus
					margin="dense"
					label="Attachment's filename"
					{...ConfirmationTextFieldProps}
				/>
			</DialogContent>
			<DialogActions>
				<Button type="submit" color="default" onClick={onClose}>
					Cancel
					<CancelIcon className={classes.rightIcon} />
				</Button>
				<Button
					color="secondary"
					disabled={ConfirmationTextFieldProps.error}
					onClick={trashThisAttachmentIfAttachmentNameMatches}
				>
					Delete forever
					<DeleteForeverIcon className={classes.rightIcon} />
				</Button>
			</DialogActions>
		</Dialog>
	);
};

AttachmentSuperDeletionDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	attachment: PropTypes.object.isRequired
};

export default withLazyOpening(AttachmentSuperDeletionDialog);
