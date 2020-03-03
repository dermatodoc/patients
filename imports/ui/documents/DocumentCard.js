import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import {withStyles} from '@material-ui/core/styles';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import BusinessIcon from '@material-ui/icons/Business';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import LinkIcon from '@material-ui/icons/Link';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import BugReportIcon from '@material-ui/icons/BugReport';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import TableChartIcon from '@material-ui/icons/TableChart';
import SubjectIcon from '@material-ui/icons/Subject';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DoneIcon from '@material-ui/icons/Done';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

import dateformat from 'date-fns/format';

import { saveAs } from 'file-saver';

import { Patients } from '../../api/patients.js';

import DocumentDeletionDialog from './DocumentDeletionDialog.js';
import DocumentLinkingDialog from './DocumentLinkingDialog.js';
import DocumentUnlinkingDialog from './DocumentUnlinkingDialog.js';
import HealthOneLabResultsTable from './HealthOneLabResultsTable.js';
import HealthOneReportContents from './HealthOneReportContents.js';

const styles = theme => ({
	heading: {
		fontSize: theme.typography.pxToRem(15),
		fontWeight: theme.typography.fontWeightRegular
	},
	chips: {
		display: 'flex',
		justifyContent: 'center',
		flexWrap: 'wrap',
	},
	chip: {
		marginRight: theme.spacing.unit,
	},
	linksep: {
		marginRight: theme.spacing.unit,
	},
	link: {
		fontWeight: 'bold',
	},
	patientchip: {
		marginRight: theme.spacing.unit,
		backgroundColor: '#88f',
		color: '#fff',
		fontWeight: 'bold',
	},
	unlinkedpatientchip: {
		marginRight: theme.spacing.unit,
		backgroundColor: '#f88',
		color: '#fff',
		fontWeight: 'bold',
	},
	linkoffchip: {
		marginRight: theme.spacing.unit,
		backgroundColor: '#f88',
		color: '#fff',
	},
	anomalieschip: {
		marginRight: theme.spacing.unit,
		backgroundColor: '#fa8',
		color: '#fff',
		fontWeight: 'bold',
	},
	partialchip: {
		marginRight: theme.spacing.unit,
		backgroundColor: '#fa8',
		color: '#fff',
		fontWeight: 'bold',
	},
	completechip: {
		marginRight: theme.spacing.unit,
		backgroundColor: '#8fa',
		color: '#fff',
		fontWeight: 'bold',
	},
	pre: {
		padding: theme.spacing.unit * 3,
		overflowX: 'auto',
	},
	list: {
		maxWidth: '100%',
	},
});

class DocumentCard extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			linking: false,
			unlinking: false,
			deleting: false,
		};
	}

	download = event => {

		const { document } = this.props ;

		const blob = new Blob(
			[document.decoded || document.source],
			{type: "text/plain;charset=utf-8"}
		) ;

		const extensions = {
			'healthone': 'HLT' ,
			//'medar' : 'MDR' ,
			//'medidoc' : 'MDD' ,
		} ;

		const ext = extensions[document.format] || 'UNK' ;

		const name = document.parsed ?
			`${document.identifier}-${document.reference}-${document.status}`
			:
			`${document._id}` ;

		const filename = `${name}.${ext}`;

		saveAs(blob, filename);

	}

	render() {
		const {
			defaultExpanded,
			classes,
			loadingPatient,
			patient,
			document: {
				_id,
				createdAt,
				patientId,
				source,
				encoding,
				decoded,
				parsed,
				format,
				kind,
				identifier,
				reference,
				status,
				datetime,
				patient: subject,
				anomalies,
			},
		} = this.props;

		const { document } = this.props;

		const {
			linking,
			unlinking,
			deleting,
		} = this.state;

		return (
			<ExpansionPanel defaultExpanded={defaultExpanded}>
				<ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
					<div className={classes.chips}>
						{ parsed ?
							<Chip
								label={dateformat(datetime,'dddd Do MMMM YYYY')}
								className={classes.chip}
							/>
							:
							<Chip
								label={dateformat(createdAt,'dddd Do MMMM YYYY')}
								className={classes.chip}
							/>
						}
						{ parsed &&
							<Chip
								avatar={<Avatar><BusinessIcon/></Avatar>}
								label={identifier}
								className={classes.chip}
							/>
						}
						{ parsed &&
							<Chip
								avatar={<Avatar><ConfirmationNumberIcon/></Avatar>}
								label={reference}
								className={classes.chip}
							/>
						}
						{ parsed ? null :
							<Chip
								avatar={<Avatar><BugReportIcon/></Avatar>}
								label="parsing error"
								className={classes.chip}
							/>
						}
						{ patientId &&
							<Chip
								avatar={(!loadingPatient && patient && patient.photo) ?
									<Avatar src={`data:image/png;base64,${patient.photo}`}/>
									:
									null
								}
								label={loadingPatient ? patientId : !patient ? 'Not found' : `${patient.lastname} ${patient.firstname}`}
								className={classes.patientchip}
								component={Link}
								to={`/patient/${patientId}`}
							/>
						}
						{ (!patientId && parsed) &&
							<Chip
								avatar={<Avatar><LinkOffIcon/></Avatar>}
								label={`${subject.lastname} ${subject.firstname}`}
								className={classes.unlinkedpatientchip}
								onClick={e => {
									e.stopPropagation();
									this.setState({linking: true});
								}}
							/>
						}
						{ (!patientId && !parsed) &&
							<Chip
								avatar={<Avatar><LinkOffIcon/></Avatar>}
								label="not linked"
								className={classes.linkoffchip}
								onClick={e => {
									e.stopPropagation();
									this.setState({linking: true});
								}}
							/>
						}
						{ (parsed && kind === 'lab' && anomalies) ?
							<Chip
								avatar={<Avatar><ErrorIcon/></Avatar>}
								label={anomalies}
								className={classes.anomalieschip}
							/>
							:
							null
						}
						{ (parsed && status && status === 'partial' ) ?
							<Chip
								avatar={<Avatar><HourglassEmptyIcon/></Avatar>}
								label={status}
								className={classes.partialchip}
							/>
							:
							null
						}
						{ (parsed && status && status === 'complete' ) ?
							<Chip
								avatar={<Avatar><DoneIcon/></Avatar>}
								label={status}
								className={classes.completechip}
							/>
							:
							null
						}
					</div>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
				  <List className={classes.list}>
					{ (parsed && format === 'healthone' && kind === 'lab') &&
						<ListItem>
							<Avatar><TableChartIcon/></Avatar>
							<ListItemText
								disableTypography={true}
								primary={<Typography variant="subtitle1">Results</Typography>}
								secondary={<HealthOneLabResultsTable document={document}/>}
							/>
						</ListItem>
					}
					{ (parsed && format === 'healthone' && kind === 'report') &&
						<ListItem>
							<Avatar><SubjectIcon/></Avatar>
							<ListItemText
								disableTypography={true}
								primary={<Typography variant="subtitle1">Contents</Typography>}
								secondary={<HealthOneReportContents document={document}/>}
							/>
						</ListItem>
					}
					{ (!parsed || format !== 'healthone') &&
						<ListItem>
							<Avatar><FileCopyIcon/></Avatar>
							<ListItemText
								disableTypography={true}
								primary={<Typography variant="subtitle1">Source</Typography>}
								secondary={
									<Paper>
										<pre className={classes.pre}>
											{decoded || source}
										</pre>
									</Paper>
								}
							/>
						</ListItem>
					}
				  </List>
				</ExpansionPanelDetails>
				<Divider/>
				<ExpansionPanelActions>
					<Button color="primary" onClick={this.download}>
						Download<CloudDownloadIcon/>
					</Button>
					<Button color="primary" onClick={e => this.setState({linking: true})}>
						Link<LinkIcon/>
					</Button>
					{ patientId &&
						<Button color="secondary" onClick={e => this.setState({unlinking: true})}>
							Unlink<LinkOffIcon/>
						</Button>
					}
					<Button color="secondary" onClick={e => this.setState({deleting: true})}>
						Delete<DeleteIcon/>
					</Button>
					<DocumentLinkingDialog
						open={linking}
						onClose={e => this.setState({linking: false})}
						document={document}
						existingLink={patient}
					/>
					<DocumentUnlinkingDialog
						open={unlinking}
						onClose={e => this.setState({unlinking: false})}
						document={document}
					/>
					<DocumentDeletionDialog
						open={deleting}
						onClose={e => this.setState({deleting: false})}
						document={document}
					/>
				</ExpansionPanelActions>
			</ExpansionPanel>
		);
	}
}

DocumentCard.propTypes = {
	classes: PropTypes.object.isRequired,
	document: PropTypes.object.isRequired
};

export default withTracker(({document}) => {
	const _id = document.patientId;
	if (!_id) return {loadingPatient: false};
	const handle = Meteor.subscribe('patient', _id);
	if (handle.ready()) {
		const patient = Patients.findOne(_id);
		return {loadingPatient: false, patient};
	}
	return {loadingPatient: true};
})(withStyles(styles, {withTheme: true})(DocumentCard));
