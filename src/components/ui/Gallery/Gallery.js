import React, { Component } from 'react';

import HomeButton from 'components/ui/HomeButton/HomeButton';
import ButtonClose from 'components/ui/ButtonClose/ButtonClose';

import style from './Gallery.module.css';

export default class Gallery extends Component {

    componentDidMount(){
        window.scrollTo( 0, 0);
    }

    render() {
        return (
            <div className={style.container}>
                <HomeButton invert home />
                <ButtonClose invert fixed onClick={this.props?.onCloseClick} />

                {this.props.images &&
                    this.props.images.map((item,index)=>{
                        return( <img key={index} className={style.image} src={item} alt="" /> )
                    })
                 }
            </div>
         );
    }
}