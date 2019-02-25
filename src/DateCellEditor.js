import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default class DateCellEditor extends Component {
  render() {
    const selectedDate = this.props.text ? new Date(this.props.text) : new Date();
    const saveDate = this.props.text ? new Date(this.props.text).toISOString() : '';
    return (<div className="text-container"><DatePicker autoFocus onClickOutside={() => this.props.onValidateSave(saveDate)} selected={selectedDate} onSelect={date => this.props.onValidateSave(date.toISOString())} /></div>);
  }
}
// onBlur={() => this.props.onValidateSave(saveDate)}
// <input autoFocus className="date-input" type="date" name="bday" value={selectedDate} onChange={e => this.props.onValidateSave(new Date(e.target.value).toISOString())} />

// <DatePicker autoFocus onClickOutside={() => this.props.onValidateSave(saveDate)} selected={selectedDate} onSelect={date => this.props.onValidateSave(date.toISOString())} />
