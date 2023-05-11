import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import React, { useState, useEffect } from 'react'
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
	layout: realExternalLayout=[],
	...props
}) => {

	const makeKey = i => `gridId${i.toString()}`

	const externalProperties = ["x","w","y"]

	const removeProperties = (layoutItem,properties=[]) => Object.fromEntries(Object.entries(layoutItem).filter(([k,v])=>!properties.includes(k)))
	const keepProperties = (layoutItem,properties=[]) => Object.fromEntries(Object.entries(layoutItem).filter(([k,v])=>properties.includes(k)))
	const removeUndefinedValues = (layoutItem) => Object.fromEntries(Object.entries(layoutItem).filter(([k,v])=>undefined !== v))

	const [activated, setActivated] = useState(false)
	const [externalLayout, setExternalLayout] = useState([])
	const [internalLayout, setInternalLayout] = useState([])

	const getLayout = () => {
		let newLayout = internalLayout || []
		externalLayout.forEach((externalItem,i)=>{
			const {h, ...ei} = externalItem //height is managed internally
			const id = makeKey(i)
			const existingItem = newLayout.find(l=>l.i===id)
			const newItem = {...existingItem,...ei}
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

	useEffect(()=>{
		// RGL has a bug where external layout changes will not be reflected unless the incorrect state is set briefly. This stores the expected external layout value, but changes after 200ms (transition time) if there are changes
		const externalLayoutChanges = recursiveDeepDiffs(externalLayout,realExternalLayout)
		if((externalLayoutChanges||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`External changes: ${JSON.stringify(externalLayoutChanges,null,4)}`)
			setTimeout(()=>{
				setExternalLayout(realExternalLayout)
			},200)
		}
	})
	const layout = JSON.parse(JSON.stringify(getLayout()))
	const setLayout = newLayout => {
		// Weird RGL bug if you alter layout while it is doing the internal preview. Transition time is 200ms
		setTimeout(()=>{
			if(activated){
				setExternalLayout(newLayout)
				props.setLayout && props.setLayout(newLayout)
			}
		},200)
	}
	// console.log(externalLayout,internalLayout,layout)


	const splitInternalAndExternalProperties = ls => {
		let els = []
		let ils = []
		ls.forEach((l,i)=>{
			const externalKeys = [...new Set([...externalProperties, ...Object.keys(externalLayout[i]||{})])]
			els.push(removeUndefinedValues(keepProperties(l,externalKeys)))
			ils.push(removeUndefinedValues(removeProperties(l,externalKeys)))
		})
		return [ils, els]
	}

	const onLayoutChange = (newLayout) => {
		const [oi, oe] = splitInternalAndExternalProperties(layout)
		const [ni, ne] = splitInternalAndExternalProperties(newLayout)

		const externalDiffs = recursiveDeepDiffs(oe,ne)
		const internalDiffs = recursiveDeepDiffs(oi,ni)

		if((externalDiffs||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`Changes: ${JSON.stringify(externalDiffs,null,4)}`)
			setLayout(ne)
		}
		if((internalDiffs||[]).some(d=>d && Object.keys(d).length)){
			// console.log(`Changes: ${JSON.stringify(internalDiffs,null,4)}`)
			setInternalLayout(ni)
		}
	}

	const gridItems = props.children.map((child,i)=>{
		const id = makeKey(i)
		const grid = layout.find(l=>l.i===id)
		return (
			<div key={id} className={classes['grid-item-container']}>
				<GridItem
					height={grid?.h}
					setHeight={(h)=>setInternalLayout(internalLayout.map(l=>l.i!==id ? l : {...l, h}))}
					className={classes['grid-item-componnent']}
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
				resizeHandles={['e']}
				margin={margin}
				onDragStart={()=>{if(!activated){setActivated(true)}}}
			>
				{gridItems}
			</RGL>
		</div>
		</DraggableContext.Provider>
	)
}

export default Grid
