import React, { Component } from 'react';
import Cell from '../cell/Cell';
import InputCellDisplay from '../inputCell/InputCellDisplay';
import InputCellEditor from '../inputCell/InputCellEditor';
import './Row.css';


export default class Row extends Component {
  render() {
    const editableCells = this.props.editableCells || [];
    const columnsInfo = this.props.columnsInfo || Object.keys(this.props.rowData).reduce((total, objKey) => { return { ...total, [objKey]: { cellType: 'text', colTitle: objKey } }; }, {});
    const invalidCells = this.props.invalidCells || [];
    const widths = this.props.widths || Object.keys(columnsInfo).reduce((total, objKey) => { return { ...total, [objKey]: 200 }; }, {});
    const onSetActive = this.props.onSetActive || (() => { console.log('row needs onSetActive brah, which sets a cell active'); });
    const cellTypes = this.props.cellTypes || { text: { display: <InputCellDisplay />, editor: <InputCellEditor /> } };
    const rules = this.props.rules || {};
    const onMouseDown = this.props.onMouseDown || (() => false);
    return (
      Object.keys(columnsInfo).map((col, index) => {
        const editRights = editableCells.includes(col);
        const red = invalidCells.includes(col);

        const isActive = (col === this.props.activeColumn && editRights);

        const onClickAction = isActive ? null : (() => onSetActive(this.props.rowId, col));
        const lastOne = index === Object.keys(columnsInfo).length - 1;
        let style = { width: widths[col] - 10 };
        if (!this.props.wrap) {
          style = { ...style, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
        }
        const errorText = rules[columnsInfo[col].rule] ? rules[columnsInfo[col].rule].errorMessage : null;
        return (
          <td key={col + this.props.rowId}>
            {!lastOne && this.props.onMouseDown && <div style={{ position: 'absolute', zIndex: 1, transform: 'translateX(7px)', top: 0, right: 0, height: '100%', width: '15px', cursor: 'w-resize' }} onMouseDown={e => onMouseDown(e, col)} /> }
            <div
              title={columnsInfo[col].colTitle}
              className={(isActive ? 'active-cell' : 'table-label ') + (editRights ? '' : 'no-edit')}
              onClick={onClickAction}
            >
              <Cell
                style={style}
                data={this.props.rowData[col]}
                type={cellTypes[columnsInfo[col].cellType]}
                isActive={isActive}
                onValidateSave={this.props.onValidateSave}
                errorText={red ? errorText : null}
              />
            </div>
          </td>
        );
      })
    );
  }
}