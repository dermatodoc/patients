const beginsAfterDate = (begin: number | Date, beginKey = 'begin') => ({
	[beginKey]: {
		$gte: begin
	}
});

export default beginsAfterDate;
