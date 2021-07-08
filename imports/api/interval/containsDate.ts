const containsDate = (
	date: number | Date,
	beginKey = 'begin',
	endKey = 'end'
) => ({
	[beginKey]: {
		$lte: date
	},
	[endKey]: {
		$gt: date
	}
});

export default containsDate;
