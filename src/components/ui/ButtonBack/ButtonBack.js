import React, { Component } from 'react';
import Link from 'next/link';

import style from './ButtonBack.module.css';

export default class ButtonBack  extends Component {

    handleClick = e => {
        if ( typeof this.props?.onClick === 'function' ) {
            e.preventDefault();
            this.props.onClick();
        }
    }

    render() {
        const anchor = (
            <a onClick={ this.handleClick } className={ `${ style.container } ${ this.props.invert ? style.invert : '' }` }>
                <span className="sr_only">이전으로</span>
            </a>
        );

        if ( this.props?.href && this.props?.as ) {
            return (
                <Link href={ this.props.href } as={ this.props.as }>
                    {anchor}
                </Link>
            );
        }

        if ( this.props.url ) {
            return (
                <Link href={ this.props.url }>
                    { anchor}
                </Link>
            );
        }

        return ( anchor );
    }
}