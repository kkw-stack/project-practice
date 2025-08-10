import React from 'react';

import style from '../Form.module.css';

export default function Error( props ) {
    if ( props?.show === true && props?.text !== true ) {
        return (
            <span className={ `${style.error} ${props?.prepend ? style.prepend : ''}` }>{ props.text }</span>
        );
    }

    return null;
}