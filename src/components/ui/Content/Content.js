import React, { Component } from 'react';

import style from './Content.module.css';

export default class Content extends Component {

    render = () => {
        return (
            <div className={ style.container }>
                <h2 className={ style.title }>{ this.props.title }</h2>
                { ( this.props.subtitle ) && (
                    <p className={ style.subtitle }>{ this.props.subtitle }</p>
                ) }
                <div className={ style.inner }>
                    { this.props.children }
                </div>
            </div>
        );
    }

}