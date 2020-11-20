import {Meteor} from 'meteor/meteor';
import {useState, useEffect, useRef} from 'react';

const makeObservedQuery = (Collection, subscription) => (
	query,
	options,
	deps
) => {
	const [loading, setLoading] = useState(true);
	const [results, setResults] = useState([]);
	const [dirty, setDirty] = useState(false);
	const handleRef = useRef(null);

	useEffect(() => {
		console.debug('useEffect enter', {deps});
		setDirty(false);

		const timestamp = new Date().getTime();
		const key = JSON.stringify({timestamp, query, options});
		const handle = Meteor.subscribe(subscription, key, query, options, {
			onStop: () => {
				console.debug('onStop', {key});
				if (handleRef.current === handle) setDirty(true);
			},
			onReady: () => {
				console.debug('onReady', {key});
				const {results} = Collection.findOne({key});
				setLoading(false);
				setResults(results);
			}
		});
		handleRef.current = handle;

		return () => {
			console.debug('useEffect exit', {deps});
			handle.stop();
		};
	}, deps);

	return {loading, results, dirty};
};

export default makeObservedQuery;
