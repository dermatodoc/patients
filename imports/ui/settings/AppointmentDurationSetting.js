import { withStyles } from '@material-ui/core/styles' ;

import React from 'react' ;

import { list } from '@aureooms/js-itertools' ;
import { filter } from '@aureooms/js-itertools' ;

import { msToString , units } from '../../client/duration.js' ;

import { settings } from '../../api/settings.js' ;

import InputManySetting from './InputManySetting.js' ;

const durationUnits = units ;

const styles = theme => ({

}) ;

const KEY = 'appointment-duration' ;

class AppointmentDurationSetting extends React.Component {

	render ( ) {

		const {
			className ,
		} = this.props ;

		return (
			<InputManySetting className={className}
				title="Appointment durations"
				label="Durations"
				setting={KEY}
				itemToString={x=>msToString(x)}
				createNewItem={x=>parseInt(x,10) * durationUnits.minute}
				placeholder="Give additional durations in minutes"
				inputTransform={input => list(filter(x => '0' <= x && x <= '9', input)).join('')}
			/>
		) ;
	}

}

let Component = AppointmentDurationSetting;

Component = withStyles( styles , { withTheme: true })(Component)

export default Component ;