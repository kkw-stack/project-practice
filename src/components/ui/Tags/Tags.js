import React, { Component } from 'react';

import style from './Tags.module.css';

export default class Tags extends Component {
    constructor(props){
        super(props)
    }
    render() { 
        return ( 
        <div className={style.container}>
            {this.props.children}
        </div>
         );
    }
}