import React, { Component } from 'react';

import style from './ButtonFab.module.css';

export default class ButtonFab extends Component {
    render() {
        return (
            <>
                {this.props.href ? (
                    <a className={`${style.container} ${this.props.type ? style[this.props.type] : ''}`} href={this.props.href} onClick={this.props.onClick}>
                        <span className="sr_only">{this.props.text}</span>
                    </a>
                ) : (
                    <a className={`${style.container} ${this.props.type ? style[this.props.type] : ''}`} href={this.props.to} onClick={this.props.onClick}>
                        <span className="sr_only">{this.props.text}</span>
                    </a>
                ) }
            </>
        );
    }
}
