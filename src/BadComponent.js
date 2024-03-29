import { Button } from '@execview/reusable'
import React, { useState, useEffect, useMemo } from 'react'

const getRandom = (n) => parseInt(n*Math.random())

const BadComponent = (props) => {
	const randomColour = useMemo(()=>`rgb(${getRandom(255)},${getRandom(255)},${getRandom(255)})`,[])
	const [large,small] = [300,150]
	const [forcedHeight, setForcedHeight] = useState(small)

	useEffect(()=>{
		setTimeout(()=>{
			setForcedHeight(large)
		},1000)
	},[])

	const badComponentStyle = {
		backgroundColor: randomColour,
		width: '100%',
		height: forcedHeight,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: '3em'
	}

	return (
		<div style={badComponentStyle}>
			<div>{`${props.i}`}</div>
			<Button onClick={()=>setForcedHeight(forcedHeight===small?large:small)}>Change height</Button>
		</div>
	)
}

export default BadComponent