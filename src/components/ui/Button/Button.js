import React, { Component } from 'react';

import Icon from '../Icon/Icon';

import style from './Button.module.css';

export default class Button extends Component {

    render () {
        
        // Pass native attr
        const conditionalAttr = {};
        if(this.props.disabled) {
            conditionalAttr.disabled  = true;
        }

        // Set custom kakao icon and icon size
        let iconType = '';
        let iconSize = 0;
        if(this.props.kakao && this.props.outline){
            iconType = 'kakao';
            iconSize = 20;
        }else if(this.props.kakao){
            iconType = 'kakao_channel';
            iconSize = 34;
        }else{
            iconType = this.props.icon;
            iconSize = 18;
        }

        // Set css class 
        // mix template litterale and old school concatination to fix source view empty space issue ( TODO : find a better way)
        const cssClass = `${style.container}`
                        +`${iconType ? ' '+style.has_icon : ''}`
                        +`${this.props.outline ? ' '+style.outline : ''}`
                        +`${this.props.secondary ? ' '+style.secondary : ''}`
                        +`${this.props.seamless ? ' '+style.seamless : ''}`
                        +`${this.props.inline ? ' '+style.inline : ''}`
                        +`${this.props.size === 'medium' ? ' '+style.medium : ''}`
                        +`${this.props.size === 'mini' ? ' '+style.mini : ''}`
                        +`${this.props.kakao ? ' '+style.kakao : ''}` 
                        +`${this.props.more ? ' '+style.more : ''}`;

        // Create icon compoment wrapper
        const icon = <span className={`${style.icon} ${this.props.iconRight ? style.icon_right : ''}`}><Icon type={ iconType } size={this.props.iconSize ? this.props.iconSize : iconSize} /></span>;

        // Render the markup
        return (
            <button {...conditionalAttr} className={cssClass} onClick={ ( typeof this.props.onClick === 'function' ? this.props.onClick : null ) }>
                <span className={style.inner}>
                    {( iconType && !this.props.iconRight ) && icon}
                    <span className={style.text}>{ this.props.children }</span>
                    {( iconType && this.props.iconRight ) && icon}
                </span>
            </button>
        );
    }

}
