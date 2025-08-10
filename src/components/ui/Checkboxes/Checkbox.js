import React, { Component } from 'react';

import style from './Checkboxes.module.css';

export default class Checkebox extends Component {
    
    constructor(props){
        super(props);
    }
    
    render() { 
        return (
            <label className={`${style.container} ${this.props.round ? style.round : ''}`}>
                <input type="checkbox" name={this.props.name} value={this.props.value} checked={this.props.checked} onChange={ this.props.onChange } />
                <span className={style.label}>{this.props.label}</span>
            </label>
        );
    }
}
