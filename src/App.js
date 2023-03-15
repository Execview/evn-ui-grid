import React, { useState } from 'react';
import BadComponent from './BadComponent.js'
import Grid from './Grid.js';
import classes from './App.module.css';
import Handler from './Handlers/Handler.js';
import EmptyHandler from './Handlers/EmptyHandler.js'
import CogBar from './HandlerTools/CogBar.js'

import { useThemeApplier, defaultTheme } from '@execview/themedesigner'
import { Button } from '@execview/reusable';

const App = (props) => {
	useThemeApplier(defaultTheme)

	const [test, setTest] = useState(0)

	const [grids, setGrids] = useState({})

	const numberOfItems = 2

	let childItems = []
	for(let i=0; i<numberOfItems; i++){
		const bar = <CogBar><div>Test</div></CogBar>
		const grid = grids[`gridId${i.toString()}`]
		// const grid = {h: 50} // set this to override internally stored heights
		const handler = i % 2 !== 0 ? <Handler bar={bar} grid={grid}/> : <EmptyHandler className={classes['empty-handler']} grid={grid}/>
		const content = <BadComponent i={i}/>
		const item = React.createElement(handler.type,{...handler.props},content)
		childItems.push(item)
	}

	const setLayout = (layout) => {
		console.log(layout)
		setGrids(Object.fromEntries(layout.map(l=>[l.i,{...l, x: 2}])))
	}

	const onDrop = (n,o) => {
		// console.log(n,o)
	}

	return (
		<div className={classes["main"]}>
			<div className={classes["grid-container"]}>
				<Grid
					cols={2}
					setLayout={setLayout}
					onDrop={onDrop}
					test={test}
				>
					{childItems}
				</Grid>
			</div>
			<Button onClick={()=>setTest(test+1)}>Click</Button>
		</div>
	);
}

export default App;
