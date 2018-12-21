import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { list } from '@aureooms/js-itertools' ;
import { map } from '@aureooms/js-itertools' ;
import { enumerate } from '@aureooms/js-itertools' ;

import parseHealthOne from 'healthone/lib/parse' ;

import { Patients } from './patients.js';

export const Documents = new Mongo.Collection('documents');

if (Meteor.isServer) {

	Meteor.publish('documents', function () {
		return Documents.find({ owner: this.userId });
	});

	Meteor.publish('documents.page', function (page, perpage) {
		check(page, Number);
		check(perpage, Number);
		return Documents.find({ owner: this.userId}, {sort: { createdAt: -1 }, skip: page*perpage, limit: perpage});
	});

	Meteor.publish('document', function (_id) {
		check(_id, String);
		return Documents.find({ owner: this.userId , _id });
	});

	Meteor.publish('patient.documents', function (patientId) {
		check(patientId, String);
		return Documents.find({ owner: this.userId , patientId: patientId });
	});

}

function sanitize ( {
	patientId,
	format,
	source,
} ) {

	patientId === undefined || check(patientId, String);
	check(format, String);
	check(source, String);

	if (format === 'healthone') {
		try {
			const entries = [];
			const documents = parseHealthOne(source);
			for ( const document of documents ) {
				const entry = {
					...document,
					patientId,
					format,
					source: document.source.join('\n'),
					parsed: true,
				} ;
				entries.push(entry);
			}
			return entries;
		}
		catch (e) {
			console.error('Failed to parse Health One document.', e);
		}
	}

	return [ {
		patientId,
		format,
		source,
		parsed: false,
	} ] ;

}

Meteor.methods({

	'documents.insert'(document) {

		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const entries = sanitize(document);

		let firstId = undefined;

		for ( const entry of entries ) {

			const _id = Documents.insert({
				...entry,
				createdAt: new Date(),
				owner: this.userId,
			});

			firstId = firstId || _id ;

		}

		return firstId;


	},

	'documents.link'(documentId, patientId) {
		check(documentId, String);
		check(patientId, String);
		const document = Documents.findOne(documentId);
		const patient = Patients.findOne(patientId);
		if (!document || document.owner !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own document');
		}
		if (!patient || patient.owner !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own patient');
		}
		return Documents.update(documentId, { $set: { patientId } });
	},

	'documents.unlink'(documentId) {
		check(documentId, String);
		const document = Documents.findOne(documentId);
		if (!document || document.owner !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own document');
		}
		return Documents.update(documentId, { $unset: { patientId: '' } });
	},

	'documents.remove'(documentId){
		check(documentId, String);
		const document = Documents.findOne(documentId);
		if (!document || document.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}
		return Documents.remove(documentId);
	},

});