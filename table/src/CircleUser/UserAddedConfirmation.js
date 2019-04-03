import React, { PureComponent } from 'react';
import TripleFill from './TripleFill';
import CircleUser from './CircleUser';
import './CircleUser.css';

export default class UserAddedConfirmation extends PureComponent {
  render() {
    return (
      <div className="confirmation-container">
        <div className="check-container">
          <i className="fas fa-check" />
        </div>
        <div className="confirmation-content">
          <p className="text-focus-in check-success">Success!</p>
          <p className="text-focus-in success-message">Users have been added successfully!</p>
          <ul className="added-list">
            {this.props.assignedUsers.map(id => (
              <li key={id} className="user-item">
                <TripleFill
                  left={<CircleUser url={this.props.getUserProfile(id).image} />}
                  center={<p className="user-name">{this.props.getUserProfile(id).name}</p>}
                  right={<button className="add-role-button" type="button" onClick={() => this.props.addRoleTo(id)}>Set role</button>}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}