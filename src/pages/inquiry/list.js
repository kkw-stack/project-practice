import React from 'react';
import Link from 'next/link';

import { AppContext } from 'lib/context';
import { useInquiryList } from 'lib/swr';
import { useOnScreen, getDateFormat } from 'lib/utils';

import Login from 'components/layout/Login';
import Loading from 'components/ui/Loading/Loading';
import Character from 'components/ui/Character/Character';
import Nav from 'components/ui/Nav/Nav';
import Header from 'components/ui/Header/Header';
import Vh from 'components/ui/Vh/Vh';
import Status from 'components/ui/Status/Status';

export default function InquiryList( props ) {
    const { user } = React.useContext( AppContext );

    const scrollRef = React.createRef();
    const { data, size, setSize, mutate } = useInquiryList();

    const posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );

    React.useEffect( () => {
        if ( isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    React.useEffect( () => {
        mutate();
    }, [ user ] );

    if ( ! data || ( total_posts > 0 && posts.length === 0 ) ) {
        return ( <Loading /> );
    }

    if ( user === false ) {
        return (
            <>
                <Header useHome title="문의하기" />
                <Login />
            </>
        );
    }

    return (
        <>
        <Header useHome title="문의하기" />
        <div className="view">
            <Nav fixed>
                <Nav.item href="/inquiry/form" as="/문의하기/">1:1 문의하기</Nav.item>
                <Nav.item active href="/inquiry/list" as="/나의-문의내역/">나의 문의내역</Nav.item>
            </Nav>
            <div className="tabs_panels inquiry_content">
                { ( total_posts > 0 ) ? (
                    <div className="my_inquiry_list_container inner_wrap">
                        <ul className="inquiry_list">
                            { posts.map( item => (
                                <li key={ item.id }>
                                    <Link href={ { pathname: '/inquiry/[slug]', query: { slug: item.slug } } } as={ `/나의-문의내역/${ item.slug }` }>
                                        <a>
                                            <div className="my_inquiry_title_day">
                                                <b className="h5" dangerouslySetInnerHTML={ { __html: item.title } } />
                                                <span>{ getDateFormat( item.date, 'YYYY.MM.DD' ) }</span>
                                            </div>

                                            { ( item.is_answer ) ? (
                                                <Status active>답변완료</Status>
                                            ) : (
                                                <Status>처리중</Status>
                                            ) }
                                        </a>
                                    </Link>
                                </li>
                            ) ) }
                            <div ref={ scrollRef } />
                        </ul>
                    </div>
                ) : (
                    <Character useMarginTop type="no_result_03" text="문의내역이 없어요" />
                ) }
            </div>
        </div>
        </>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
