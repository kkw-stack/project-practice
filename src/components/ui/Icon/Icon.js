import React, { Component } from 'react';

import style from './Icon.module.css';

export default class Icon extends Component {
    
    render() {

        const type = this.props.type;
        const imgName = type.replace('_','-');
        const imgSrc = '/images/components/icon/'+imgName+'.svg';
    
        return (
            <i className={ `${ style.container } ${ style[type] } ${ this.props.size ? style['size_'+this.props.size] : '' } ${ this.props.useImgTag ? style.useImgTag : '' }` }>
                {this.props.useImgTag && 
                    <img src={imgSrc} alt={type} />
                }
            </i>
        );
    }

}