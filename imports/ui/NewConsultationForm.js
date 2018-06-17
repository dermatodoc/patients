import { Meteor } from 'meteor/meteor';

import React from 'react' ;

import ConsultationFrom from './ConsultationFrom.js' ;

export default class NewConsultationForm extends React.Component {

	constructor(props){
		super(props);
	}

	render(){

		const { match } = this.props ;

		const consultation = {
			_id: undefined,
			patientId: match.params.id,
			datetime: new Date(),
			reason: '',
			done: '',
			todo: '',
			treatment: '',
			next: '',
			more: '',
		};

		return <ConsultationFrom consultation={consultation}/> ;

	}
}
