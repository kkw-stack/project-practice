import React, { Component } from 'react';

import style from './Loading.module.css';

const Loading = React.forwardRef( ( props, ref ) => {

    return (
        <div  ref={ ref } className={`${style.container} ${props.small ? style.small : ''} ${props.full ? style.full : ''}`}></div>
    );
    
});

export default Loading;
