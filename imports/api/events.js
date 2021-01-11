import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

import {Consultations} from './consultations.js';
import {Patients} from './patients.js';

const events = 'events';
export const Events = new Mongo.Collection(events);

if (Meteor.isServer) {
	Meteor.publish('events.interval', function (begin, end) {
		check(begin, Date);
		check(end, Date);

		const query = {
			owner: this.userId,
			datetime: {
				$gte: begin,
				$lt: end
			}
		};

		const options = {fields: {_id: 1, patientId: 1, datetime: 1, isDone: 1}};
		for (const field of Object.keys(query)) options.fields[field] = 1;

		const event = (_id, {owner, patientId, datetime, isDone}) => {
			const patient = Patients.findOne(patientId); // TODO Make reactive (maybe)?
			return {
				owner,
				title: `${patient.lastname} ${patient.firstname}`,
				begin: datetime,
				uri: `/patient/${patient._id}/${
					isDone ? 'consultations' : 'appointments'
				}`,
				style: {
					backgroundColor:
						isDone === false
							? '#fff5d6'
							: patient.noshow > 0
							? '#ff7961'
							: '#757de8',
					color:
						isDone === false ? 'black' : patient.noshow > 0 ? 'black' : 'black'
				}
			};
		};

		const handle = Consultations.find(query, options).observeChanges({
			added: (_id, fields) => {
				this.added(events, _id, event(_id, fields));
			},

			changed: (_id, fields) => {
				this.changed(events, _id, event(_id, fields));
			},

			removed: (_id) => {
				this.removed(events, _id);
			}
		});

		// Mark the subscription as ready.
		this.ready();

		// Stop observing the cursor when the client unsubscribes. Stopping a
		// subscription automatically takes care of sending the client any `removed`
		// messages.
		this.onStop(() => handle.stop());
	});
}