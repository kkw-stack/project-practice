import React, { Component } from 'react';

import style from './Rating.module.css';

export default class Rating extends Component {

    render = () => {
        let items = [];
        const totalStar = 5;

        for ( let i = 0; i < totalStar; i++ ) {
            items.push( <i key={ i } className={ ( i < this.props.stars ? style.active : '' ) }></i> );
        }

        return (
            <span className={ style.container }>
                { items }
            </span>
        );
    }

}
