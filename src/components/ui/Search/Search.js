import React, { Component } from 'react';

import { useDevice } from 'lib/utils';

import style from './Search.module.css';

export default class Search extends Component {

    constructor( props ) {
        super( props );

        this.state = {
            showdeleteBtn: ( props?.value ? true : false ),
            val: ( props?.value ? props.value : '' ),
            rendered: Date.now(),
        }
        this.searchRef = React.createRef();
        this.device = useDevice();
    }

    onChange = ( e ) => {
        this.setState( {
            ...this.state,
            showdeleteBtn: ( e.target.value !== '' ),
            val: e.target.value,
        }, () => {
            try {
                if ( typeof this.props.onChange === 'function' ) {
                    this.props.onChange( this.state.val );
                }
            } catch ( e ) { }
        } );
    }

    clear = () => {
        this.setState( {
            showdeleteBtn: false,
            val: '',
            rendered: Date.now(),
        }, () => {
            if ( typeof this.searchRef?.current?.focus === 'function' ) {
                this.searchRef.current.focus();
            }
        } );
    }

    submitHandle = ( event ) => {
        event.preventDefault();

        try {
            this.props.onSubmitHandle( this.state.val );
        } catch ( e ) { }

        return false;
    }

    render = () => {

        // Fixe ios android / ios custom keyboard issue
        const conditionalAttr = {};
        const isIos =  this.device.isIos();
        if(isIos) {
            conditionalAttr.inputMode  = "search";
        }

        // Renderer
        return (
            <form onSubmit={ this.submitHandle } className={ `${ style.container } ${ this.props.seamless ? style.seamless : '' }` }>
                <div className={style.inner}>
                    <input
                        key={ this.state.rendered }
                        ref={ this.searchRef }
                        onChange={ this.onChange }
                        value={ this.state.val }
                        className={ style.input }
                        type={isIos ? "text" : "search"}
                        placeholder={ this.props.placeholder}
                        autoComplete="off"
                        maxLength="50"
                        {...conditionalAttr}
                    />

                    { ( this.state.showdeleteBtn ) && (
                        <button onClick={ this.clear } className={ style.remove } type="button">
                            <span><i className="sr_only">검색 내용 삭제</i></span>
                        </button>
                    ) }

                    <button className={ style.submit } type="submit">
                        <span><i className="sr_only">검색하기</i></span>
                    </button>
                </div>
            </form>
        );
    }

}