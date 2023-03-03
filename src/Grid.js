import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import React, { useState, useEffect, useMemo } from 'react'
import ReactGridLayout from 'react-grid-layout'
import {recursiveDeepDiffs} from '@execview/reusable'
import GridItem from './GridItem.js'
import { useResizeDetector } from 'react-resize-detector';
import DraggableContext from './HandlerTools/DraggableContext.js'
import classes from './Grid.module.css'
import './Grid.css'

const Grid = ({
	draggableClassName=classes['draggable-handle'],
	nonDraggableClassName=classes['non-draggable-handle'],
	cols,
	defaultHeight=200,
	defaultWidth=1,
	margin=[0,0],
	...props
}) => {

	const {width, height, ref} = useResizeDetector()


	const makeKey = (i) => i.toString()
	const filterProperties = ["externalHeight","minW","maxW","minH","maxH","moved","static","isDraggable","isResizable"]

	const [heights, setHeights] = useState({}) // stored heights for each item. items can change their own heights, but this is overriden by external grid setting.

	const getLayout = () => {
		let newLayout = []
		const maxYSoFar = Math.max(...props.children.map(child=>((child && child.props && child.props.grid && child.props.grid.y) || 0)))
		props.children.forEach((child,i)=>{
			if(!child){return}
			const childGridProps = child?.props?.grid || {}
			let layoutItem = {
				i: makeKey(i),
				x: 0,
				y:maxYSoFar+i, 
				w:defaultWidth,
				h: heights[makeKey(i)] || defaultHeight,
				...childGridProps
			};
			if(childGridProps.h){layoutItem.externalHeight = childGridProps.h}
			newLayout.push(layoutItem)
		})
		return newLayout
	}

	const externalSetLayout = (newLayout) => {
		const filteredOldLayout = layout.map(l=>removeTheirProperties(l))
		const filteredNewLayout = newLayout.map(layoutItem=>removeTheirProperties(layoutItem))
		filteredNewLayout.sort((a,b)=>a.i-b.i)

		const differences = recursiveDeepDiffs(filteredOldLayout,filteredNewLayout)
		if((differences||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`Changes: ${JSON.stringify(differences,null,4)}`)
			props.setLayout && props.setLayout(filteredNewLayout)
		}
	}

	const [layout, setLayout] = [getLayout(), externalSetLayout]

	const removeTheirProperties = (layoutItem,exceptions=[]) => {
			const propertiesToFilter = filterProperties.filter(p=>!exceptions.includes(p))
			let newLayoutItem = layoutItem || {}
			propertiesToFilter.forEach(p=>{
				const {[p]:_, ...rest} = newLayoutItem
				newLayoutItem = rest
		})
		return newLayoutItem
	}

	const changeHeight = (key,height) => {
		const layoutItem = layout.find(l=>l.i===key)
		if(!layoutItem?.externalHeight){
			setHeights({...heights, [key]: height})
		}
		setLayout(layout.map(el=>el.i!==key ? el : {...el, h: height}))
	}

	const onDrop = (l,o,n) => {
		const newPos = removeTheirProperties(n)
		const oldPos = removeTheirProperties(o)
		props.onDrop && props.onDrop(newPos, oldPos)
	}

	return (
		<DraggableContext.Provider value={{
			draggableClassName: draggableClassName,
			nonDraggableClassName: nonDraggableClassName
		}}>
		<div ref={ref} className={classes['grid-container']}>
			<ReactGridLayout
				draggableHandle={`.${draggableClassName}`}
				draggableCancel={`.${nonDraggableClassName}`}
				cols={cols}
				rowHeight={1}
				layout={layout}
				onLayoutChange={(newLayout) => setLayout(newLayout)}
				onDragStop={onDrop}
				resizeHandles={['e']}
				width={width}
				height={height}
				margin={margin}
			>
				{props.children.map((child,i)=>{
					const key = makeKey(i)
					return (
						<div key={key} className={classes['grid-item-container']}>
							<GridItem
								k={key}
								height={layout.find(l=>l.i===key)?.h}
								setHeight={(h)=>changeHeight(key,h)}
								className={classes['grid-item-componnent']}
							>
								{child}
							</GridItem>
						</div>	
						
					)
				})}
			</ReactGridLayout>
		</div>
		</DraggableContext.Provider>
	)
}

export default Grid
