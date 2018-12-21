import "@babel/polyfill";
import { assert } from 'chai';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Patients } from './patients.mock.js';
import { Consultations } from './consultations.mock.js';

if (Meteor.isServer) {

	describe('Patients', () => {

		describe('methods', () => {

			beforeEach( () => {
				Patients.remove({});
				Consultations.remove({});
			})

			it('can delete own patient', () => {
				const userId = Random.id();

				const patient = Factory.create('patient', {owner: userId}) ;
				const patientId = patient._id;

				const patientsRemove = Meteor.server.method_handlers['patients.remove'];

				const invocation = { userId };

				patientsRemove.apply(invocation, [patientId]);

				assert.equal(Patients.find().count(), 0);

			});

			it('cannot delete someone else\'s patient', () => {
				const userId = Random.id();

				const patient = Factory.create('patient', {owner: userId}) ;
				const patientId = patient._id;

				const patientsRemove = Meteor.server.method_handlers['patients.remove'];

				const invocation = { userId: userId + 1 };

				assert.throws(() => patientsRemove.apply(invocation, [patientId]), /not-authorized/);

			});


		});

	});

}