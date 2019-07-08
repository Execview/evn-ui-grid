import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import classes from './TreeCell.module.css';

class TreeCell extends Component {	
  	render() {
		let arrow = <FontAwesomeIcon icon={faCaretDown} style={{width:'10px', opacity:'0'}}/>;

		// var closestElement = element.closest(selectors); 
		let showPointerStyle = {};
		if (this.props.data.nodeStatus === 'open') {
			arrow = <FontAwesomeIcon icon={faCaretDown} style={{width:'10px'}}/>
			showPointerStyle = {cursor: 'pointer'};
		} else if (this.props.data.nodeStatus === 'closed') {
			arrow = <FontAwesomeIcon icon={faCaretRight} style={{width:'10px'}}/>
			showPointerStyle = {cursor: 'pointer'};
		}
    	return (
			<div className={classes["cell-container"]} onClick={this.props.data.toggleNode} style={showPointerStyle}>
				<div style={{...this.props.style,width:this.props.style.width - 10, minHeight: this.props.style.minHeight - 10}} className={classes["cell-text"]}>										
					<p className={classes["tree-text"]} style={{marginLeft: 20 * this.props.data.depth}}>{arrow} {this.props.data.text}</p>					
				</div>
			</div>
		);
  	}
}

export default TreeCell;
