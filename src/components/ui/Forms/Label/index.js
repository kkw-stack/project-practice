import React from 'react';

import style from '../Form.module.css';

export default function Label( props ) {
    return (
        <>
            { ( props?.for ) ? (
                <label className={ style.label } htmlFor={ props.for }>
                    <span className={ style.text }>{ props.text }</span>
                    { ( props?.required ) && ( <i className={ style.required }>필수</i> ) }
                </label>
            ) : (
                <span className={ style.label }>
                    <span className={ style.text }>{ props.text }</span>
                    { ( props?.required ) && ( <i className={ style.required }>필수</i> ) }
                </span>
            ) }

            { ( props?.explain ) && (
                <p className={ style.explain } dangerouslySetInnerHTML={ { __html: props.explain } }></p>
            ) }
        </>
    );
}