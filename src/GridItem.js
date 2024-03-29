import React, { useLayoutEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector';

const GridItem = ({height, setHeight, className, children, ...otherProps}) => {
	const {height: measuredHeight, ref} = useResizeDetector()
	useLayoutEffect(()=>{
		if(measuredHeight && height && (measuredHeight !== height)) {
			setHeight && setHeight(measuredHeight)
		}
	})

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	)
}

export default GridItem