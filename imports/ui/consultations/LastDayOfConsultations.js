import React from 'react';

import startOfToday from 'date-fns/startOfToday';
import startOfDay from 'date-fns/startOfDay';

import Loading from '../navigation/Loading';

import ConsultationsOfTheDay from './ConsultationsOfTheDay';

import useLastConsultation from './useLastConsultation';

const LastDayOfConsultations = () => {
	const {loading, consultation} = useLastConsultation();

	if (loading) return <Loading />;

	const consultationDate = consultation?.datetime
		? startOfDay(consultation.datetime)
		: startOfToday();

	return <ConsultationsOfTheDay day={consultationDate} />;
};

export default LastDayOfConsultations;
