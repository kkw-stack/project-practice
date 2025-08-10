import React, { Component } from 'react';
import Link from 'next/link';

import style from './DeletableItem.module.css';

export default class DeletableItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <li className={style.container}>
                <Link href="#"><a onClick={ this.props.handleClick }>{ this.props.text }</a></Link>
                <button type="button" className={style.delete} onClick={ this.props.handleDelete }>
                    <span className="sr_only">삭제</span>
                </button>
            </li>
         );
    }

}
