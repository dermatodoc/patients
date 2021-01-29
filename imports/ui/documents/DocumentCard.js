import React from 'react';
import PropTypes from 'prop-types';

import {withStyles} from '@material-ui/core/styles';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionActions from '@material-ui/core/AccordionActions';

import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import TableChartIcon from '@material-ui/icons/TableChart';
import SubjectIcon from '@material-ui/icons/Subject';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import DocumentChips from './DocumentChips.js';
import DocumentVersionsButton from './actions/DocumentVersionsButton.js';

import DocumentSuperDeletionDialog from './DocumentSuperDeletionDialog.js';
import DocumentRestorationDialog from './DocumentRestorationDialog.js';
import DocumentLinkingDialog from './DocumentLinkingDialog.js';
import DocumentUnlinkingDialog from './DocumentUnlinkingDialog.js';
import HealthOneLabResultsTable from './HealthOneLabResultsTable.js';
import HealthOneReportContents from './HealthOneReportContents.js';
import DocumentSource from './DocumentSource.js';

import DocumentDownloadButton from './actions/DocumentDownloadButton.js';
import DocumentDeletionButton from './actions/DocumentDeletionButton.js';

const styles = () => ({
	chips: {
		display: 'flex',
		justifyContent: 'center',
		flexWrap: 'wrap'
	},
	list: {
		width: '100%'
	}
});

class DocumentCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			linking: false,
			unlinking: false,
			restoring: false,
			superdeleting: false
		};
	}

	render() {
		const {
			PatientChip,
			VersionsChip,
			VersionsButton,
			defaultExpanded,
			classes,
			document: {patientId, parsed, format, kind, deleted}
		} = this.props;

		const {document} = this.props;

		const {linking, unlinking, restoring, superdeleting} = this.state;

		return (
			<Accordion
				defaultExpanded={defaultExpanded}
				TransitionProps={{unmountOnExit: true}}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<div className={classes.chips}>
						<DocumentChips
							document={document}
							VersionsChip={VersionsChip}
							PatientChip={PatientChip}
						/>
					</div>
				</AccordionSummary>
				<AccordionDetails>
					<List className={classes.list}>
						{parsed && format === 'healthone' && kind === 'lab' && (
							<ListItem>
								<ListItemAvatar>
									<Avatar>
										<TableChartIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									disableTypography
									primary={<Typography variant="subtitle1">Results</Typography>}
									secondary={<HealthOneLabResultsTable document={document} />}
								/>
							</ListItem>
						)}
						{parsed && format === 'healthone' && kind === 'report' && (
							<ListItem>
								<ListItemAvatar>
									<Avatar>
										<SubjectIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									disableTypography
									primary={
										<Typography variant="subtitle1">Contents</Typography>
									}
									secondary={<HealthOneReportContents document={document} />}
								/>
							</ListItem>
						)}
						{(!parsed || format !== 'healthone') && (
							<ListItem>
								<ListItemAvatar>
									<Avatar>
										<FileCopyIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									disableTypography
									primary={<Typography variant="subtitle1">Source</Typography>}
									secondary={<DocumentSource document={document} />}
								/>
							</ListItem>
						)}
					</List>
				</AccordionDetails>
				<Divider />
				<AccordionActions>
					{VersionsButton && <VersionsButton document={document} />}
					<DocumentDownloadButton document={document} />
					<Button
						color="primary"
						onClick={() => this.setState({linking: true})}
					>
						Link
						<LinkIcon />
					</Button>
					{patientId && (
						<Button
							color="secondary"
							onClick={() => this.setState({unlinking: true})}
						>
							Unlink
							<LinkOffIcon />
						</Button>
					)}
					{deleted && (
						<Button
							color="primary"
							onClick={() => this.setState({restoring: true})}
						>
							Restore
							<RestoreFromTrashIcon />
						</Button>
					)}
					{deleted && (
						<Button
							color="secondary"
							onClick={() => this.setState({superdeleting: true})}
						>
							Delete forever
							<DeleteForeverIcon />
						</Button>
					)}
					<DocumentDeletionButton document={document} />
					<DocumentLinkingDialog
						open={linking}
						document={document}
						existingLink={{_id: patientId}}
						onClose={() => this.setState({linking: false})}
					/>
					<DocumentUnlinkingDialog
						open={unlinking}
						document={document}
						onClose={() => this.setState({unlinking: false})}
					/>
					<DocumentRestorationDialog
						open={restoring}
						document={document}
						onClose={() => this.setState({restoring: false})}
					/>
					<DocumentSuperDeletionDialog
						open={superdeleting}
						document={document}
						onClose={() => this.setState({superdeleting: false})}
					/>
				</AccordionActions>
			</Accordion>
		);
	}
}

DocumentCard.defaultProps = {
	PatientChip: DocumentChips.defaultProps.PatientChip,
	VersionsChip: DocumentChips.defaultProps.VersionsChip,
	VersionsButton: DocumentVersionsButton,
	defaultExpanded: false
};

DocumentCard.propTypes = {
	classes: PropTypes.object.isRequired,
	document: PropTypes.object.isRequired,
	PatientChip: PropTypes.elementType,
	VersionsChip: PropTypes.elementType,
	VersionsButton: PropTypes.elementType,
	defaultExpanded: PropTypes.bool
};

export default withStyles(styles, {withTheme: true})(DocumentCard);
