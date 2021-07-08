const intersection = <Endpoint>(
	x0: Endpoint,
	x1: Endpoint,
	y0: Endpoint,
	y1: Endpoint
) => {
	return [x0 < y0 ? y0 : x0, x1 > y1 ? y1 : x1];
};

export default intersection;
