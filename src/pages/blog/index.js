import React from 'react';
import Link from 'next/link';
import fetch from 'node-fetch';

import dayjs from 'dayjs';

import { WPURL, useOnScreen, getDateFormat } from 'lib/utils';

import { useBlogList } from 'lib/swr';
import Header from 'components/ui/Header/Header';

export default function Blog( props ) {
    const scrollRef = React.createRef();
    const { data, size, setSize } = useBlogList( props?.data );

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
        <Header useHome title="뭉치고 블로그" />
        { ( total_posts > 0 ) ? (
            <div className="blog_container view">
                <div className="blog_banner">
                    <p>세상은 <i></i> 넓고 <br />샵은 무진장하다</p>
                    <span>다양한 우리샵을 소개해드려요</span>
                </div>

                <div id="blog_list" className="blog_list_wrap inner_wrap">
                    { posts.map( ( item ) => (
                        <div key={ item.id } className={ `blog_item ${ parseInt( Date.now() / 1000 ) - dayjs( item.date ).unix() < ( 60 * 60 * 24 * 7 ) ? 'new_item' : '' }` }>
                            <Link href={ { pathname: '/blog/[slug]', query: { slug: item.slug } } } as={ encodeURI( `/뭉치고-블로그/${ decodeURI( item.slug ) }` ) }>
                                <a>
                                    { ( item.thumbnail ) && (
                                        <figure className="jt_lazyload_wrap jt_lazy_img">
                                            <img src={ item.thumbnail } alt={ item.title } />
                                        </figure>
                                    ) }

                                    <h2>
                                        <p>
                                            { ( parseInt( Date.now() / 1000 ) - dayjs( item.date ).unix() < ( 60 * 60 * 24 * 7 ) ) && ( <i className="icon_new"></i> ) }
                                            <span>{ item.title || '제목이 없습니다' }</span>
                                        </p>
                                    </h2>

                                    { ( item.excerpt ) && (
                                        <p className="blog_desc" dangerouslySetInnerHTML={ { __html: item.excerpt } } />
                                    ) }

                                    <time className="date" dateTime={ getDateFormat( item.date, 'YYYY-MM-DD' ) }>
                                        <span className="month">{ getDateFormat( item.date, 'YYYY.MM.DD' ) }</span>
                                    </time>
                                </a>
                            </Link>
                        </div>
                    ) ) }
                    <div ref={ scrollRef } />
                </div>

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
    const data = await fetch( `${ WPURL }/modules/blog/list?paged=1` ).then( res => res.json() );

    return {
        props: { data, }
    };
}