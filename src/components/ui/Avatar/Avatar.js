import React, { Component } from 'react';

import style from './Avatar.module.css';

export default class Avatar extends Component {

    render = () => {
        const type_id = ( this.props.type ? 'type' + parseInt( this.props.type ) : '' );
        const size = ( this.props.size ? 'size_' + this.props.size : '' );
        const active = ( this.props.active ? style['active'] : '' );

        return (
            <div className={ `${ style.container } ${ style[type_id] } ${ style[size] } ${ active }` }></div>
         );
    }

}
