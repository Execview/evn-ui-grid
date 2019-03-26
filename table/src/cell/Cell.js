import React, { Component } from 'react';
import InputCellDisplay from '../inputCell/InputCellDisplay';
import InputCellEditor from '../inputCell/InputCellEditor';
import { recursiveDeepDiffs } from '../functions';


export default class Cell extends Component {
  shouldComponentUpdate(nextProps) {
    const filterReactComponent = (c) => {
      const { _owner, $$typeof, ...rest } = c;
      return rest;
    };
    const stopRecursion = (o, u) => {
      if (React.isValidElement(o) && React.isValidElement(u)) {
        if (recursiveDeepDiffs(filterReactComponent(o), filterReactComponent(u), { stopRecursion })) {
          return 'updated';
        }
        return 'ignore';
      }
      return 'continue';
    };
    const diffs = recursiveDeepDiffs(this.props, nextProps, { stopRecursion });
    if (!diffs) { return false; }
    return true;
  }
  // dd && (!o || Object.keys(dd).length !== 0)

  render() {
    const data = this.props.data || '';
    const errorText = this.props.errorText || this.props.errorText === '' ? this.props.errorText : null;
    const style = this.props.style || {};
    const type = {};
    type.display = (this.props.type && this.props.type.display) || <InputCellDisplay />;
    type.editor = (this.props.type && this.props.type.editor) || <InputCellEditor />;
    const onValidateSave = this.props.onValidateSave || (() => { console.log('cell needs onValidateSave brah'); });
    if (this.props.isActive) {
      return (
        React.createElement(type.editor.type, { ...type.editor.props, data, onValidateSave, errorText, style }));
    }
    return (
      React.createElement(type.display.type, { ...type.display.props, data, onValidateSave, errorText, style }));
  }
}
