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
	test,
	...props
}) => {

	const {width, height, ref} = useResizeDetector()


	const makeKey = (i) => `gridId${i.toString()}`

	// const externalProperties = ["i","x","w"]
	const pointlessProperties = ["isBounded","isDraggable","isResizable","minW","maxW","minH","maxH","resizeHandles"]
	const internalProperties = ["externalHeight","h","y","moved","static",...pointlessProperties]

	const removeProperties = (layoutItem,properties=internalProperties) => Object.fromEntries(Object.entries(layoutItem).filter(([k,v])=>!properties.includes(k)))

	const [internalLayout, setInternalLayout] = useState({}) // stored heights for each item. items can change their own heights, but this is overriden by external grid setting.

	const getLayout = () => {
		let newLayout = []
		props.children.forEach((child,i)=>{
			if(!child){return}
			const {y,...childGridProps} = child?.props?.grid || {}
			const id = childGridProps.i || makeKey(i)
			const defaultLayout = {
				i: makeKey(i),
				x: 0,
				y: i, 
				w:defaultWidth,
				h: defaultHeight
			}
			let layoutItem = {
				...defaultLayout,
				...internalLayout[id],
				...childGridProps
			};
			if(childGridProps.h){layoutItem.externalHeight = childGridProps.h}
			newLayout.push(layoutItem)
		})
		return newLayout
	}

	const layout = JSON.parse(JSON.stringify(getLayout()))

	const onLayoutChange = (nl) => {
		const newLayout = nl.map(l=>removeProperties(l,pointlessProperties))
		const filteredOldLayout = layout.map(l=>removeProperties(l))
		const filteredNewLayout = newLayout.map(l=>removeProperties(l))
		filteredNewLayout.sort((a,b)=>a.y-b.y)

		const filteredDiffs = recursiveDeepDiffs(filteredOldLayout,filteredNewLayout)
		const normalDiffs = recursiveDeepDiffs(layout,newLayout)
		if((filteredDiffs||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`Changes: ${JSON.stringify(filteredDiffs,null,4)}`)
			props.setLayout && props.setLayout(filteredNewLayout)
		}
		if((normalDiffs||[]).some(d=>d && Object.keys(d).length)){
			// console.log(layout, newLayout, internalLayout)
			// console.log(`Changes: ${JSON.stringify(normalDiffs,null,4)}`)
			setInternalLayout(Object.fromEntries(newLayout.map(l=>[l.i,l])))
		}
	}


	const changeHeight = (key,height) => {
		const layoutItem = layout.find(l=>l.i===key)
		if(!layoutItem?.externalHeight){
			setInternalLayout({...internalLayout, [key]: {...internalLayout[key], h: height}})
		}
	}

	const onDrop = (l,o,n) => {
		const newPos = removeProperties(n)
		const oldPos = removeProperties(o)
		const differences = recursiveDeepDiffs(o,n)
		if(differences){
			// console.log(`Changes: ${JSON.stringify(differences,null,4)}`)
			props.onDrop && props.onDrop(newPos, oldPos)
		}
	}
	// console.log(layout)


	const gridItems = props.children.map((child,i)=>{
		const childGridProps = child?.props?.grid || {}
		const id = childGridProps.i || makeKey(i)
		return (
			<div key={id} className={classes['grid-item-container']} data-grid={layout.find(l=>l.i===id)}>
				<GridItem
					height={layout.find(l=>l.i===id)?.h}
					setHeight={(h)=>changeHeight(id,h)}
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
		<div ref={ref} className={classes['grid-container']}>
			<ReactGridLayout
				draggableHandle={`.${draggableClassName}`}
				draggableCancel={`.${nonDraggableClassName}`}
				cols={cols}
				rowHeight={1}
				layout={layout}
				onLayoutChange={onLayoutChange}
				onDragStop={onDrop}
				resizeHandles={['e']}
				width={width}
				height={height}
				margin={margin}
			>
				{gridItems}
			</ReactGridLayout>
		</div>
		</DraggableContext.Provider>
	)
}

export default Grid
