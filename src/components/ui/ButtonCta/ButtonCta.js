import React, { Component } from 'react';

import style from './ButtonCta.module.css';

export default class ButtonCta extends Component {

    render = () => {
        
        const conditionalAttr = {};

        if(this.props.disabled) {
            conditionalAttr.disabled  = true;
        }

        return (
            <button type={this.props.type === "submit" ? "submit" : "button"} {...conditionalAttr} className={ `${style.container} ${this.props.kakao ? style.kakao : ''}  ${this.props.stickBottom ? style.stick_bottom : ''}` } onClick={ ( typeof this.props.onClick === 'function' ? this.props.onClick : null ) }>
                <span className={style.inner}>{ this.props.children }</span>
            </button>
        );
    }

}