import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import {RightClickMenuWrapper} from '@execview/reusable'
import classes from './CogBar.module.css'

const CogBar = (props) => {
	return (
		<div className={classes['bar-content']}>
			<div>
				<FontAwesomeIcon className={classes['cog']} icon={faCog}/>
				<RightClickMenuWrapper onLeftClick>{props.children}</RightClickMenuWrapper>
			</div>		
		</div>
	)
}

export default CogBar