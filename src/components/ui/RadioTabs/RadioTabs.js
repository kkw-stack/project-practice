import React, { Component } from 'react';

import style from './RadioTabs.module.css';

export default class RadioTabs extends Component {
    constructor(props) {
        super(props);
    }

    render() { 
        return ( 
            <ul className={style.container}>
                {this.props.children}
            </ul>
         );
    }
}
