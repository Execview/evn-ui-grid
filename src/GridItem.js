import React from 'react'
import ReactResizeDetector from 'react-resize-detector';

const GridItem = (props) => {
	return (
		<div className={props.className}>
			<ReactResizeDetector handleWidth handleHeight onResize={(w,h)=>props.onResize && props.onResize(h)}>
				<div>
					{props.children}
				</div>	
			</ReactResizeDetector>
		</div>
	)
}

export default GridItem