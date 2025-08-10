import React, { Component } from 'react';

import style from './Tooltip.module.css';

export default class Tooltip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show : props.show ? true : false
        }
    }

    show = () => {
        this.setState({
            show : true
        })
    }

    hide = () => {        
        this.setState({
            show : false
        })
        
        if(typeof this.props.onClose === 'function'){
            this.props.onClose();
        }
    }

    render() { 
        return ( 
            <div className={`${style.container} ${this.state.show ? style.show : ''} ${this.props.className ? this.props.className : ''} ${this.props.arrowPos ? style[this.props.arrowPos] : ''}`}>
                <div className={style.inner}>
                    <span className={style.desc}>{this.props.children}</span>
                    <button type="button" className={style.close} onClick={this.hide}>
                        <span>
                            <i className="sr_only">툴팁 닫기</i>
                        </span>
                    </button>
                </div>
            </div>
         );
    }
}
 
