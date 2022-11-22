import React from 'react'
import Draggable from '../HandlerTools/Draggable.js'

const EmptyHandler = (props) => {
	return (
		<Draggable className={`${props.className}`}>{props.children}</Draggable>
	)
}

export default EmptyHandler