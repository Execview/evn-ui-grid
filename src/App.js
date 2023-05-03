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

	const [grids, setGrids] = useState([{x: 0},{w: 1, x: 1}])

	const numberOfItems = 2

	let childItems = []
	for(let i=0; i<numberOfItems; i++){
		const bar = <CogBar><div>Test</div></CogBar>
		const handler = i % 2 !== 0 ? <Handler bar={bar}/> : <EmptyHandler className={classes['empty-handler']}/>
		const content = <BadComponent i={i}/>
		const item = React.createElement(handler.type,{...handler.props},content)
		childItems.push(item)
	}
	const setLayout = (layout) => {
		// console.log(layout)
		setGrids(layout.map(l=>({...l, x: 1})))
		// setGrids(layout)
	}

	return (
		<div className={classes["main"]}>
			<div className={classes["grid-container"]}>
				<Grid
					cols={3}
					setLayout={setLayout}
					layout={grids}
				>
					{childItems}
				</Grid>
			</div>
		</div>
	);
}

export default App;
