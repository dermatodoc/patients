const overlapsInterval = (
	begin: number,
	end: number,
	measure = 0,
	beginKey = 'begin',
	endKey = 'end',
	measureKey = 'measure'
) => {
	return end - begin < measure
		? {}
		: {
				$or: [
					{
						[beginKey]: {
							$lte: begin
						},
						[endKey]: {
							$gt: begin + measure
						}
					},
					{
						[beginKey]: {
							$lt: end - measure
						},
						[endKey]: {
							$gte: end
						}
					},
					{
						[beginKey]: {
							$gt: begin
						},
						[endKey]: {
							$lt: end
						},
						[measureKey]: {
							$gte: measure
						}
					}
				]
		  };
};

export default overlapsInterval;
