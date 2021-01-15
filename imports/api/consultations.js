import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

import PairingHeap from '@aureooms/js-pairing-heap';
import {increasing, decreasing} from '@aureooms/js-compare';

import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';

import {list, map, range, product} from '@aureooms/js-itertools';

import {Uploads} from './uploads.js';
import {Books, books} from './books.js';
import {parseUint32StrictOrString} from './string.js';

import makeQuery from './makeQuery.js';
import makeCachedFindOne from './makeFindOne.js'; // makeCachedFindOne has issues

const collection = 'consultations';
const stats = collection + '.stats';
const statsPublication = stats;

export const Consultations = new Mongo.Collection(collection);
const Stats = new Mongo.Collection(stats);

export const useConsultation = makeCachedFindOne(Consultations, 'consultation');

export const useConsultationsFind = makeQuery(Consultations, 'consultations');

export const useConsultationsAndAppointments = makeQuery(
	Consultations,
	'consultationsAndAppointments'
);

const statsKey = (query, init) => JSON.stringify({query, init});

function setupConsultationsStatsPublication(collection, query, init) {
	// Generate unique key depending on parameters
	const key = statsKey(query, init);
	const selector = {
		...query,
		isDone: true,
		owner: this.userId
	};
	const options = {fields: {_id: 1, price: 1, datetime: 1}};

	const minHeap = new PairingHeap(increasing);
	const maxHeap = new PairingHeap(decreasing);
	const refs = new Map();
	let count = 0;
	let total = 0;

	const state = () => ({
		...init,
		count,
		total,
		first: minHeap.head(),
		last: maxHeap.head()
	});

	// `observeChanges` only returns after the initial `added` callbacks have run.
	// Until then, we don't want to send a lot of `changed` messages—hence
	// tracking the `initializing` state.
	let initializing = true;
	const handle = Consultations.find(selector, options).observeChanges({
		added: (_id, {price, datetime}) => {
			count += 1;
			if (price) total += price;
			const minRef = minHeap.push(datetime);
			const maxRef = maxHeap.push(datetime);
			refs.set(_id, [price, minRef, maxRef]);

			if (!initializing) {
				this.changed(collection, key, state());
			}
		},

		changed: (_id, fields) => {
			const [oldPrice, minRef, maxRef] = refs.get(_id);
			let newPrice = oldPrice;
			if (Object.prototype.hasOwnProperty.call(fields, 'price')) {
				newPrice = fields.price;
				if (oldPrice) total -= oldPrice;
				if (newPrice) total += newPrice;
				refs.set(_id, [newPrice, minRef, maxRef]);
			}

			if (Object.prototype.hasOwnProperty.call(fields, 'datetime')) {
				const datetime = fields.datetime;
				minHeap.update(minRef, datetime);
				maxHeap.update(maxRef, datetime);
			}

			this.changed(collection, key, state());
		},

		removed: (_id) => {
			count -= 1;
			const [price, minRef, maxRef] = refs.get(_id);
			if (price) total -= price;
			minHeap.delete(minRef);
			maxHeap.delete(maxRef);
			refs.delete(_id);
			this.changed(collection, key, state());
		}
	});

	// Instead, we'll send one `added` message right after `observeChanges` has
	// returned, and mark the subscription as ready.
	initializing = false;
	this.added(collection, key, state());

	return handle;
}

if (Meteor.isServer) {
	Meteor.publish('consultation', function (_id, options) {
		check(_id, String);
		return Consultations.find(
			{
				owner: this.userId,
				_id
			},
			options
		);
	});

	Meteor.publish('consultations', function (query = {}) {
		return Consultations.find({
			isDone: true,
			...query,
			owner: this.userId
		});
	});

	Meteor.publish('consultations.interval', function (from, to) {
		return Consultations.find({
			owner: this.userId,
			datetime: {
				$gte: from,
				$lt: to
			}
		});
	});

	Meteor.publish('consultations.accounted.interval.last', function (from, to) {
		return Consultations.find(
			{
				owner: this.userId,
				isDone: true,
				datetime: {
					$gte: from,
					$lt: to
				},
				book: {
					$ne: '0'
				}
			},
			{
				sort: {
					datetime: -1,
					limit: 1
				}
			}
		);
	});

	Meteor.publish('consultations.last', function () {
		return Consultations.find(
			{
				owner: this.userId,
				isDone: true
			},
			{
				sort: {
					datetime: -1
				},
				limit: 1
			}
		);
	});

	Meteor.publish('consultations.wired', function () {
		return Consultations.find({
			owner: this.userId,
			isDone: true,
			payment_method: 'wire'
		});
	});

	Meteor.publish('consultationsAndAppointments', function (query, options) {
		return Consultations.find(
			{
				...query,
				owner: this.userId
			},
			options
		);
	});

	Meteor.publish('patient.consultations', function (patientId, options) {
		check(patientId, String);
		return Consultations.find(
			{
				owner: this.userId,
				isDone: true,
				patientId
			},
			options
		);
	});

	Meteor.publish('consultations.unpaid', function () {
		return Consultations.find({
			owner: this.userId,
			isDone: true,
			$expr: {
				$ne: ['$paid', '$price']
			}
		});
	});

	Meteor.publish(books.options.parentPublication, function (
		name,
		options = {}
	) {
		const query = {
			...books.selector(name),
			owner: this.userId,
			isDone: true
		};
		if (options.fields) {
			const {fields, ...rest} = options;
			const _options = {
				...rest,
				fields: {
					...fields
				}
			};
			for (const key of Object.keys(query)) {
				_options.fields[key] = 1;
			}

			return Consultations.find(query, _options);
		}

		return Consultations.find(query, options);
	});

	Meteor.publish(books.options.parentPublicationStats, function (name) {
		check(name, String);

		const collection = books.options.stats;
		const query = books.selector(name);

		const handle = setupConsultationsStatsPublication.call(
			this,
			collection,
			query,
			{name}
		);
		this.ready();

		// Stop observing the cursor when the client unsubscribes. Stopping a
		// subscription automatically takes care of sending the client any `removed`
		// messages.
		this.onStop(() => handle.stop());
	});

	Meteor.publish(statsPublication, function (query) {
		const collection = stats;

		const handle = setupConsultationsStatsPublication.call(
			this,
			collection,
			query
		);
		this.ready();

		// Stop observing the cursor when the client unsubscribes. Stopping a
		// subscription automatically takes care of sending the client any `removed`
		// messages.
		this.onStop(() => handle.stop());
	});

	Meteor.publish('consultations.missing-a-price', function () {
		return Consultations.find({
			owner: this.userId,
			isDone: true,
			// True > 0
			// '' >= 0
			price: {$not: {$gt: 1}}
		});
	});
}

function sanitize({
	patientId,
	datetime,
	reason,
	done,
	todo,
	treatment,
	next,
	more,

	currency,
	price,
	paid,
	book,
	payment_method
}) {
	check(patientId, String);
	check(datetime, Date);

	check(reason, String);
	check(done, String);
	check(todo, String);
	check(treatment, String);
	check(next, String);
	if (more !== undefined) check(more, String);

	if (currency !== undefined) check(currency, String);
	if (price !== undefined) check(price, Number);
	if (paid !== undefined) check(paid, Number);
	if (book !== undefined) check(book, String);
	if (payment_method !== undefined) check(payment_method, String);

	reason = reason.trim();
	done = done.trim();
	todo = todo.trim();
	treatment = treatment.trim();
	next = next.trim();
	more = more && more.trim();

	currency = currency && currency.trim().toUpperCase();
	book = book && book.trim();

	return {
		patientId,
		datetime,
		reason,
		done,
		todo,
		treatment,
		next,
		more,

		currency,
		price,
		paid,
		book,
		payment_method,
		isDone: true
	};
}

Meteor.methods({
	'books.interval.csv'(begin, end, firstBook, lastBook, maxRows) {
		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		check(begin, Date);
		check(end, Date);
		check(firstBook, Number);
		check(lastBook, Number);
		check(maxRows, Number);

		const beginBook = firstBook;
		const endBook = lastBook + 1;

		const consultations = Consultations.find(
			{
				datetime: {
					$gte: begin,
					$lt: end
				},
				owner: this.userId
			},
			{
				sort: {
					datetime: 1
				}
			}
		).fetch();

		const data = {};

		let minDatetime = end;
		let maxDatetime = begin;

		for (const consultation of consultations) {
			const {datetime, book, price} = consultation;

			if (isBefore(datetime, minDatetime)) {
				minDatetime = datetime;
			}

			if (isAfter(datetime, maxDatetime)) {
				maxDatetime = datetime;
			}

			const bookSlug = books.name(datetime, book);

			if (data[bookSlug] === undefined) {
				data[bookSlug] = [];
			}

			data[bookSlug].push(price);
		}

		const beginYear = minDatetime.getFullYear();
		const endYear = maxDatetime.getFullYear() + 1;

		const header = list(
			map(
				([year, book]) => books.format(year, book),
				product([range(beginYear, endYear), range(beginBook, endBook)])
			)
		);
		const lines = [];

		for (const i of range(maxRows)) {
			const line = [];
			for (const bookSlug of header) {
				if (data[bookSlug] !== undefined && data[bookSlug][i] !== undefined) {
					line.push(data[bookSlug][i]);
				} else {
					line.push('');
				}
			}

			lines.push(line);
		}

		const table = [];
		table.push(header.join(','));
		for (const line of lines) {
			table.push(line.join(','));
		}

		return table.join('\n');
	},

	'consultations.insert'(consultation) {
		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const fields = sanitize(consultation);

		if (fields.datetime && fields.book) {
			books.add(this.userId, books.name(fields.datetime, fields.book));
		}

		return Consultations.insert({
			...fields,
			createdAt: new Date(),
			owner: this.userId
		});
	},

	'consultations.update'(consultationId, newfields) {
		check(consultationId, String);
		const consultation = Consultations.findOne(consultationId);
		if (!consultation || consultation.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const fields = sanitize(newfields);
		if (fields.datetime && fields.book) {
			books.add(this.userId, books.name(fields.datetime, fields.book));
		}

		return Consultations.update(consultationId, {$set: fields});
	},

	'consultations.attach'(consultationId, uploadId) {
		check(consultationId, String);
		check(uploadId, String);
		const consultation = Consultations.findOne(consultationId);
		const upload = Uploads.findOne(uploadId);
		if (!consultation || consultation.owner !== this.userId) {
			throw new Meteor.Error(
				'not-authorized',
				'user does not own consultation'
			);
		}

		if (!upload || upload.userId !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own attachment');
		}

		return Consultations.update(consultationId, {
			$addToSet: {attachments: uploadId}
		});
	},

	'consultations.detach'(consultationId, uploadId) {
		check(consultationId, String);
		check(uploadId, String);
		const consultation = Consultations.findOne(consultationId);
		const upload = Uploads.findOne(uploadId);
		if (!consultation || consultation.owner !== this.userId) {
			throw new Meteor.Error(
				'not-authorized',
				'user does not own consultation'
			);
		}

		if (!upload || upload.userId !== this.userId) {
			throw new Meteor.Error('not-authorized', 'user does not own attachment');
		}

		return Consultations.update(consultationId, {
			$pull: {attachments: uploadId}
		});
	},
	'consultations.remove'(consultationId) {
		check(consultationId, String);
		const consultation = Consultations.findOne(consultationId);
		if (!consultation || consultation.owner !== this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		return Consultations.remove(consultationId);
	},
	'books.changeBookNumber'(oldBookId, newBookNumber) {
		check(oldBookId, String);
		check(newBookNumber, String);

		if (!this.userId) {
			throw new Meteor.Error('not-authorized');
		}

		const book = Books.findOne({_id: oldBookId, owner: this.userId});
		if (!book) {
			throw new Meteor.Error('not-found');
		}

		const {name: oldName, fiscalYear} = book;

		newBookNumber = newBookNumber.trim();
		if (newBookNumber === '') {
			throw new Meteor.Error('value-error');
		}

		newBookNumber = parseUint32StrictOrString(newBookNumber);

		const newName = books.format(fiscalYear, newBookNumber);
		const newBookId = books.add(this.userId, newName);

		const query = {
			...books.selector(oldName),
			owner: this.userId,
			isDone: true
		};

		Consultations.update(
			query,
			{
				$set: {book: newBookNumber.toString()}
			},
			{multi: true}
		);

		Books.remove(oldBookId);
		return newBookId;
	}
});

export const consultations = {
	methods,
	sanitize,
	stats: {
		collection: stats,
		publication: statsPublication,
		Collection: Stats,
		key: statsKey
	}
};
