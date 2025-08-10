import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';

import dayjs from 'dayjs';

import { useNoticeList } from 'lib/swr';
import { WPURL, useOnScreen, getDateFormat } from 'lib/utils';

import Header from 'components/ui/Header/Header';

export default function Notice( props ) {
    const scrollRef = React.createRef();
    const { data, size, setSize } = useNoticeList( props?.data );

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
        <Header useHome title="공지사항" />
        { ( total_posts > 0 ) ? (
            <div className="board_list_container view inner_wrap">
                <ul id="notice_list" className="board_list">
                    { posts.map( ( item ) => {
                        const isNew = parseInt( Date.now() / 1000 ) - dayjs( item.date ).unix() < ( 60 * 60 * 24 * 7 );
                        return (
                            <li key={ item.id } className={ `notice ${ isNew ? 'new_item' : '' }` }>
                                <Link href={ { pathname: '/notice/[slug]', query: { slug: item.slug } } } as={ encodeURI( `/공지사항/${ decodeURI( item.slug ) }` ) }>
                                    <a>
                                        <h2 className="board_title">
                                            { item.is_sticky && <span className="jt_newsfeed_notice">[공지]</span> }
                                            <p>
                                                { ( isNew ) && ( <i className="icon_new"></i> ) }
                                                <span>{ item.title || '제목이 없습니다' }</span>
                                            </p>
                                        </h2>
                                        <time className="board_day" dateTime={ getDateFormat( item.date, 'YYYY-MM-DD' ) }><span className="month">{ getDateFormat( item.date, 'YYYY.MM.DD' ) }</span></time>
                                    </a>
                                </Link>
                            </li>
                        );
                    } ) }
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
    const data = await fetch( `${ WPURL }/modules/notice/list?paged=1` ).then( res => res.json() );
    const seoData = { title: '공지사항 | 뭉치고', description: '뭉치고 공지사항을 알려드립니다.' };

    return {
        props: { data, seoData, }
    };
}