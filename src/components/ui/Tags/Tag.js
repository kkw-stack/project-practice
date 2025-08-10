import React, { Component } from 'react';

import style from './Tags.module.css';

class Tag extends Component {
    constructor(props){
        super(props)
    }
    render() { 
        return ( 
            <button onClick={this.props.onClick} className={`${style.item} ${this.props.active ? style.active : '' }`} type="button"><span>{this.props.children}</span></button>
         );
    }
}
 
export default Tag;