import React from 'react';

import style from '../Form.module.css';

export default function Remove( props ) {
    return(
        <button className={ style.remove_btn } type="button" onClick={ props.onClick }>
            <span><i className="sr_only">{ props.screenReader }</i></span>
        </button>
    );
}
