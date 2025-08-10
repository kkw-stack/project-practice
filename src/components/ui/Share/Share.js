import React, { Component } from 'react';

import { jtAlert } from 'lib/utils';

import style from './Share.module.css';

export default class Share extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = ( event ) => {

        event.preventDefault();

        if ('share' in navigator) {
            let url = this.props.url ? this.props.url :  window.location.href;
            let title = '';

            if(this.props.title){
                title = this.props.title;
            } else if(document.querySelector("meta[property='og:title']")){
                title = document.querySelector("meta[property='og:title']").getAttribute('content')
            }else{
                title = document.title;
            }

            navigator.share({
                title: title,
                url: url,
            })
        }else{
            jtAlert('현재 사용중인 브라우저에서 공유하기가 지원하지 않습니다'); // Todo change this
        }

    }

    render() {
        return (
            <a href="#" className={`${style.container} ${this.props.useNoText ? style.no_text : ''} ${this.props.useDrawing ? style.drawing : ''}`} onClick={this.handleClick}>
                <div className={style.inner}>
                    <div className={style.icon}></div>
                    {this.props.children ? (
                        this.props.children
                    ) : (
                        <span className={this.props.useNoText ? 'sr_only' : ''}>공유</span>
                    )}
                </div>
            </a>
         );
    }
}