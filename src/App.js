import React, { useState } from 'react';
import BadComponent from './BadComponent.js'
import Grid from './Grid.js';
import classes from './App.module.css';
import Handler from './Handlers/Handler.js';
import EmptyHandler from './Handlers/EmptyHandler.js'
import CogBar from './HandlerTools/CogBar.js'

import { useThemeApplier, defaultTheme } from '@execview/themedesigner'

const App = (props) => {
	useThemeApplier(defaultTheme)

	const [grids, setGrids] = useState({})

	const numberOfItems = 2

	let childItems = []
	for(let i=0; i<numberOfItems; i++){
		const bar = <CogBar><div>Test</div></CogBar>
		const grid = grids[i.toString()]
		// const grid = {h: 50} // set this to override internally stored heights
		const handler = i % 2 !== 0 ? <Handler bar={bar} grid={grid}/> : <EmptyHandler className={classes['empty-handler']} grid={grid}/>
		const content = <BadComponent i={i}/>
		const item = React.createElement(handler.type,{...handler.props},content)
		childItems.push(item)
	}

	const setLayout = (layout) => {
		console.log(layout)
		setGrids(Object.fromEntries(layout.map(l=>[l.i,l])))
	}

	const onDrop = (n,o) => {
		console.log(n,o)
	}

	return (
		<div className={classes["main"]}>
			<div className={classes["grid-container"]}>
				<Grid
					cols={2}
					setLayout={setLayout}
					onDrop={onDrop}
				>
					{childItems}
				</Grid>
			</div>
		</div>
	);
}

export default App;
