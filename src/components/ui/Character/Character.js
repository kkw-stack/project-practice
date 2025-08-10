import React, { Component } from 'react';

import style from './Character.module.css';

export default class Character extends Component {

    render() { 
        const type = ( this.props.type ? this.props.type : 'default' );

        return ( 
            <div className={`${style.container} ${this.props.useMarginTop ? style.useMarginTop : ''}`} >
                <div className={`${style.img}  ${style[type]}`} ></div>
                <div className={style.text}>{this.props.text}</div>
            </div>
         );
    }
    
}
 