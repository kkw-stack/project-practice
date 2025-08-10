import React from 'react';
import Link from 'next/link';

import queryString from 'query-string';

import { useDevice, queryStringOptions } from 'lib/utils';

import LazyLoad from '../LazyLoad/LazyLoad';

import style from './ListItem.module.css';

export default function ListItem( props ) {
    const { data, location = {} } = props;
    const strQuery = ( parseFloat( location?.lat ) > 0 && parseFloat( location?.lng ) > 0 ? queryString.stringify( { ...location, lastName: '' }, queryStringOptions ) : '' );
    const shopName = data.title.substring(0, 30);

    return (
        <li className={ `${style.container} ${ ( data.basic.is_ready ? style.container_ing : '' ) } ${ ( data.basic.use_bg ? style.container_bg : '' ) }` }>
            <Link
                href={ { pathname: '/shop/[slug]', query: { ...location, slug: decodeURI( data.slug ), lastName: '' } } }
                as={ data.slug ? `/샵/${ decodeURI( data.slug ) }/${ strQuery ? `?${ strQuery }` : '' }` : '#' }
            >
                <a { ...( props?.isMobile || 1 ? {} : { target: '_blank', rel: 'noopener' } ) }>
                    { ( data.type === 'super' || data.type === 'big' || true) && (
                        <div className={ style.thumbnail }>
                            <LazyLoad height={ 90 }>
                                <img src={ ( data.thumbnail ? data.thumbnail : require( './images/shop-list-thumb-no.jpg' ) ) } alt={ data.title } />
                            </LazyLoad>
                            { ( ( data.type === 'super' || data.type === 'big' || true) && data.basic.is_ready ) && ( <p className={ style.ing }>준비중</p> ) }
                            { ( ( data.type === 'super' || data.type === 'big' || true) && data.basic.is_cert ) && ( <p className={ style.best }><span className="sr_only">뭉치고 인증</span></p> ) }
                        </div>
                    ) }

                    <div className={ style.info }>
                        <h2 className={ style.name }><b>{ shopName }</b></h2>
                        <ul className={ style.meta }>
                            <li className={ style.star }><span><b>{ data.basic.review.rank }</b> <i>({ data.basic.review.cnt })</i></span></li>
                            <li className={ style.heart }><span>{ data.basic.zzim.count }</span></li>
                            { !props.isDetailpage && data.basic.distance && ( <li className={ style.location }><span>{ data.basic.distance }</span></li> ) }
                        </ul>
                        <ul className={ style.event }>
                            <li className={ style.price }>최소금액 { data.basic.price }</li>
                            { ( (( data.type === 'super' || data.type === 'big' || true) && data.basic.event.sale) ||
                                 ( data.type === 'super' || data.type === 'big' || true) && data.basic.event.review) && (
                                <li className={style.event_type}>
                                    { ( ( data.type === 'super' || data.type === 'big' || true) && data.basic.event.sale ) && ( <span className={style.event_sale}>할인이벤트</span> ) }
                                    { ( ( data.type === 'super' || data.type === 'big' || true) && data.basic.event.review ) && ( <span className={style.event_review}>후기이벤트</span> ) }
                                </li>
                            ) }
                        </ul>
                        {(data?.basic?.map?.address) && (
                            <p className={style.desc}>{data.basic.map.address}</p>
                        )}
                        <p className={ style.desc }>{ data.basic.desc }</p>
                        <ul className={ `${style.desc} ul-cate` }>
                            {data.category.map(cate => (
                                <li key={cate} className="color-body">{cate}</li>
                            ))}
                        </ul>
                    </div>
                </a>
            </Link>
        </li>
    );
}
