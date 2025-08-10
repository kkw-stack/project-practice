import React, { Component } from 'react';

import style from './ButtonClose.module.css';

export default class ButtonClose extends Component {

    constructor(props) {
        super(props);

        this.state = {
            onClick: function(){}
        }
    }

    componentDidMount(){
        if( typeof this.props.onClick === 'function' ){
            this.setState({
                onClick: this.props.onClick
            })
        }
    }

    render() { 
        return ( 
            <button type="button" className={`${style.container} ${this.props.invert ? style.invert : ''} ${this.props.fixed ? style.fixed : ''}`} onClick={this.state.onClick}>
                <span className={style.inner}>
                    <i className="sr_only">창닫기</i>
                </span>
            </button>
         );
    }
}
