import React, { Component } from 'react';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { jtAlert } from 'lib/utils';

import style from './ClipBoard.module.css';

export default class ClipBoard extends Component {

    handleClick = () => {
        if (window.navigator.clipboard) {
            try {
                window.navigator.clipboard.writeText( this.props.text ).then( () => {
                    jtAlert('주소를 복사했습니다')
                }, () => {
                    jtAlert( 'WriteFailed' );
                } );
            } catch ( e ) {
                jtAlert( 'Error' );
                console.log( e );
            }
        } else {
            jtAlert( 'Error' );
        }
    }

    handleCopy = () => {
        jtAlert( '주소를 복사했습니다' );
    }

    render() {
        return (
            <CopyToClipboard text={ this.props.text } onCopy={ this.handleCopy }>
                <button className={style.container}>
                    {this.props.children}
                </button>
            </CopyToClipboard>
         );
    }
}
