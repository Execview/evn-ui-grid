import React, { useContext } from 'react'
import DraggableContext from './DraggableContext.js'

const Draggable = (props) => {
	const draggableClass = useContext(DraggableContext)
	const {className, ...otherProps} = props
	return (
		<div className={`${draggableClass||''} ${className}`} {...otherProps}>
			{props.children}
		</div>
	)
}
export default Draggable