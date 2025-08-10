import React from 'react';

import style from './Logo.module.css';

import { useAppContext } from 'lib/context';

export default function Logo( props ) {
    
    const { isHome } = useAppContext();

    return ( 
        <>
            {(isHome && !props.gray && !props.noH1) ? (
                <h1 className={`${style.container}`}>
                    <span className="sr_only">뭉치고</span>
                </h1>
            ) : (
                <div className={`${style.container} ${props.gray ? style.gray : ''}`}>
                    <span className="sr_only">뭉치고</span>
                </div>
            )}
        </>
    );

}