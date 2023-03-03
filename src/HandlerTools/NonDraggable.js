import React, { useContext } from 'react'
import DraggableContext from './DraggableContext.js'

const NonDraggable = (props) => {
	const nonDraggableClass = useContext(DraggableContext)?.nonDraggableClassName
	const {className, ...otherProps} = props
	return (
		<div className={`${nonDraggableClass||''} ${className||''}`} {...otherProps}>
			{props.children}
		</div>
	)
}
export default NonDraggable