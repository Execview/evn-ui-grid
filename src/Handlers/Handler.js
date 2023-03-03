import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import classes from './Handler.module.css';

import Draggable from '../HandlerTools/Draggable.js'

const Handler = (props) => {
	return (
		<div className={classes['container']}>
			<Draggable className={`${classes['handler-bar']}`}>
				<FontAwesomeIcon className={classes['drag-icon']} icon={faGripLines}/>
				{props.bar}
			</Draggable>
			{props.children}
		</div>
	)
}

export default Handler