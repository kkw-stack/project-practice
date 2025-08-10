import React, { Component } from 'react';

import { getDateFormat } from 'lib/utils';

import style from './DetailTitle.module.css';

export default class DetailTitle extends Component {

    render = () => {
        return (
            <div className={ `inner_wrap ${style.container}` }>
                <div className={ style.inner }>
                    <h1 className={ style.title } dangerouslySetInnerHTML={ { __html: this.props.title || '제목이 없습니다' } }></h1>
                    <div className={ style.meta }>
                        <time className={ style.date } dateTime={ getDateFormat( this.props.date, 'YYYY-MM-DD' ) }>
                            { getDateFormat( this.props.date, 'YYYY.MM.DD' ) }
                        </time>
                    </div>
                    { /* TODO :: SHARE */ }
                </div>
            </div>
        );
    }

}
