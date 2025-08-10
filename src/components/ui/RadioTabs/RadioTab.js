import React, { Component } from 'react';

import style from './RadioTabs.module.css';

export default class RadioTab extends Component {
    constructor(props) {
        super(props);
    }

    render() { 
        return ( 
            <li>
                <label>
                    <input 
                        type="radio" 
                        checked={this.props.checked}
                        name={this.props.name} 
                        value={ this.props.value ? this.props.value : this.props.title }  
                        onChange={ this.props.onChange } 
                    />
                    <p>{ this.props.title }</p>
                    {this.props.desc &&
                        <span>{this.props.desc}</span>
                    }
                </label>
            </li>
         );
    }
}
