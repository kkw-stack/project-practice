import React, { Component } from 'react';

import style from './CopyIcon.module.css';

export default class CopyIcon extends Component {
    constructor(props) {
        super(props);
    }
    render() { 
        return ( 
            <div className={style.container}></div>
         );
    }
}
