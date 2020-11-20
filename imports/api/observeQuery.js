const observeQuery = (QueriedCollection, resultsCollection) =>
	function (key, query, options, observe) {
		query = {
			...query,
			owner: this.userId
		};
		observe = {
			added: true,
			removed: true,
			...observe
		};
		const uid = JSON.stringify({
			key,
			query,
			options,
			observe
		});
		const results = [];
		let initializing = true;

		const stop = () => {
			console.debug('STOP!', {uid});
			this.stop();
		};

		const observers = {
			added: (_id, fields) => {
				console.debug('added', {_id});
				if (initializing) results.push({_id, ...fields});
				else if (observe.added) stop();
			}
		};

		if (observe.removed) observers.removed = stop;
		if (observe.changed) observers.changed = stop;

		const handle = QueriedCollection.find(query, options).observeChanges(
			observers
		);

		// Instead, we'll send one `added` message right after `observeChanges` has
		// returned, and mark the subscription as ready.
		initializing = false;
		this.added(resultsCollection, uid, {
			key,
			results
		});
		this.ready();

		// Stop observing the cursor when the client unsubscribes. Stopping a
		// subscription automatically takes care of sending the client any `removed`
		// messages.
		this.onStop(() => handle.stop());
	};

export default observeQuery;
