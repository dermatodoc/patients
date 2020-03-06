import React from 'react' ;
import { Switch , Route } from 'react-router-dom';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import startOfDay from 'date-fns/startOfDay';
import startOfToday from 'date-fns/startOfToday' ;
import dateParseISO from 'date-fns/parseISO';
import dateFormat from 'date-fns/format' ;

import NoContent from './navigation/NoContent.js';

import PatientsList from './patients/PatientsList.js';
import PatientRecord from './patients/PatientRecord.js';
import NewPatientForm from './patients/NewPatientForm.js';

import ConsultationsOfTheDay from './consultations/ConsultationsOfTheDay.js';
import LastDayOfConsultations from './consultations/LastDayOfConsultations.js';
import ConsultationDetails from './consultations/ConsultationDetails.js';
import EditConsultationForm from './consultations/EditConsultationForm.js';
import NewConsultationForm from './consultations/NewConsultationForm.js';
import Calendar from './consultations/Calendar.js';

import ImportData from './data/ImportData.js';

import MonthlyPlanner from './planner/MonthlyPlanner.js';
import WeeklyPlanner from './planner/WeeklyPlanner.js';

import BooksList from './books/BooksList.js';
import BookDetails from './books/BookDetails.js';

import DocumentsList from './documents/DocumentsList.js';
import DocumentDetails from './documents/DocumentDetails.js';

import WiredConsultationsList from './consultations/WiredConsultationsList.js';
import SEPAPaymentDetails from './payment/SEPAPaymentDetails.js';
import UnpaidConsultationsList from './consultations/UnpaidConsultationsList.js';
import Stats from './stats/Stats.js';
import Issues from './issues/Issues.js';
import MergePatientsForm from './merge/MergePatientsForm.js';

import DoctorsList from './doctors/DoctorsList.js';
import DoctorDetails from './doctors/DoctorDetails.js';

import InsurancesList from './insurances/InsurancesList.js';
import InsuranceDetails from './insurances/InsuranceDetails.js';

import AllergiesList from './allergies/AllergiesList.js';
import AllergyDetails from './allergies/AllergyDetails.js';

import DrugsSearch from './drugs/DrugsSearch.js';
import DrugDetails from './drugs/DrugDetails.js';

import Settings from './settings/Settings.js';

const styles = theme => ({
	main: {
		backgroundColor: theme.palette.background.default,
    	flexGrow: 1,
		//width: 'calc(100% - 240px)',
		padding: theme.spacing(3),
		height: 'calc(100% - 56px)',
		marginTop: 56,
		//marginLeft: 240,
		[theme.breakpoints.up('sm')]: {
			height: 'calc(100% - 64px)',
			marginTop: 64,
		},
	},
});

const NoMatch = ({ location }) => (
	<NoContent>
		No match for <code>{location.pathname}</code>.
	</NoContent>
);

const ConsultationsOfTheDayFromMatch = ({ match }) => (
	<ConsultationsOfTheDay day={startOfDay(dateParseISO(match.params.day))}/>
);

const CurrentMonthlyPlanner = props => {
	const today = startOfToday();
	const year = dateFormat(today, 'yyyy');
	const month = dateFormat(today, 'MM');
	const match = {
		params: {
			year,
			month,
		},
	};
	return (
		<MonthlyPlanner match={match} {...props}/>
	) ;
}

class Main extends React.Component {

	constructor(props){
		super(props);
	}

	render(){

		const { classes, patients, currentUser, history } = this.props;

		if (!currentUser) return (
			<main className={classes.main}>
				<NoContent>Please sign in</NoContent>
			</main>
		) ;

		return (
			<main className={classes.main}>
				<Switch>
					<Route exact path="/" render={
						props => ( <PatientsList patients={patients}/> )
					}/>

					<Route exact path="/patients/page/:page" render={
						( { match } ) => (
							<PatientsList patients={patients} page={parseInt(match.params.page,10)}/>
						)
					}/>

					<Route exact path="/patient/:id" component={PatientRecord}/>
					<Route exact path="/new/patient" component={NewPatientForm}/>

					<Route exact path="/documents" component={DocumentsList}/>
					<Route exact path="/documents/page/:page" component={DocumentsList}/>
					<Route exact path="/document/:id" component={DocumentDetails}/>

					<Route exact path="/calendar" component={Calendar}/>
					<Route exact path="/calendar/:day" component={ConsultationsOfTheDayFromMatch}/>
					<Route exact path="/calendar/month/:year/:month" render={
						props => <MonthlyPlanner {...props} history={history}/>
					}/>
					<Route exact path="/calendar/month/current" render={
						props => <CurrentMonthlyPlanner history={history}/>
					}/>
					<Route exact path="/calendar/week/:year/:week" render={
						props => <WeeklyPlanner {...props} history={history}/>
					}/>
					<Route exact path="/consultations" component={LastDayOfConsultations}/>
					<Route exact path="/consultation/:id" component={ConsultationDetails}/>
					<Route exact path="/edit/consultation/:id" component={EditConsultationForm}/>
					<Route exact path="/new/consultation/for/:id" component={NewConsultationForm}/>

					<Route exact path="/import" render={
						(props) => <ImportData {...props} history={history}/>
					}/>

					<Route exact path="/books" component={BooksList}/>
					<Route exact path="/books/:year" component={BooksList}/>
					<Route exact path="/books/:year/page/:page" component={BooksList}/>

					<Route exact path="/book/:year/:book" component={BookDetails}/>
					<Route exact path="/book/:year/:book/page/:page" component={BookDetails}/>

					<Route exact path="/wires" component={WiredConsultationsList}/>
					<Route exact path="/wires/:year" component={WiredConsultationsList}/>
					<Route exact path="/wires/:year/page/:page" component={WiredConsultationsList}/>

					<Route exact path="/unpaid" component={UnpaidConsultationsList}/>
					<Route exact path="/unpaid/:year" component={UnpaidConsultationsList}/>
					<Route exact path="/unpaid/:year/page/:page" component={UnpaidConsultationsList}/>

					<Route exact path="/stats" component={Stats}/>
					<Route exact path="/sepa" component={SEPAPaymentDetails}/>

					<Route exact path="/issues" component={Issues}/>
					<Route exact path="/merge" render={
						props => ( <MergePatientsForm patients={patients}/> )
					}/>

					<Route exact path="/doctors" component={DoctorsList}/>
					<Route exact path="/doctors/page/:page" component={DoctorsList}/>
					<Route exact path="/doctors/:prefix" component={DoctorsList}/>
					<Route exact path="/doctors/:prefix/page/:page" component={DoctorsList}/>

					<Route exact path="/doctor/:name" component={DoctorDetails}/>
					<Route exact path="/doctor/:name/page/:page" component={DoctorDetails}/>

					<Route exact path="/insurances" component={InsurancesList}/>
					<Route exact path="/insurances/page/:page" component={InsurancesList}/>
					<Route exact path="/insurances/:prefix" component={InsurancesList}/>
					<Route exact path="/insurances/:prefix/page/:page" component={InsurancesList}/>

					<Route exact path="/insurance/:name" component={InsuranceDetails}/>
					<Route exact path="/insurance/:name/page/:page" component={InsuranceDetails}/>

					<Route exact path="/allergies" component={AllergiesList}/>
					<Route exact path="/allergies/page/:page" component={AllergiesList}/>
					<Route exact path="/allergies/:prefix" component={AllergiesList}/>
					<Route exact path="/allergies/:prefix/page/:page" component={AllergiesList}/>

					<Route exact path="/allergy/:name" component={AllergyDetails}/>
					<Route exact path="/allergy/:name/page/:page" component={AllergyDetails}/>

					<Route exact path="/drugs" component={DrugsSearch}/>
					<Route exact path="/drug/:id" component={DrugDetails}/>

					<Route exact path="/settings" component={Settings}/>

					<Route component={NoMatch}/>

				</Switch>
			</main>
		);
}
}

Main.propTypes = {
	classes: PropTypes.object.isRequired,
	theme: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true }) (Main) ;
