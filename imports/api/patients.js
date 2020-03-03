import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { list } from '@aureooms/js-itertools' ;
import { map } from '@aureooms/js-itertools' ;
import { take } from '@aureooms/js-itertools' ;
import { filter } from '@aureooms/js-itertools' ;

import { Consultations } from './consultations.js';
import { Documents } from './documents.js';
import { Uploads } from './uploads.js';

import { insurances } from './insurances.js';
import { doctors } from './doctors.js';
import { allergies } from './allergies.js';

export const Patients = new Mongo.Collection('patients');

export const BIRTHDATE_FORMAT = 'YYYY-MM-DD' ;
export const SEX_ALLOWED = [ '' , 'male' , 'female' , 'other' ]

insurances.init( Patients ) ;
doctors.init( Patients ) ;
allergies.init( Patients ) ;

if (Meteor.isServer) {

	Meteor.publish('patients', function () {
		return Patients.find({ owner: this.userId });
	});

	Meteor.publish('patient', function (_id) {
		check(_id, String);
		return Patients.find({ owner: this.userId , _id });
	});

}

function updateTags ( userId , fields ) {
	for ( const [ tagCollection , tagList ] of [
		[ insurances , fields.insurances ] ,
		[ doctors , fields.doctors ] ,
		[ allergies , fields.allergies ] ,
	] ) {
		if ( tagList ) {
			for ( const tag of tagList ) {
				tagCollection.add(userId, tag) ;
			}
		}
	}
}

function sanitize ( {

	niss,
	firstname,
	lastname,
	birthdate,
	sex,
	photo,

	antecedents,
	ongoing,
	about,

	municipality,
	streetandnumber,
	zip,
	phone,

	insurances,
	doctors,
	allergies,

	noshow,

} ) {

	niss === undefined || check(niss, String);
	firstname === undefined || check(firstname, String);
	lastname === undefined || check(lastname, String);
	birthdate === undefined || check(birthdate, String);
	sex === undefined || check(sex, String);
	photo === undefined || check(photo, String);

	antecedents === undefined || check(antecedents, String);
	ongoing === undefined || check(ongoing, String);
	about === undefined || check(about, String);

	municipality === undefined || check(municipality, String);
	streetandnumber === undefined || check(streetandnumber, String);
	zip === undefined || check(zip, String);
	phone === undefined || check(phone, String);

	insurances === undefined || check(insurances, [String]);
	doctors === undefined || check(doctors, [String]);
	allergies === undefined || check(allergies, [String]);

	noshow === undefined || check(noshow, Number);

	niss = niss && niss.trim();
	firstname = firstname && firstname.trim();
	lastname = lastname && lastname.trim();
	birthdate = birthdate && birthdate.trim();
	sex = sex && sex.trim();
	photo = photo && photo.replace(/\n/g,'');

	antecedents = antecedents && antecedents.trim();
	ongoing = ongoing && ongoing.trim();
	about = about && about.trim();

	municipality = municipality && municipality.trim();
	streetandnumber = streetandnumber && streetandnumber.trim();
	zip = zip && zip.trim();
	phone = phone && phone.trim();

	if ( insurances ) insurances = list(map(x=>x.trim(), insurances)) ;
	if ( doctors ) doctors = list(map(x=>x.trim(), doctors)) ;
	if ( allergies ) allergies = list(map(x=>x.trim(), allergies)) ;

	return {
		niss,
		firstname,
		lastname,
		birthdate,
		sex,
		photo,

		antecedents,
		ongoing,
		about,

		municipality,
		streetandnumber,
		zip,
		phone,

		allergies,
		doctors,
		insurances,

		noshow,

	} ;

}

Meteor.methods({
	'patients.insert'( patient ) {

		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const fields = sanitize(patient);

		updateTags(this.userId, fields);

		return Patients.insert({
			...fields,
			createdAt: new Date(),
			owner: this.userId,
		});

	},

	'patients.update'(patientId, newfields) {
		check(patientId, String);
		const patient = Patients.findOne(patientId);
		if (patient.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const fields = sanitize(newfields);

		updateTags(this.userId, fields);

		return Patients.update(patientId, { $set: fields });
	},

	'patients.attach'(patientId, uploadId) {
		check(patientId, String);
		check(uploadId, String);
		const patient = Patients.findOne(patientId);
		const upload = Uploads.findOne(uploadId);
		if (!patient || patient.owner !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own patient');
		}
		if (!upload || upload.userId !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own attachment');
		}
		// If needed, use $each modifier to attach multiple documents
		// simultaneously.
		// See https://docs.mongodb.com/manual/reference/operator/update/addToSet/#each-modifier
		return Patients.update(patientId, { $addToSet: { attachments: uploadId } });
	},

	'patients.detach'(patientId, uploadId) {
		check(patientId, String);
		check(uploadId, String);
		const patient = Patients.findOne(patientId);
		const upload = Uploads.findOne(uploadId);
		if (!patient || patient.owner !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own patient');
		}
		if (!upload || upload.userId !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own attachment');
		}
		return Patients.update(patientId, { $pull: { attachments: uploadId } });
	},

	'patients.remove'(patientId){
		check(patientId, String);
		const patient = Patients.findOne(patientId);
		if (patient.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		Consultations.remove({ owner: this.userId , patientId: patientId }) ;
		Documents.update({
			owner: this.userId ,
			patientId: patientId
		}, {
			$set: {
				deleted: true
			}
		}) ;
		return Patients.remove(patientId);
	},

	'patients.merge'(oldPatientIds, consultationIds, documentIds, newPatient) {

		// Here is what is done in this method
		// (1) Check that user is connected
		// (2) Check that each patient in `oldPatientIds` is owned by the user
		// (3) Check that each attachment in `newPatient.attachments` is attached to a patient in `oldPatientIds`
		// (4) Create new patient with attachments
		// (5) Attach consultations in `consultationIds` to newly created patient
		// (6) Remove consultations that have not been attached
		// (7) Attach documents in `documentIds` to newly created patient
		// (8) Remove documents that have not been attached
		// (9) Remove patients in `oldPatientIds`

		// (1)
		if (!this.userId) throw new Meteor.Error('not-authorized');

		const allowedAttachments = new Set();

		// (2)
		for ( const oldPatientId of oldPatientIds ) {
			const oldPatient = Patients.findOne(oldPatientId);
			if (!oldPatient || oldPatient.owner !== this.userId) {
				throw new Meteor.Error('not-authorized', 'user does not own patient');
			}
			// build list of allowed attachments to pass on new patient
			if (oldPatient.attachments) {
				for ( const uploadId of oldPatient.attachments ) {
					allowedAttachments.add(uploadId);
				}
			}
		}

		// (3) check that all attachments are allowed
		// NOTE could filter and warn instead
		if ( newPatient.attachments ) {
			for ( const uploadId of newPatient.attachments ) {
				if ( ! allowedAttachments.has(uploadId) ) {
					throw new Meteor.Error('not-authorized', `uploadId ${uploadId} is not allowed in merge`);
				}
			}
		}

		// (4)
		const fields = {
			...sanitize(newPatient) ,
			attachments: newPatient.attachments ,
		} ;

		const newPatientId = Patients.insert({
			...fields,
			createdAt: new Date(),
			owner: this.userId,
		});

		// not needed to update tags since the merged info should only contain
		// existing tags
		//updateTags(this.userId, fields);

		// (5)
		Consultations.update(
			{
				owner: this.userId, // this selector automatically filters out bad consultation ids
				patientId: { $in: oldPatientIds },
				_id: { $in: consultationIds },
			} ,
			{
				$set: { patientId : newPatientId } ,
			} ,
			{
				multi: true
			} ,
		);

		// (6)
		Consultations.remove({
			owner: this.userId ,
			patientId: { $in: oldPatientIds } ,
		}) ;

		// (7)
		Documents.update(
			{
				owner: this.userId, // this selector automatically filters out bad document ids
				patientId: { $in: oldPatientIds },
				_id: { $in: documentIds },
			} ,
			{
				$set: { patientId : newPatientId } ,
			} ,
			{
				multi: true
			} ,
		);

		// (8)
		Documents.update(
			{
				owner: this.userId ,
				patientId: { $in: oldPatientIds } ,
			},
			{
				$set: { deleted: true } ,
			},
			{
				multi: true
			}
		) ;

		// (9)
		Patients.remove({
			_id: { $in: oldPatientIds } ,
		}) ;

		return newPatientId ;

	},

});

function mergePatients ( oldPatients ) {

	const newPatient = {
		allergies: [],
		doctors: [],
		insurances: [],
		attachments: [],
		noshow: 0,
	} ;

	for ( const oldPatient of oldPatients ) {

		const replaceOne = function ( key ) {
			if (oldPatient[key]) newPatient[key] = oldPatient[key] ;
		} ;
		// This data is from the ID card.
		// Currently assuming that merge only needs to happen when
		// someone forgot their ID card the first time.
		// When that is the case, list entry with ID card last in the UI.
		// This is not done automatically for the moment.
		replaceOne('niss');
		replaceOne('firstname');
		replaceOne('lastname');
		replaceOne('birthdate');
		replaceOne('sex');
		replaceOne('photo');
		replaceOne('municipality');
		replaceOne('streetandnumber');
		replaceOne('zip');

		const concatParagraphs = function ( x ) {
			if (oldPatient[x]) newPatient[x] = newPatient[x] ? oldPatient[x] + '\n\n' + newPatient[x] : oldPatient[x]
		} ;

		concatParagraphs('antecedents') ;
		concatParagraphs('ongoing') ;
		concatParagraphs('about') ;

		const concatWords = function ( x ) {
			if (oldPatient[x]) newPatient[x] = newPatient[x] ? oldPatient[x] + ', ' + newPatient[x] : oldPatient[x]
		} ;

		concatWords('phone') ;

		const mergeSets = function ( x ) {
			if (oldPatient[x]) newPatient[x] = oldPatient[x].concat(newPatient[x]) ;
		} ;

		mergeSets('allergies');
		mergeSets('doctors');
		mergeSets('insurances');
		mergeSets('attachments');

		if (oldPatient.noshow) newPatient.noshow += oldPatient.noshow ;

	}

	newPatient.allergies = list(new Set(newPatient.allergies));
	newPatient.doctors = list(new Set(newPatient.doctors));
	newPatient.insurances = list(new Set(newPatient.insurances));
	newPatient.attachments = list(new Set(newPatient.attachments));

	return newPatient ;

}

const patientToKey = x => x._id ;

const patientToString = x => `${x.lastname} ${x.firstname} (${x._id})` ;

const patientFilter = (suggestions, inputValue) => {

	const matches = x => !inputValue || patientToString(x).toLowerCase().includes(inputValue.toLowerCase()) ;

	const keep = 5 ;

	return list( take( filter(matches, suggestions) , keep ) ) ;

} ;

function createPatient ( string ) {

	const [ lastname , ...firstnames ] = string.split(' ');

	return {
		lastname,
		firstname: firstnames.join(' '),
		_id: '?',
	} ;

} ;

export const patients = {
	toString: patientToString ,
	toKey: patientToKey ,
	merge: mergePatients ,
	filter: patientFilter ,
	create: createPatient ,
} ;
