import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import queryString from 'query-string';

import { AppContext } from 'lib/context';
import { useShopList } from 'lib/swr';
import { WPURL, getLocalStorageData, setLocalStorageData, queryStringOptions, useOnScreen, useDevice, objectToFormData, cookies } from 'lib/utils';
import getHeader from 'lib/seo';

import Loading from 'components/ui/Loading/Loading';
import Vh from 'components/ui/Vh/Vh';
import SearchField from 'components/ui/Search/Search';
import ButtonBack from 'components/ui/ButtonBack/ButtonBack';
import HomeButton from 'components/ui/HomeButton/HomeButton';
import DeletableItem from 'components/ui/DeletableItem/DeletableItem';
import Character from 'components/ui/Character/Character';
import ListItem from 'components/ui/ListItem/ListItem';
import Tags from 'components/ui/Tags/Tags';
import Tag from 'components/ui/Tags/Tag';
import OverflowScroller from 'components/ui/OverflowScroller/OverflowScroller';
import Button from 'components/ui/Button/Button';
import Separator from 'components/ui/Separator/Separator';

export default function SearchPage( props ) {
    const router = useRouter();
    const { keywords } = props;
    const { search = '', order = '', area = '', lat = '', lng = '' } = queryString.parse( router.asPath.split( '?' ).pop(), queryStringOptions );

    const [ seoData, setSeoData ] = React.useState( null );

    const [ searchHistory, setSearchHistory ] = React.useState( getLocalStorageData( 'jt-mcg-search', [] ) );

    const { user, location: userLocation } = React.useContext( AppContext );
    const location = { area: '', lat: '', lng: '' };

    try {
        // 지역, 위치에 상관없이 검색하도록 주석처리
        // if ( area ) {
        //     location.area = area;
        // } else if ( lat && lng ) {
        //     location.lat = lat;
        //     location.lng = lng;
        // } else if ( userLocation?.area ) {
        //     location.area = userLocation.area;
        // } else if ( userLocation?.lat && userLocation?.lng ) {
        //     location.lat = userLocation.lat;
        //     location.lng = userLocation.lng;
        // }
    } catch ( e ) { }

    // const location = {
    //     area: ( parseInt( area ) > 0 ? area : ( userLocation?.area ? userLocation.area : '' ) ),
    //     lat: ( parseFloat( lat ) > 0 ? lat : ( userLocation?.lat ? userLocation.lat : '' ) ),
    //     lng: ( parseFloat( lng ) > 0 ? lng : ( userLocation?.lng ? userLocation.lng : '' ) ),
    // }

    const scrollRef = React.createRef();
    const { data, size, setSize, mutate } = useShopList( { search, order, ...location }, props.data );

    const posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );

    const [ isMobile, setIsMobile ] = React.useState( false );
    const [ moreLoading, setMoreLoading ] = React.useState( false );

    const searchShops = value => {
        if ( value ) {
            fetch( `${ WPURL }/components/search/add/`, {
                method: 'POST',
                headers: ( cookies.get( 'jt-mcg-nonce' ) ? { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) } : {} ),
                body: objectToFormData( { search: value } ),
            } );

            router.push( '/search', `/검색/?${ queryString.stringify( { ...location, search: value }, queryStringOptions ) }` );
        }
    }

    const handleKeywords = ( event, value ) => {
        event.preventDefault();

        searchShops( value );

        return false;
    }

    const handleOrder = ( event, value ) => {
        event.preventDefault();

        router.push( '/search', `/검색/?${ queryString.stringify( { ...location, search: search, order: value }, queryStringOptions ) }` );

        return false;
    }

    const removeKeywords = ( event, value ) => {
        event.preventDefault();

        setSearchHistory( searchHistory.filter( item => item !== value ) );

        return false;
    }

    const removeAllKeywords = event => {
        event.preventDefault();

        setSearchHistory( [] );

        return false;
    }

    const handleLoadMore = () => {
        setMoreLoading( true );
        setSize( size + 1 );

        return false;
    }

    React.useEffect( () => {
        setLocalStorageData( 'jt-mcg-search', [].concat( searchHistory ).filter( ( item, idx ) => idx < 10 ) );
    }, [ searchHistory ] );

    React.useEffect( () => {
        if ( search ) {
            setSearchHistory( [ search ].concat( searchHistory.filter( item => item !== search ).filter( ( item, idx ) => idx < 9 ) ) );

            setSeoData( {
                title: `${ search } 관련 추천샵 입니다. - 뭉치고`.replace( /\s\s+/g, ' ' ),
                description: `${ search } 샵을 이용한 사람들의 후기를 확인하고 다양한 샵의 ${ search } 샵을 이용하세요.`.replace( /\s\s+/g, ' ' ),
            } );
        } else {
            setSeoData( null );
        }
    }, [ search ] );

    React.useEffect( () => {
        setMoreLoading( false );
    }, [ data ] );

    React.useEffect( () => {
        if ( data && isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    React.useEffect( () => {
        mutate();
    }, [ user ] );

    React.useEffect( () => {
        const device = useDevice();
        setIsMobile( device.isMobile() );
    }, [] );

    if ( search ) {
        return (
            <>
            { ( seoData !== null ) && ( getHeader( seoData ) ) }
            <div className="global_search_popup popup_layout_wrap">
                <div className="global_search_header_wrap header_title_wrap header_layout">
                    <div className="global_search_top">
                        <div className="search_field_container">
                            <SearchField key={ search } seamless placeholder="찾고 싶은 코스, 샵 검색" onSubmitHandle={ searchShops } value={ search } />
                        </div>
                        <HomeButton home />
                    </div>
                </div>

                <div className="global_search_popup_content">
                    <div className={`search_result_wrap ${posts.length > 0 ? 'search_result_wrap_has_post': ''}`}>
                        <div className={`view search_result_view ${(location.area || location.lat  || location.lng) ? '' : 'search_result_without_location' }`}>
                            <div className="search_result_title">
                                <h1 className="h4"><b>{ search }</b> 관련 추천샵입니다.</h1>
                            </div>
                            { ( posts.length > 0 ) && (
                                <>
                                    <div className="search_result_info">
                                        <p>총 { total_posts }개</p>
                                        <div className="search_result_info_list">
                                            <Tags>
                                                <Tag active={ order === '' } onClick={ e => handleOrder( e, '' ) }>기본순</Tag>
                                                <Tag active={ order === 'review' } onClick={ e => handleOrder( e, 'review' ) }>후기순</Tag>
                                            </Tags>
                                        </div>
                                    </div>

                                    <div className="search_result_list">
                                        <ul>
                                        { posts.map( ( item ) => <ListItem key={ `${ item.type }-${ item.id }` } data={ item } isMobile={ isMobile } /> ) }
                                        </ul>
                                    </div>

                                    {/* 인피니티 스크롤 제거, 더보기 버튼 추가
                                    { ( total_posts > 0 && posts.length < total_posts ) && (
                                        <Loading small ref={ scrollRef } />
                                    ) } */}
                                    
                                    { ( total_posts > 0 && posts.length < total_posts ) && (
                                        <>
                                            <Separator />
                                            { moreLoading ? <Loading small /> : <div className="shop_list_more"><Button more size="medium" onClick={handleLoadMore}>샵 더보기</Button></div> }
                                        </>
                                    )}
                                </>
                            ) }
                        </div>

                        { ( ! data || ( posts.length === 0 && total_posts > 0 ) ) && (
                            <Loading />
                        ) }

                        { ( data && total_posts === 0 ) && (
                            <div className="view">
                                <Character useMarginTop type="no_result_07" text={ `검색결과가 없습니다` } />
                                {/* { ( () => {
                                    if ( parseFloat( location?.lat ) > 0 && parseFloat( location?.lng ) > 0 ) {
                                        return (
                                            <Character useMarginTop type="no_result_07" text={ `검색결과가 없습니다\n고객님이 설정한 위치 기준으로\n근처 샵이 검색됩니다` } />
                                        );
                                    } else if ( parseInt( location?.area ) > 0 ) {
                                        return (
                                            <Character useMarginTop type="no_result_07" text={ `검색결과가 없습니다\n고객님이 설정한 지역 내에서\n샵이 검색됩니다` } />
                                        );
                                    } else {
                                        return (
                                            <Character useMarginTop type="no_result_07" text={ `검색결과가 없습니다` } />
                                        );
                                    }
                                } )() } */}
                            </div>
                        ) }

                    </div>
                </div>
            </div>
            </>
        );
    } else {
        return (
            <div className="global_search_popup popup_layout_wrap">
                <div className="global_search_header_wrap header_title_wrap header_layout">
                    <div className="global_search_top">
                        <div className="search_field_container">
                            <SearchField placeholder="찾고 싶은 코스, 샵 검색" seamless onSubmitHandle={ searchShops } />
                        </div>
                        <HomeButton home />
                    </div>
                </div>

                <div className="global_search_popup_content view">
                    <div className="global_search_popup_content_inner">
                        <div className="global_search_list popular_global_search_list">
                            <b className="global_search_title"><span>인기 검색어</span></b>
                            <ul>
                                { keywords.map( ( item, idx ) => (
                                    <li key={ idx }>
                                        <Link href="/search" as={ `/검색/?search=${ item }` }>
                                            <a onClick={ e => handleKeywords( e, item ) }>{ item }</a>
                                        </Link>
                                    </li>
                                ) ) }
                            </ul>
                        </div>
                    </div>

                    <div className="global_search_list lately_global_search_list">
                        { ( searchHistory.length > 0 ) ? (
                            <div>
                                <p>
                                    <b className="global_search_title"><span>최근 검색</span></b>
                                    <button onClick={ removeAllKeywords } type="button" className="last_delete_all" >전체삭제</button>
                                </p>
                                <ul>
                                    { searchHistory.map( ( name, index ) => (
                                        <DeletableItem
                                            key={ index }
                                            text={ name }
                                            handleClick={ e => handleKeywords( e, name ) }
                                            handleDelete={ e => removeKeywords( e, name ) }
                                        />
                                    ) ) }
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    <b className="global_search_title"><span>최근 검색</span></b>
                                </p>
                                <Character useMarginTop type="no_result_01" text="검색내역이 없습니다" />
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        );
    }
}

export const getServerSideProps = async ( { req, query } ) => {
    const keywords = await fetch( `${ WPURL }/components/search` ).then( res => res.json() );
    const seoData = ( query?.search ? {
        title: `${ query.search } 관련 추천샵 입니다. - 뭉치고`.replace( /\s\s+/g, ' ' ),
        description: `${ query.search } 샵을 이용한 사람들의 후기를 확인하고 다양한 샵의 ${ query.search } 샵을 이용하세요.`.replace( /\s\s+/g, ' ' ),
    } : {} );

    return { props: {
        keywords, seoData,
    }, }
}