import React from 'react' ;
import PropTypes from 'prop-types';

import dateFormat from 'date-fns/format' ;

import ConsultationsPager from './ConsultationsPager.js';

import YearJumper from '../navigation/YearJumper.js' ;

export default function WiredConsultationsList ( { match , year , page , perpage } ) {

	const now = new Date();
	page = match && match.params.page && parseInt(match.params.page,10) || page ;
	year = match && match.params.year || year || dateFormat(now, 'yyyy');

	const current = parseInt(year, 10);

	const begin = new Date(`${current}-01-01`);
	const end = new Date(`${current+1}-01-01`);

	const query = {
	  isDone: true,
	  payment_method: 'wire',
	  datetime: {
	    $gte : begin ,
	    $lt : end ,
	  },
	} ;

	const sort = {datetime: -1} ;

	return (
		<div>
			<YearJumper current={current} toURL={x => `/wires/${x}`}/>
			<ConsultationsPager
				root={`/wires/${year}`}
				url={match.url}
				page={page}
				perpage={perpage}
				query={query}
				sort={sort}
				itemProps={{showPrice: true}}
			/>
		</div>
	);
}

WiredConsultationsList.defaultProps = {
  page: 1,
  perpage: 10,
} ;

WiredConsultationsList.propTypes = {
	page: PropTypes.number.isRequired,
	perpage: PropTypes.number.isRequired,
};
