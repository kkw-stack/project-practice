import React, { Component } from 'react';

import style from './Remove.module.css';

export default class Remove extends Component{

    constructor(props){
        super(props);
    }

    render(){
        return(
            <button className={ style.remove } type="button" onClick={ this.props.onClick }>
                <span><i className="sr_only">{this.props.screenReader}</i></span>
            </button>
        ) 
    }

}
