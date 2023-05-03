import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import React, { useState, useEffect, useMemo } from 'react'
import ReactGridLayout from 'react-grid-layout'
import {recursiveDeepDiffs} from '@execview/reusable'
import GridItem from './GridItem.js'
import { withResizeDetector } from 'react-resize-detector';
import DraggableContext from './HandlerTools/DraggableContext.js'
import classes from './Grid.module.css'
import './Grid.css'

const RGL = withResizeDetector(ReactGridLayout)

const Grid = ({
	draggableClassName=classes['draggable-handle'],
	nonDraggableClassName=classes['non-draggable-handle'],
	cols,
	defaultHeight=200,
	defaultWidth=1,
	margin=[0,0],
	layout: externalLayout=[],
	...props
}) => {

	const makeKey = (i) => `gridId${i.toString()}`

	const externalProperties = ["x","w","y"]
	const pointlessProperties = ["isBounded","isDraggable","isResizable","minW","maxW","minH","maxH","resizeHandles"]
	const internalProperties = ["externalHeight","h","moved","static"]

	const removeProperties = (layoutItem,properties=[]) => Object.fromEntries(Object.entries(layoutItem).filter(([k,v])=>!properties.includes(k)))

	const [internalLayout, setInternalLayout] = useState([])

	const getLayout = () => {
		let newLayout = internalLayout || []
		externalLayout.forEach((externalItem,i)=>{
			const id = externalItem.i || makeKey(i)
			const existingItem = newLayout.find(l=>l.i===id)
			const newItem = {...existingItem,...externalItem}
			if(existingItem){
				newLayout = newLayout.map(l=>l.i!==id ? l : newItem)
			} else {
				newLayout =  [...newLayout, newItem]
			}
		})
		newLayout = newLayout.map((item,i)=>{
			const defaultLayout = {
				i: makeKey(i),
				x: 0,
				y: i, 
				w:defaultWidth,
				h: defaultHeight
			}
			return {...defaultLayout, ...item}
		})
		return newLayout
	}

	const layout = JSON.parse(JSON.stringify(getLayout()))
	console.log(externalLayout,internalLayout,layout)

	const onLayoutChange = (newLayout) => {

		const filteredOldLayout = layout.map(l=>removeProperties(l,[...internalProperties,...pointlessProperties]))
		const filteredNewLayout = newLayout.map(l=>removeProperties(l,[...internalProperties,...pointlessProperties]))
		const filteredDiffs = recursiveDeepDiffs(filteredOldLayout,filteredNewLayout)
		if((filteredDiffs||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`Changes: ${JSON.stringify(filteredDiffs,null,4)}`)
			props.setLayout && props.setLayout(filteredNewLayout)
		}

		const filteredInternalOldLayout = layout.map(l=>removeProperties(l,[...externalProperties,...pointlessProperties]))
		const filteredInternalNewLayout = newLayout.map(l=>removeProperties(l,[...externalProperties,...pointlessProperties]))
		const filteredInternalDiffs = recursiveDeepDiffs(filteredInternalOldLayout,filteredInternalNewLayout)
		if((filteredInternalDiffs||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`Changes: ${JSON.stringify(filteredInternalDiffs,null,4)}`)
			setInternalLayout(filteredInternalNewLayout)
		}
	}

	const onDrop = (l,o,n) => {
		const newPos = removeProperties(n,[...internalProperties,...pointlessProperties])
		const oldPos = removeProperties(o,[...internalProperties,...pointlessProperties])
		const differences = recursiveDeepDiffs(o,n)
		if(differences){
			// console.log(`Changes: ${JSON.stringify(differences,null,4)}`)
			props.onDrop && props.onDrop(newPos, oldPos)
		}
	}

	const gridItems = props.children.map((child,i)=>{
		const childGridProps = child?.props?.grid || {}
		const id = childGridProps.i || makeKey(i)
		return (
			<div key={id} className={classes['grid-item-container']} data-grid={layout.find(l=>l.i===id)}>
				<GridItem
					height={layout.find(l=>l.i===id)?.h}
					setHeight={(h)=>setInternalLayout(internalLayout.map(l=>l.i!==id ? l : {...l, h}))}
					className={classes['grid-item-componnent']}
					data-grid={layout.find(l=>l.i===id)}
				>
					{child}
				</GridItem>
			</div>	
			
		)
	})

	return (
		<DraggableContext.Provider value={{
			draggableClassName: draggableClassName,
			nonDraggableClassName: nonDraggableClassName
		}}>
		<div className={classes['grid-container']}>
			<RGL
				draggableHandle={`.${draggableClassName}`}
				draggableCancel={`.${nonDraggableClassName}`}
				cols={cols}
				rowHeight={1}
				layout={layout}
				onLayoutChange={onLayoutChange}
				onDragStop={onDrop}
				resizeHandles={['e']}
				margin={margin}
			>
				{gridItems}
			</RGL>
		</div>
		</DraggableContext.Provider>
	)
}

export default Grid
