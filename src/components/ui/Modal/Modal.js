import React from 'react';

import Header from '../Header/Header';

export default function Modal( props ) {
    if ( props?.show && props?.children ) {
        return (
            <div className="article view">
                <Header title={ props?.title ? props.title : '' } useClose onCloseClick={ props?.onCloseClick } />
                <div className="article_body">
                    { props?.children }
                </div>
            </div>
        );
    }

    return null;
}