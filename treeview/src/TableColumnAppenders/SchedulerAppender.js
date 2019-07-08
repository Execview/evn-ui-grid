import React, { useState, useEffect } from 'react';
import SchedulerCell from '../schedulerCell/SchedulerCell'
import SchedulerHeader from '../schedulerCell/SchedulerHeader';
import { recursiveDeepDiffs, objectCopierWithStringToDate } from '@execview/reusable';

import { getDrawnLinksFromData, getSnaps, getTimeFormatString, getMajorStartOf } from './SchedulerBehavior'
import { getColourFromMap } from './BubbleBehavior'
import {getNearestSnapXToDate, getInternalMousePosition, getNearestDateToX, getYPositionFromRowNumber} from './schedulerFunctions'
import { UNSATColours } from './colourOptions'


var Rx = require('rxjs/Rx')
var moment = require('moment')

const mousepositionstream = Rx.Observable.fromEvent(document,'pointermove').merge(Rx.Observable.fromEvent(document,'pointerdown'))

const SchedulerAppender = (props) => {

	useEffect(()=>{
		const mouseSubscription = mousepositionstream.subscribe((event)=>mouseEvent(event))
		return ()=>{mouseSubscription.unsubscribe()}
	})

	const colours = UNSATColours	
	const rowHeight = props.height || 25	
	const bubbleHeight = rowHeight*0.9
	const timeWidth = props.timeWidth || 80
	const extrasnaps = props.extrasnaps || 2
	const highlightcolour = 'Grey'

	const [rowHeights, setRowHeights] = useState([])
	const [schedulerWidth, setSchedulerWidth] = useState(0)

	const [bubbleContextMenuKeyAndPosition, setBubbleContextMenuKeyAndPosition] = useState({key:null,position:null})
	const [mouseDownOnBubble, setMouseDownOnBubble] = useState({key:'',location:'',dragDiffs:[0,0]})
	const [mouseDownOnScheduler, setMouseDownOnScheduler] = useState(null)

	const [schedulerStart, actuallySetSchedulerStart] = useState(new Date('12/12/2018'))
	const [schedulerResolution, actuallySetSchedulerResolution] = useState('day')

	const getShiftedStart = (d,r) => {
		return moment(d).startOf(r).toDate()
	}

	const setSchedulerStart = (date) => {
		const d = getShiftedStart(date,schedulerResolution)
		actuallySetSchedulerStart(d)
	}
	
	const setSchedulerResolution = (res) => {
		actuallySetSchedulerResolution(res)
		actuallySetSchedulerStart(getShiftedStart(schedulerStart,res))
	}

	const tableRef= React.createRef();

	const snaps = getSnaps(schedulerStart, schedulerResolution, schedulerWidth, timeWidth, extrasnaps)

	
	//#region Mouse Interactions
	const bubbleclickdown = (key,event,side)=>{
		setMouseDownOnBubble({key:key, location:side, dragDiffs:[0,0]})
		props.setBubbleSideColour(key,highlightcolour,side)
	}

	const bubblemiddleclickdown = (key,event,side)=>{		
		const mousedownpos = getInternalMousePosition(event)
		const dragDiffs =[
			mousedownpos[0]-getNearestSnapXToDate(props.data[key].startdate,snaps),
			mousedownpos[0]-getNearestSnapXToDate(props.data[key].enddate,snaps)
		]
		setMouseDownOnBubble({key, location:side, dragDiffs})
	}

	const bubbleclickup = (key,event,side)=>{
		if(key !== mouseDownOnBubble.key){
			props.tryPerformLink(key, mouseDownOnBubble.key, side, mouseDownOnBubble.location);
		}
		props.setOriginalColour(key, side)
	}
	const bubblemiddleclickup = (key,event, side)=>{
		if(!['left','right'].includes(mouseDownOnBubble.location) && key!==mouseDownOnBubble.key){
			props.tryPerformAssociation(key, mouseDownOnBubble.key);
		}
		props.setOriginalColour(key,'left'); props.setOriginalColour(key,'middle'); props.setOriginalColour(key,'right')
	}

	const bubblemousein = (key, event, side)=>{if(	event.buttons!==0 && mouseDownOnBubble.key!==key && mouseDownOnBubble.location!=='middle'){
		props.setBubbleSideColour(key, highlightcolour, side)}
	}
	const bubblemiddlemousein = (key,event)=>{if(event.buttons!==0 && mouseDownOnBubble.key!==key && mouseDownOnBubble.location==='middle'){
		props.setBubbleSideColour(mouseDownOnBubble.key,props.data[key].colours.original,'middle')}
	}
	
	const bubblemouseout = (key,event, side)=>{if(event.buttons!==0 && mouseDownOnBubble.key!==key && mouseDownOnBubble.location!=='middle'){
		props.setOriginalColour(key,side)}}
	const bubblemiddlemouseout = (key,event)=>{if(event.buttons!==0 && mouseDownOnBubble.key!==key && mouseDownOnBubble.location==='middle'){
		props.setOriginalColour(key,'middle');
		props.setOriginalColour(mouseDownOnBubble.key,'middle')}}

	const bubbleOnContextMenu = (key,event)=>{
		event.preventDefault();
		const position = getInternalMousePosition(event)
		setBubbleContextMenuKeyAndPosition({key:key, position:position});
		
	}

	const mouseEvent = (event) => {
		const key = mouseDownOnBubble.key
		if(mouseDownOnScheduler){event.preventDefault()}
		var mouse = getInternalMousePosition(event)
		var bubble=props.data[key];
		if(event.buttons===0) {
			if(key){
				props.setOriginalColour(key,'left'); props.setOriginalColour(key,'right'); props.setOriginalColour(key,'middle')
				setMouseDownOnBubble({key:'',location:'',dragDiffs:[0,0]})
			}
		}
		const nearestDateToX = getNearestDateToX(mouse[0] - mouseDownOnBubble.dragDiffs[0],snaps)
		
		if(mouseDownOnBubble.location==='left' && !event.shiftKey && nearestDateToX.getTime()!==props.data[key].startdate.getTime()){
			props.tryBubbleTransform(key, {startdate: nearestDateToX})}
		if(mouseDownOnBubble.location==='right' && !event.shiftKey && nearestDateToX.getTime()!==props.data[key].enddate.getTime()){
			props.tryBubbleTransform(key, {enddate: nearestDateToX})}
		if(mouseDownOnBubble.location==='middle' && !event.shiftKey && nearestDateToX.getTime()!==props.data[key].startdate.getTime()){
			props.tryBubbleTransform(key, {startdate: nearestDateToX, enddate: moment(nearestDateToX).add(bubble.enddate-bubble.startdate).toDate()})
		}
		//check column interaction.
		if((event.buttons===0 && mouseDownOnScheduler) || key){setMouseDownOnScheduler(null)}
		if(event.buttons===1 && !key && mouseDownOnScheduler){
			const mousedate = getNearestDateToX(mouse[0],snaps)
			const datediff = (mousedate-mouseDownOnScheduler)
			if(datediff !== 0) {
				const newstart = moment(schedulerStart.getTime() - datediff).toDate()
				setSchedulerStart(newstart)
			}
		}
	}

	const clickedOnScheduler = (event) => {
		if(mouseDownOnBubble.key==="") {
			const mouse = getInternalMousePosition(event)
			const XDownDate = getNearestDateToX(mouse[0],snaps)
			setMouseDownOnScheduler(XDownDate)
		}
	}
	//#endregion

	const addSchedulerColumn = ()=>{
		const contextMenuPosition = bubbleContextMenuKeyAndPosition.position && [bubbleContextMenuKeyAndPosition.position[0],getYPositionFromRowNumber(Object.keys(props.data).indexOf(bubbleContextMenuKeyAndPosition.key)+1,rowHeights)+bubbleContextMenuKeyAndPosition.position[1]]
		const schedulerheaderdata = {
			snaps: snaps,
			tableHeight: rowHeights.reduce((total,rh)=>total+rh,0),
			links: getDrawnLinksFromData(props.data,((i)=>getYPositionFromRowNumber(i,rowHeights)+bubbleHeight/2),snaps),
			getWidth: ((w)=>{if(w!==schedulerWidth){setSchedulerWidth(w)}}),
			mouseOnScheduler: clickedOnScheduler,
			timeFormatString: getTimeFormatString(schedulerResolution),
			contextMenu: {
				position: contextMenuPosition,
				closeMenu: ()=>{setBubbleContextMenuKeyAndPosition({key:null,position:null})},
				options: {
					removeLink: <div onClick={()=>props.onRemoveLink(bubbleContextMenuKeyAndPosition.key)}>Remove Link</div>, 
					deleteSingle: <div onClick={()=>props.deleteSingle(bubbleContextMenuKeyAndPosition.key)}>Delete Single</div>,
					deleteBubble: <div onClick={()=>props.deleteBubble(bubbleContextMenuKeyAndPosition.key)}>Delete Bubble</div> }
			},
			schedulerOptions: {
				mode: [schedulerResolution,((r)=>setSchedulerResolution(r))],
				start: [schedulerStart, ((date)=>setSchedulerStart(date))]
			}
		}
		const newColumnsInfo = {...props.columnsInfo, scheduler: {cellType: 'scheduler', width: 65, height: rowHeight, headerType: 'schedulerHeader', headerData: schedulerheaderdata}}
		return newColumnsInfo
	}

	const addSchedulerData = ()=>{
		let tableData = {...props.data}
		for(const rowId in tableData ){
			const shadow = rowId===mouseDownOnBubble.key ? true : false
			tableData[rowId] = {...tableData[rowId],
				scheduler:{
					//Bubble Data
					bkey: rowId,
					startpoint: [getNearestSnapXToDate(tableData[rowId].startdate,snaps),0],
					endpoint: [getNearestSnapXToDate(tableData[rowId].enddate,snaps),bubbleHeight],
					colour: getColourFromMap(tableData[rowId].colours.middle,colours),
					leftcolour: getColourFromMap(tableData[rowId].colours.left,colours),
					rightcolour: getColourFromMap(tableData[rowId].colours.right,colours),
					leftclickdown: ((k,e)=>bubbleclickdown(k,e,'left')),
					rightclickdown:((k,e)=>bubbleclickdown(k,e,'right')),
					middleclickdown:((k,e)=>bubblemiddleclickdown(k,e,'middle')),
					leftclickup:((k,e)=>bubbleclickup(k,e,'left')),
					rightclickup:((k,e)=>bubbleclickup(k,e,'right')),
					middleclickup:((k,e)=>bubblemiddleclickup(k,e,'middle')),
					leftmousein:((k,e)=>bubblemousein(k,e,'left')),
					rightmousein:((k,e)=>bubblemousein(k,e,'right')),
					middlemousein:((k,e)=>bubblemiddlemousein(k,e,'middle')),
					leftmouseout:((k,e)=>bubblemouseout(k,e,'left')),					
					rightmouseout:((k,e)=>bubblemouseout(k,e,'right')),					
					middlemouseout:((k,e)=>bubblemiddlemouseout(k,e,'middle')),
					onContextMenu:((k,e)=>bubbleOnContextMenu(k,e)),
					text:tableData[rowId].activityTitle,
					shadow: shadow,
					mouseOnScheduler: clickedOnScheduler,
					shape: tableData[rowId].shape
				}
			}
		}
		return tableData
	}	

	const onSaveScheduler = (rowId, rowValues, editableValues) => {
		const row = props.data[rowId]
		const tableRowValues = Object.keys(row).reduce((total,col)=>{return {...total,[col]:rowValues[col]}},{})
		const newRowValues = objectCopierWithStringToDate(tableRowValues)
		const changes = recursiveDeepDiffs(row,newRowValues)
		props.tryBubbleTransform(rowId,changes,editableValues)
	}

	const onTableRender = ()=>{
		const getRowHeights = (ref)=>{
			return (ref && ref.current) ? [...ref.current.getElementsByTagName('tr')].map(el=>el.clientHeight) : []
		}
		const newRowHeights = getRowHeights(tableRef);
		if(JSON.stringify(rowHeights)!==JSON.stringify(newRowHeights)){
			setRowHeights(newRowHeights)
		}
	}

	const {tryBubbleTransform,setBubbleSideColour,setOriginalColour,tryPerformLink,tryPerformAssociation,onRemoveLink,deleteBubble,...newProps} = props
	return (
		React.cloneElement(newProps.children,
			{...newProps,
				children: newProps.children && newProps.children.props.children,
				data: addSchedulerData(),
				columnsInfo: addSchedulerColumn(),
				cellTypes: {...newProps.cellTypes, schedulerHeader: {display: <SchedulerHeader/>}, scheduler: {display: <SchedulerCell/>}},
				tableRef: tableRef,
				onRender: ((x)=>{(newProps.onRender && newProps.onRender(x));onTableRender()}),
				onSave: ((rowId, rowValues, editableValues)=>{( props.onSave && props.onSave(rowId, rowValues, editableValues)); onSaveScheduler(rowId, rowValues, editableValues); })
			}
		)
	);
}

export default SchedulerAppender