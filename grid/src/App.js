import React from 'react';
import BadComponent from './BadComponent'
import Grid from './Grid';
import classes from './App.module.css';
import Handler from './Handlers/Handler';
import EmptyHandler from './Handlers/EmptyHandler'
import CogBar from './HandlerTools/CogBar'


import { useThemeApplier, defaultTheme } from '@execview/themedesigner'

const App = (props) => {
	useThemeApplier(defaultTheme)

	let childItems = []
	for(let i=0; i<20; i++){
		const bar = <CogBar><div>Test</div></CogBar>
		const handler = i % 2 === 0 ? <Handler bar={bar}/> : <EmptyHandler className={classes['empty-handler']} />
		const content = <BadComponent i={i}/>
		const item = React.createElement(handler.type,{key: i,...handler.props},content)
		childItems.push(item)
	}

	return (
		<div className={classes["main"]}>
			<div className={classes["grid"]}>
				<Grid cols={2} margin={[0,40]}>
					{childItems}
				</Grid>
			</div>
		</div>
	);
}

export default App;
