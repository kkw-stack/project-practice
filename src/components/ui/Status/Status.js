import React, { Component } from 'react';

import style from './Status.module.css';

export default class Status extends Component {

    render() { 
        return ( 
            <div className={`${style.container} ${this.props.active ? style.active : ''} ${this.props.eng ? style.eng : ''}`}>
                <span className={style.inner}>{this.props.children}</span>
            </div>
         );
    }

}