import intersection from './intersection';
import isEmpty from './isEmpty';

export default function* difference<Endpoint>(
	x0: Endpoint,
	x1: Endpoint,
	y0: Endpoint,
	y1: Endpoint
) {
	const [i0, i1] = intersection(x0, x1, y0, y1);

	if (isEmpty(i0, i1)) {
		yield [x0, x1];
	} else {
		if (!isEmpty(x0, i0)) {
			yield [x0, i0];
		}

		if (!isEmpty(i1, x1)) {
			yield [i1, x1];
		}
	}
}
