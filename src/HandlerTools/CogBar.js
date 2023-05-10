import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import {RightClickMenuWrapper} from '@execview/reusable'
import classes from './CogBar.module.css'
import NonDraggable from './NonDraggable.js';

const CogBar = (props) => {
	return (
		<div className={classes['container']}>
			<div>
				<NonDraggable><FontAwesomeIcon className={classes['cog-icon']} icon={faCog}/></NonDraggable>
				<RightClickMenuWrapper onLeftClick takeParentLocation>{props.children}</RightClickMenuWrapper>	
			</div>
		</div>
	)
}

export default CogBar