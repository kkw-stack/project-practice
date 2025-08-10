import React from 'react';

import Icon from '../../Icon/Icon';

import style from '../Form.module.css';

export default function Button( props ) {

    const onClick = ( e ) => {
        if ( props?.onClick && typeof props.onClick === 'function' ) {
            return props?.onClick( e );
        }

        return false;
    }

    return (
        <div className={ `${ ( props?.className ? props.className : ( props?.type === 'submit' ? 'jt_form_submit' : 'jt_btn_wrap' ) ) }` }>
            <button type={ ( props?.type === 'submit' ? 'submit' : 'button' ) } className={ `jt_btn_basic ${ props?.type === 'submit' ? '' : 'jt_type_02' }` } onClick={ onClick } disabled={ props?.disabled }>
                <span>{ ( props?.label ? props.label : 'Button' ) }</span>
                { props.children }
                {( props.icon ) && 
                   <span className={style.icon}><Icon type={ props.icon } size={14} /></span>
                }
            </button>
        </div>
    );
}
