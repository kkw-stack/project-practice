import React, { Component } from 'react';

import ButtonClose from '../ButtonClose/ButtonClose';

import style from './ModalImage.module.css';

export default class ModalImage extends Component {

    constructor( props ) {
        super( props );

        this.state = {
            show: props?.show ? props.show : false,
            scrollPos: 0
        }
    }

    componentDidUpdate(prevProps) {
        if ( this.props.show !== prevProps.show ) {
            this.setState( {
                show: this.props.show,
            } );

            // add close style to body tag and restore scroll if the current is state show
            if ( this.state.show ) {
                document.body.classList.remove( style.open_body );
                window.scrollTo( 0, this.state.scrollPos );
            } else {
                this.setState( { scrollPos: window.scrollY } );
                document.body.classList.add( style.open_body );
            }
        }
    }

    handleClickOverlay = (e) => {
        if ( e.target === e.currentTarget ) {
            this.props.onCloseClick( false );
        }
    }

    render() {
        if ( this.state.show && this.props.image !== false ) {
            return (
                <div className={style.wrap}>
                    <div className={style.close}>
                        <ButtonClose invert onClick={()=>this.props.onCloseClick(false)} />
                    </div>
                    <div className={style.container}>
                        <div className={style.inner} onClick={this.handleClickOverlay}>
                            <img src={this.props.image} alt="" />
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    }

}