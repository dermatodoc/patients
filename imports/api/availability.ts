import assert from 'assert';

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {check} from 'meteor/check';

import {units} from './duration';

import properlyIntersectsWithRightOpenInterval from './interval/containsDate';
import isContainedInRightOpenIterval from './interval/beginsAfterDate';
import overlapsInterval from './interval/overlapsInterval';
import intersectsInterval from './interval/intersectsInterval';

import difference from './interval/difference';

export interface SlotFields {
	begin: Date;
	end: Date;
	beginModuloWeek: number;
	endModuloWeek: number;
	measureModuloWeek: number;
}

export interface SlotMetadata {
	_id: string;
	owner: string;
}

export type SlotDocument = SlotFields & SlotMetadata;

type Constraint = [number, number];
type Duration = number;

const availability = 'availability';
export const Availability = new Mongo.Collection<SlotDocument>(availability);

const SECONDS_MODULO = 1;
const MINUTE_MODULO = 60 * SECONDS_MODULO;
const HOUR_MODULO = 60 * MINUTE_MODULO;
const DAY_MODULO = 24 * HOUR_MODULO;
const WEEK_MODULO = 7 * DAY_MODULO;

const intervalsOverlap = (
	x0: number,
	x1: number,
	y0: number,
	y1: number,
	measure: number
) => {
	return (
		(x1 - x0 >= measure && x0 >= y0 && x0 + measure < y1) ||
		(x1 - x0 >= measure && x1 - measure > y0 && x1 <= y1) ||
		(x0 < y0 && x1 > y1 && y1 - y0 >= measure)
	);
	// return Math.min(x1, y1) - Math.max(x0, y0) >= measure;
};

const overlapsAfterDate = (
	after: Date,
	duration: Duration,
	constraints: Constraint[],
	slot: SlotDocument
) => {
	if (slot === undefined) return false;
	// TODO rewrite by applying various truncation to constraints instead of slot
	// so that these can be used directly in a DB query

	assert(slot.begin < slot.end);

	const toTruncateLeft = Number(after) - Number(slot.begin);
	const toInspectRight = Number(slot.end) - Number(after);

	if (toTruncateLeft <= 0) {
		// slot is completely contained in right open interval
		for (const [beginModuloWeek, endModuloWeek] of constraints) {
			if (
				intervalsOverlap(
					slot.beginModuloWeek,
					slot.endModuloWeek,
					beginModuloWeek,
					endModuloWeek,
					duration
				)
			)
				return true;
			if (
				intervalsOverlap(
					slot.beginModuloWeek,
					slot.endModuloWeek,
					beginModuloWeek + WEEK_MODULO,
					endModuloWeek + WEEK_MODULO,
					duration
				)
			)
				return true;
			if (
				intervalsOverlap(
					slot.beginModuloWeek,
					slot.endModuloWeek,
					beginModuloWeek + WEEK_MODULO * 2,
					endModuloWeek + WEEK_MODULO * 2,
					duration
				)
			)
				return true;
		}
	} else if (toTruncateLeft <= WEEK_MODULO - slot.beginModuloWeek) {
		// after occurs during the first week of slot
		for (const [beginModuloWeek, endModuloWeek] of constraints) {
			if (
				intervalsOverlap(
					slot.beginModuloWeek + toTruncateLeft,
					slot.endModuloWeek,
					beginModuloWeek,
					endModuloWeek,
					duration
				)
			)
				return true;
			if (
				intervalsOverlap(
					slot.beginModuloWeek + toTruncateLeft,
					slot.endModuloWeek,
					beginModuloWeek + WEEK_MODULO,
					endModuloWeek + WEEK_MODULO,
					duration
				)
			)
				return true;
			if (
				intervalsOverlap(
					slot.beginModuloWeek + toTruncateLeft,
					slot.endModuloWeek,
					beginModuloWeek + WEEK_MODULO * 2,
					endModuloWeek + WEEK_MODULO * 2,
					duration
				)
			)
				return true;
		}
	} else if (toInspectRight <= slot.endModuloWeek % WEEK_MODULO) {
		// after occurs during the last week of slot
		const shift = Math.floor(slot.endModuloWeek / WEEK_MODULO) * WEEK_MODULO;
		assert(shift === WEEK_MODULO || shift === WEEK_MODULO * 2);
		for (const [beginModuloWeek, endModuloWeek] of constraints) {
			if (
				intervalsOverlap(
					slot.endModuloWeek - toInspectRight,
					slot.endModuloWeek,
					beginModuloWeek + shift,
					endModuloWeek + shift,
					duration
				)
			)
				return true;
		}
	} else {
		// after occurs in some week in the middle of the slot
		for (const [beginModuloWeek, endModuloWeek] of constraints) {
			if (
				intervalsOverlap(
					slot.beginModuloWeek + toTruncateLeft,
					slot.endModuloWeek,
					beginModuloWeek + WEEK_MODULO,
					endModuloWeek + WEEK_MODULO,
					duration
				)
			)
				return true;
			if (
				intervalsOverlap(
					slot.beginModuloWeek + toTruncateLeft,
					slot.endModuloWeek,
					beginModuloWeek + WEEK_MODULO * 2,
					endModuloWeek + WEEK_MODULO * 2,
					duration
				)
			)
				return true;
		}
	}

	return false;
};

const slot = (begin: Date, end: Date): SlotFields => {
	const beginModuloWeek = begin.getTime() % units.week;
	const endModuloWeek = end.getTime() % units.week;
	const measureModuloWeek = endModuloWeek - beginModuloWeek;
	return {
		begin,
		end,
		beginModuloWeek,
		endModuloWeek,
		measureModuloWeek
	};
};

export function insertHook(begin, end) {
	const intersected = Availability.find(
		{
			$and: [{owner: this.userId}, intersectsInterval(begin, end)]
		},
		{
			limit: 3
		}
	).fetch();

	assert(intersected.length <= 2);

	const toDelete = intersected.map((x) => x._id);
	const toInsert = [];

	for (const slot of intersected) {
		for (const newSlot of difference(slot.begin, slot.end, begin, end)) {
			toInsert.push(newSlot);
		}
	}

	Availability.remove({_id: {$in: toDelete}});

	for (const args of toInsert) {
		Availability.insert(Reflect.apply(slot, this, args));
	}
}

export function removeHook() {
	return 'TODO';
}

export function updateHook() {
	return 'TODO';
}

if (Meteor.isServer) {
	Meteor.publish(
		'availability.next',
		function (after: Date, duration: Duration, constraints: Constraint[]) {
			check(after, Date);
			check(duration, Number);
			check(constraints, Array);

			const properlyIntersecting = Availability.find(
				{
					$and: [
						{owner: this.userId},
						properlyIntersectsWithRightOpenInterval(after)
					]
				},
				{
					limit: 2
				}
			).fetch();

			assert(properlyIntersecting.length <= 1);

			const firstContainedAndOverlapping = Availability.findOne(
				{
					$and: [
						{owner: this.userId},
						isContainedInRightOpenIterval(after),
						{
							$or: [
								...constraints.map(([beginModuloWeek, endModuloWeek]) => {
									return overlapsInterval(
										beginModuloWeek,
										endModuloWeek,
										duration,
										'beginModuloWeek',
										'endModuloWeek',
										'measureModuloWeek'
									);
								}),
								...constraints.map(([beginModuloWeek, endModuloWeek]) => {
									return overlapsInterval(
										beginModuloWeek + WEEK_MODULO,
										endModuloWeek + WEEK_MODULO,
										duration,
										'beginModuloWeek',
										'endModuloWeek',
										'measureModuloWeek'
									);
								}),
								...constraints.map(([beginModuloWeek, endModuloWeek]) => {
									return overlapsInterval(
										beginModuloWeek + WEEK_MODULO * 2,
										endModuloWeek + WEEK_MODULO * 2,
										duration,
										'beginModuloWeek',
										'endModuloWeek',
										'measureModuloWeek'
									);
								})
							]
						}
					]
				},
				{
					sort: {
						begin: 1
					}
				}
			);

			return overlapsAfterDate(
				after,
				duration,
				constraints,
				properlyIntersecting[0]
			)
				? properlyIntersecting
				: firstContainedAndOverlapping;
		}
	);
}
