import React, { Component } from 'react';

import style from './HomeButton.module.css';

export default class HomeButton  extends Component {
    render() {

        return (
            <a href={`${process.env.DOMAIN}/`} className={`${style.container} ${this.props.invert ? style.invert : ''} ${this.props.stickLeft ? style.stickleft : ''} ${ this.props.home ? style.home : '' }`}>
                <span className="sr_only">홈으로 이동</span>
            </a>
         );
    }
}