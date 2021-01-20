import React from 'react';
import PropTypes from 'prop-types';

import {withStyles} from '@material-ui/core/styles';

import format from 'date-fns/format';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import PhotoIcon from '@material-ui/icons/Photo';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import AttachmentIcon from '@material-ui/icons/Attachment';
import DeleteIcon from '@material-ui/icons/Delete';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/Edit';

import AttachmentThumbnail from './AttachmentThumbnail.js';
import AttachmentEditionDialog from './AttachmentEditionDialog.js';
import AttachmentDeletionDialog from './AttachmentDeletionDialog.js';
import AttachmentSuperDeletionDialog from './AttachmentSuperDeletionDialog.js';

import {Uploads} from '../../api/uploads.js';

const styles = (theme) => ({
	card: {
		display: 'block',
		margin: theme.spacing(1)
	},
	headerContent: {
		overflow: 'hidden'
	},
	headerContentTitle: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	headerContentSubheader: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	thumbnail: {
		height: 300
	}
});

const link = (attachment) =>
	`/${Uploads.link(attachment).split('/').slice(3).join('/')}`;

class AttachmentCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: null,
			editing: false,
			deleting: false,
			superDeleting: false
		};
	}

	openMenu = (event) => {
		this.setState({menu: event.currentTarget});
		event.preventDefault();
	};

	closeMenu = (event) => {
		this.setState({menu: null});
		event.preventDefault();
	};

	openEditDialog = (event) => {
		this.setState({menu: null, editing: true});
		event.preventDefault();
	};

	openDeletionDialog = (event) => {
		this.setState({menu: null, deleting: true});
		event.preventDefault();
	};

	openSuperDeletionDialog = (event) => {
		this.setState({menu: null, superDeleting: true});
		event.preventDefault();
	};

	render() {
		const {classes, attachment, info} = this.props;

		const {menu, editing, deleting, superDeleting} = this.state;

		const headerClasses = {
			content: classes.headerContent,
			title: classes.headerContentTitle,
			subheader: classes.headerContentSubheader
		};

		const detached =
			!attachment?.meta?.attachedToPatients?.length &&
			!attachment?.meta?.attachedToConsultations?.length;

		return (
			<Card
				className={classes.card}
				component="a"
				href={link(attachment)}
				rel="noreferrer"
				target="_blank"
			>
				<CardHeader
					classes={headerClasses}
					avatar={
						<Avatar>
							{attachment.isImage ? (
								<PhotoIcon />
							) : attachment.isPDF ? (
								<PictureAsPdfIcon />
							) : (
								<AttachmentIcon />
							)}
						</Avatar>
					}
					title={attachment.name}
					subheader={`Added on ${format(
						attachment.meta.createdAt,
						'yyyy-MM-dd'
					)}`}
					action={
						<div>
							<IconButton
								aria-owns={menu ? 'simple-menu' : null}
								aria-haspopup="true"
								onClick={this.openMenu}
							>
								<MoreVertIcon />
							</IconButton>
							<Menu
								id="simple-menu"
								anchorEl={menu}
								open={Boolean(menu)}
								onClose={this.closeMenu}
							>
								<MenuItem onClick={this.openEditDialog}>
									<ListItemIcon>
										<EditIcon />
									</ListItemIcon>
									<ListItemText>Rename</ListItemText>
								</MenuItem>
								{info && (
									<MenuItem onClick={this.openDeletionDialog}>
										<ListItemIcon>
											<DeleteIcon />
										</ListItemIcon>
										<ListItemText>Delete</ListItemText>
									</MenuItem>
								)}
								{detached && (
									<MenuItem onClick={this.openSuperDeletionDialog}>
										<ListItemIcon>
											<DeleteForeverIcon />
										</ListItemIcon>
										<ListItemText>Delete forever</ListItemText>
									</MenuItem>
								)}
							</Menu>
							<AttachmentEditionDialog
								open={editing}
								attachment={attachment}
								onClose={() => this.setState({editing: false})}
							/>
							{info && (
								<AttachmentDeletionDialog
									open={deleting}
									detach={`${info.parentCollection}.detach`}
									itemId={info.parentId}
									attachment={attachment}
									onClose={() => this.setState({deleting: false})}
								/>
							)}
							{detached && (
								<AttachmentSuperDeletionDialog
									open={superDeleting}
									attachment={attachment}
									onClose={() => this.setState({superDeleting: false})}
								/>
							)}
						</div>
					}
				/>
				<AttachmentThumbnail
					className={classes.thumbnail}
					height="600"
					attachmentId={attachment._id}
				/>
			</Card>
		);
	}
}

AttachmentCard.propTypes = {
	classes: PropTypes.object.isRequired,
	attachment: PropTypes.object.isRequired,
	info: PropTypes.object
};

export default withStyles(styles, {withTheme: true})(AttachmentCard);
