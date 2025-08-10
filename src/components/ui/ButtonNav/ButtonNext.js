import React, { Component } from 'react';

import style from './ButtonNav.module.css'

export default class ButtonNext extends Component {

    render() { 
        return ( 
            <button type="button" ref={this.props.refer} className={`${style.nav} ${style.next}`} >Next</button>
         );
    }
}
