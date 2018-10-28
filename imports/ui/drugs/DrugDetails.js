import { Meteor } from 'meteor/meteor' ;
import { withTracker } from 'meteor/react-meteor-data' ;

import React from 'react' ;
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Drugs } from '../../api/drugs.js';

const styles = theme => ({
	container: {
		padding: theme.spacing.unit * 3,
	},
});

class DrugDetails extends React.Component {

	constructor ( props ) {
		super(props);
		this.state = {
			drug: props.drug,
		};
	}

	componentWillReceiveProps ( nextProps ) {
		this.setState({ drug: nextProps.drug });
	}


	render ( ) {

		const { classes, theme, loading } = this.props ;
		const { drug } = this.state;

		if (loading) return <div>Loading...</div>;
		if (!drug) return <div>Error: Drug not found.</div>;

		return (
			<div>
				<div className={classes.container}>
					<pre>{JSON.stringify(drug, null, 4)}</pre>
				</div>
			</div>
		);
	}

}

DrugDetails.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
};

export default withTracker(({match}) => {
	const _id = match.params.id;
	const handle = Meteor.subscribe('drug', _id);
	if ( handle.ready() ) {
		const drug = Drugs.findOne(_id);
		return { loading: false, drug } ;
	}
	else return { loading: true } ;
}) ( withStyles(styles, { withTheme: true })(DrugDetails) );