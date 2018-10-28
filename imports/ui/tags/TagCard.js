import { Meteor } from 'meteor/meteor' ;
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react' ;
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

import Button from '@material-ui/core/Button';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import green from '@material-ui/core/colors/green';

const styles = theme => ({
	card: {
		display: 'flex',
		minHeight: 200,
	},
	details: {
		display: 'flex',
		flex: 1,
		flexDirection: 'column',
	},
	header: {
		flex: '1 0 auto',
	},
	content: {
		flex: '1 0 auto',
	},
	photoPlaceHolder: {
		display: 'flex',
		fontSize: '4rem',
		margin: 0,
		width: 140,
		height: 200,
		alignItems: 'center',
		justifyContent: 'center',
		color: '#fff',
		backgroundColor: '#999',
	},
	actions: {
		display: 'flex',
		paddingLeft: theme.spacing.unit * 2,
	},
	name: {
		display: 'flex',
	},
});

class TagCard extends React.Component {

	constructor (props) {
		super(props)
		this.state = {
			deleting: false,
			renaming: false,
		};
	}

	render () {

		const {
			classes,
			tag,
			avatar,
			subheader,
			root,
			content,
			loading,
			items,
			RenamingDialog,
			DeletionDialog,
			abbr,
		} = this.props ;

		const { deleting , renaming } = this.state ;

		return (
			<Grid item sm={12} md={12} lg={6} xl={4}>
			<Card className={classes.card}>
			<div className={classes.details}>
			<CardHeader
			className={classes.header}
			avatar={avatar}
			title={tag.name}
			subheader={loading ? '...' : subheader(items)}
 			component={Link} to={`${root}/${tag.name}`}
			/>
			<CardContent className={classes.content}>
			{loading ? '...' : content(items)}
			</CardContent>
			<CardActions className={classes.actions} disableActionSpacing>
			{RenamingDialog && <Button color="primary" onClick={e => this.setState({ renaming: true})}>
				Rename<EditIcon/>
			</Button>}
			{DeletionDialog && <Button color="secondary" onClick={e => this.setState({ deleting: true})}>
				Delete<DeleteIcon/>
			</Button>}
			{ RenamingDialog && <RenamingDialog open={renaming} onClose={e => this.setState({ renaming: false})} tag={tag}/> }
			{ DeletionDialog && <DeletionDialog open={deleting} onClose={e => this.setState({ deleting: false})} tag={tag}/> }
			</CardActions>
			</div>
			<div className={classes.photoPlaceHolder}>
			{abbr || tag.name[0]}
			</div>
			</Card>
			</Grid>
		);

	}
}

TagCard.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,

	tag: PropTypes.object.isRequired,
	root: PropTypes.string.isRequired,
	avatar: PropTypes.object.isRequired,
	subheader: PropTypes.func.isRequired,
	content: PropTypes.func.isRequired,

	subscription: PropTypes.string.isRequired,
	collection: PropTypes.object.isRequired,
	selector: PropTypes.object.isRequired,

	loading: PropTypes.bool.isRequired,
	items: PropTypes.array.isRequired,
};

export default withTracker(({tag, subscription, collection, selector}) => {
	const name = tag.name;
	const handle = Meteor.subscribe(subscription, name);
	if ( handle.ready() ) {
		const items = collection.find(selector).fetch();
		return { loading: false, items } ;
	}
	else return { loading: true, items: [] } ;
}) ( withStyles(styles, { withTheme: true})(TagCard) ) ;