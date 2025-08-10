import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';

import { useEventList } from 'lib/swr';
import { WPURL, useOnScreen, getDateFormat } from 'lib/utils';

import Header from 'components/ui/Header/Header';


export default function Event( props ) {
    const scrollRef = React.createRef();
    const { data, size, setSize } = useEventList( props?.data );

    const posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );

    React.useEffect( () => {
        if ( isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    return (
        <>
        <Header useHome title="이벤트" />
        { ( total_posts > 0 ) ? (
            <div className="board_list_container view inner_wrap">
                <h2 className="event_list_ongoing">
                    <span>지금</span> 진행 중!
                </h2>
                <ul id="event_list" className="board_list">
                    { posts.map( ( item ) => (
                        <li key={ item.id } className="notice new_item">
                            <Link href={ { pathname: '/event/[slug]', query: { slug: item.slug } } } as={ encodeURI( `/이벤트/${ decodeURI( item.slug ) }` ) }>
                                <a className="board_list_img">
                                    <figure className="jt_lazyload_wrap">
                                        <img src={ ( item.thumbnail ? item.thumbnail : require( './images/blank.gif' ) ) } alt={ item.title } />
                                    </figure>

                                    { ( item.start_date ) && (
                                        <span>{ `${ getDateFormat( item.start_date, 'M.D' ) } ~${ ( item.end_date ? ` ${ getDateFormat( item.end_date, 'M.D' ) }` : '' ) }` }</span>
                                    ) }
                                </a>
                            </Link>
                        </li>
                    ) ) }
                    <div ref={ scrollRef } />
                </ul>
            </div>
        ) : (
            <div className="jt_list_nothing_found">
                <b>컨텐츠 <span>준비중</span> 입니다.</b>
                <p>현재 컨텐츠를 준비하고 있으니 조금만 기다려 주세요. <br />더욱 나은 모습으로 찾아뵙겠습니다.</p>
            </div>
        ) }
        </>
    );
}

export const getServerSideProps = async () => {
    const data = await fetch( `${ WPURL }/modules/event/list?paged=1` ).then( res => res.json() );

    return {
        props: { data, }
    };
}