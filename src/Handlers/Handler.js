import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import classes from './Handler.module.css';

import Draggable from '../HandlerTools/Draggable.js'
import withGridItemClassName from '../HandlerTools/withGridItemClassName.js'

const GridItemClassName = classes['grid-item']
const GridItemChildClassName = classes['child-item']

const Handler = (props) => {
	return (
		<div className={classes['handler']}>
			<Draggable className={`${classes['handler-bar']}`}>
				<FontAwesomeIcon className={classes['drag-icon']} icon={faGripLines}/>
				{props.bar}
			</Draggable>
			{props.children}
			<div className={classes['resizer']}>
				<div className={classes['resize-icon']} />
			</div>
		</div>
	)
}

export default withGridItemClassName(Handler, GridItemClassName, GridItemChildClassName)