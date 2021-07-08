const endsAfterDate = (begin: number | Date, endKey = 'end') => ({
	[endKey]: {
		$gt: begin
	}
});

export default endsAfterDate;
