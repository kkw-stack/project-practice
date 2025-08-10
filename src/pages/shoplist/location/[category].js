import React from 'react';
import ReactDOMServer from "react-dom/server"
import { useRouter } from 'next/router';
import fetch from 'node-fetch';
import queryString from 'query-string';
import Head from 'next/head';
import Link from 'next/link';

import { AppContext } from 'lib/context';
import { useShopList } from 'lib/swr';
import getHeader from 'lib/seo';
import { WPURL, queryStringOptions, useOnScreen, useDevice, animateInView } from 'lib/utils';
import { Josa } from 'components/ui/Forms/utils';

import Nav from 'components/ui/Nav/Nav';
import Tags from 'components/ui/Tags/Tags';
import Tag from 'components/ui/Tags/Tag';
import Checkbox from 'components/ui/Checkboxes/Checkbox';
import ListItem from 'components/ui/ListItem/ListItem';
import HeaderList from 'components/ui/HeaderList/HeaderList';
import Loading from 'components/ui/Loading/Loading';
import Header from 'components/ui/Header/Header';
import Character from 'components/ui/Character/Character';
import Vh from 'components/ui/Vh/Vh';
import Accordion from 'components/ui/Accordion/Accordion';
import Button from 'components/ui/Button/Button';
import Separator from 'components/ui/Separator/Separator';

export default function ShopArea( props ) {

    const { user, location: userLocation, setShowLocation } = React.useContext( AppContext );

    const router = useRouter();

    const scrollRef = React.createRef();

    // 쿼리를 우선으로 적용
    const [ location, setLocation ] = React.useState( {
        lat: props.query?.lat,
        lng: props.query?.lng,
        name: props.query?.name,
        lastName: props.lastName
    } );

    const { category, areas } = props;
    const [ query, setQuery ] = React.useState( { ...props.query, ...location } );
    const [ headerTitle, setHeaderTitle ] = React.useState( props.lastName ? (props.lastName+' 주변 '+props?.seoCategory?.name) : (location.name+' 근처 '+props?.seoCategory?.name) );
    const [ serverData, setServerData ] = React.useState( props.data );
    const { data, size, setSize, mutate } = useShopList( { ...query }, serverData );
    let posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );
    const [ seoData, setSeoData ] = React.useState( null );
    const [ showLoading, setShowLoading ] = React.useState( false );
    const [ endInit, setEndInit ] = React.useState( false );
    const [ isMobile, setIsMobile ] = React.useState( false );
    const [ moreLoading, setMoreLoading ] = React.useState( false );

    const [ currentCategory, setCurrentCategory ] = React.useState(category.find(item => decodeURI(item.slug) === decodeURI(query.category)));

    // fix lazyload
    const lazyLoadFix = () => {
        setTimeout(function(){
            window.dispatchEvent(new Event('resize'));
        },500);
    }

    // Nav and Filter
    const handleCategory = ( event, category ) => {
        event.preventDefault();

        setQuery( { ...query, category: category } );
        lazyLoadFix();

        return false;
    }

    const handleOrder = ( event, value ) => {
        event.preventDefault();

        setQuery( { ...query, order: value } );
        lazyLoadFix();

        return false;
    }

    const handleFilter = ( { target: { checked, value } } ) => {
        setQuery( { ...query, filter: ( query.filter.filter( item => item !== value ) || [] ).concat( checked ? [ value ] : [] ) } );
        lazyLoadFix();
    }

    const handleLoadMore = () => {
        setMoreLoading( true );
        setSize( size + 1 );

        return false;
    }

    React.useEffect(() => {
        if( moreLoading ){
            setMoreLoading( false );
        }
    }, [ data ]);

    React.useEffect(() => {
        if ( endInit ) {
            setLocation({
                lat : userLocation.lat,
                lng : userLocation.lng,
                name : userLocation.name,
                lastName: userLocation.lastName
            });
        }
    }, [ userLocation ]);

    React.useEffect( async () => {

        setCurrentCategory(category.find(item => decodeURI(item.slug) === decodeURI(query.category)));

        if ( endInit ) {
            setShowLoading( true );
            setServerData( false );

            const strQuery = queryString.stringify( { order: query.order, filter: query.filter, lat: query.lat, lng: query.lng, name: query.name }, queryStringOptions );
            const newUrl = encodeURI( `/위치기반/${ decodeURI( query.category ) }` ) + ( strQuery ? `?${ strQuery }` : '' );

            if ( router.asPath !== newUrl ) {
                router.push(
                    { pathname: '/shoplist/location/[category]', query: query },
                    newUrl,
                    { shallow: true }
                );
            }

            const { category: seoCategory } = await fetch( `${ WPURL }/modules/shop/seo?${ queryString.stringify( query, queryStringOptions ) }` ).then( res => res.json() );

            if( location.lastName ){
                setSeoData( {
                    title: `${location.lastName} 주변 인기 ${ (seoCategory.name === '스웨디시') ? `${seoCategory.name} 마사지` : seoCategory.name } 업소 - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `${location.lastName}에 있는 다양한 ${ seoCategory.name } 업체를 만나보세요 인기있는 샵은 ${posts.filter(( item, idx ) => ( idx < 3 )).map(item => item.title).join(', ')}이 있습니다.`.replace( /\s\s+/g, ' ' ),
                } );
                setHeaderTitle(location.lastName+' 주변 '+seoCategory.name);
            } else {
                setSeoData( {
                    title: `${location.name} 근처 ${ (seoCategory.name === '스웨디시') ? `${seoCategory.name} 마사지` : seoCategory.name } - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `근처 ${seoCategory.name} 업소를 찾으세요? ${location.name} ${seoCategory.name}${ Josa(seoCategory.name, '를') } 찾아보세요 - ${posts.filter(( item, idx ) => ( idx < 4 )).map(item => item.title).join(', ')}`.replace( /\s\s+/g, ' ' ),
                } );
                setHeaderTitle(location.name+' 근처 '+seoCategory.name);
            }

            setShowLoading( false );
            window.scrollTo( 0, 0 );
        }
    }, [ query ] );

    React.useEffect( () => {
        if ( endInit && ! showLoading ) {
            if ( query.category !== router.query.category ) {
                setQuery( { ...query, ...router.query } );
            } else {
                const newQuery = { category: decodeURI( query.category ), ...queryString.parse( ( router.asPath.split( '?' ).length > 1 ? router.asPath.split( '?' ).pop() : '' ), queryStringOptions ) };

                if ( ( query?.order || '' ) !== ( newQuery?.order || '' ) || JSON.stringify( query?.filter || [] ) !== JSON.stringify( newQuery?.filter || [] ) || ( query?.name || '' ) !== ( newQuery?.name || '' ) || ( query?.lat || 0 ) !== ( newQuery?.lat || 0 ) || ( query?.lng || 0 ) !== ( newQuery?.lng || 0 )) {
                    setQuery( { ...query, order: newQuery?.order || '', filter: newQuery?.filter || [], name: newQuery?.name || '', lat: newQuery?.lat || 0, lng: newQuery?.lng || 0 } );
                }
            }
        }
    }, [ router ] );

    React.useEffect( () => {
        if ( isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    React.useEffect( () => {
        mutate();
    }, [ user ] );

    React.useEffect( () => {
        if ( ! ( parseFloat( location.lat ) > 0 && parseFloat( location.lng ) > 0 ) ) {
            setShowLocation( true );
        }

        const device = useDevice();
        setIsMobile( device.isMobile() );

        setEndInit( true );
    }, [] );

    return (
        <>
        { ( seoData !== null ) && ( getHeader( seoData ) ) }

        <Head>
            {/* 20230526 [201] :: 포스트 갯수가 없을 경우 noindex 처리 제거 */}
            { ( ( !location.lat || !location.lng || !location.name ) || (!posts.length && false) ) && (
                <meta name="robots" content="noindex" />
            ) }

            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: `
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [{
                    "@type": "Question",
                    "name": "${ location.lastName ? `${ location.lastName } 주변` : `${ location.name } 근처` }의 샵 노출 기준은 무엇인가요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "뭉치고는 다양한 샵 정보를 제공하기 위해 설정한 위치 기준으로 근처 샵이 노출됩니다. 위치 설정을 변경 하시려면 우측상단 위치설정 버튼을 클릭 해 위치를 변경 해주세요."
                    }
                }, {
                    "@type": "Question",
                    "name": "${ location.lastName || location.name }에는 어떤 샵이 있나요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "<ul>${category.map(cate => {
                                const strQuery = queryString.stringify( { lat: query.lat, lng: query.lng, name: query.name }, queryStringOptions );
                                const newUrl = encodeURI( `${ process.env.DOMAIN }/위치기반/${ decodeURI( cate.slug ) }/` ) + ( strQuery ? `?${ strQuery }` : '' );
                                return ReactDOMServer.renderToStaticMarkup( <li key={cate.name}><a href={newUrl}></a></li> );
                            }).join('').toString().replaceAll('"', '').replaceAll('&amp;', '&')}</ul>"
                    }
                }]
            }
            `}}></script>
        </Head>

        <div className="article view">
            <Header useHome useLocation title={ headerTitle } />
            <div className="view article category_list_acticle">
                <div className="article_body">
                    <div className="tabs_component">
                        <Nav useArrow fixed>
                            { category.map( item => {
                                const strQuery = queryString.stringify( { ...query, category: '', lastName: '' }, queryStringOptions );
                                return (
                                    <Nav.item
                                        key={ item.id }
                                        href={ { pathname: router.pathname, query: { ...router.query, category: decodeURI( item.slug ), lastName: '' } } }
                                        as={ `/위치기반/${ decodeURI( item.slug ) }${ strQuery ? `?${ strQuery }` : '' }` }
                                        onClick={ e => handleCategory( e, decodeURI( item.slug ) ) }
                                        active={ decodeURI( item.slug ) === decodeURI( query.category ) }
                                    >
                                        { item.name }
                                    </Nav.item>
                                );
                            } ) }
                        </Nav>
                        <div className="tabs_panels">
                            <div className="shop_list_filter_wrap">
                                <Tags>
                                    <Tag active={ query.order === '' } onClick={ e => handleOrder( e, '' ) }>기본순</Tag>
                                    <Tag active={ query.order === 'review' } onClick={ e => handleOrder( e, 'review' ) }>후기순</Tag>
                                    <Tag active={ query.order === 'rating' } onClick={ e => handleOrder( e, 'rating' ) }>별점순</Tag>
                                </Tags>

                                <div className="filter_type_review">
                                    <Checkbox round label="후기이벤트" value="event" checked={ query.filter.indexOf( 'event' ) >= 0 } onChange={ handleFilter } />
                                    {/* <Checkbox round label="사진샵만" value="photo" checked={ query.filter.indexOf( 'photo' ) >= 0 } onChange={ handleFilter } />
                                    <Checkbox round label="바로결제" value="card" checked={ query.filter.indexOf( 'card' ) >= 0  } onChange={ handleFilter } /> */}
                                </div>
                            </div>

                            { ( ! showLoading && posts.length > 0 ) && (
                                <div className="shop_list_wrap">
                                    { ( query.order === '' && query.filter.length === 0 && posts.filter( item => item.type === 'super' ).length > 0 ) && (
                                        <div className="shop_list_grade super">
                                            <HeaderList title="슈퍼리스트" tooltip="슈퍼리스트 추천 영역입니다" />
                                            <ul>
                                            { posts.filter( item => item.type === 'super' ).map( item => (
                                                <ListItem key={ `${ item.type }-${ item.id }` } data={ item } location={ location } isMobile={ isMobile } />
                                            ) ) }
                                            </ul>
                                        </div>
                                    ) }

                                    { ( query.order === '' && query.filter.length === 0 && posts.filter( item => item.type === 'big' ).length > 0 ) && (
                                        <div className="shop_list_grade big">
                                            <HeaderList title="빅히트콜" tooltip="빅히트콜 추천 영역입니다" />
                                            <ul>
                                            { posts.filter( item => item.type === 'big' ).map( item => (
                                                <ListItem key={ `${ item.type }-${ item.id }` } data={ item } location={ location } isMobile={ isMobile } />
                                            ) ) }
                                            </ul>
                                        </div>
                                    ) }

                                    { ( query.order === '' && query.filter.length === 0 && posts.filter( item => item.type === 'basic' ).length > 0 ) && (
                                        <div className="shop_list_grade basic">
                                            <HeaderList title="일반샵" tooltip="일반샵 추천 영역입니다" />
                                            <ul>
                                            { posts.filter( item => item.type === 'basic' ).map( item => (
                                                <ListItem key={ `${ item.type }-${ item.id }` } data={ item } location={ location } isMobile={ isMobile } />
                                             ) ) }
                                             </ul>
                                        </div>
                                    ) }

                                    { ( query.order !== '' || query.filter.length > 0 ) && (
                                        <div className="shop_list_grade basic">
                                            <ul>
                                            {posts.map(item => <ListItem key={`${item.type}-${item.id}`} data={item} isMobile={isMobile} />)}
                                            </ul>
                                        </div>
                                    ) }

                                    { ( total_posts > 0 && posts.length < total_posts ) ? (
                                        <>
                                            <Separator />
                                            { moreLoading ? <Loading small /> : <div className="shop_list_more"><Button more size="medium" onClick={handleLoadMore}>샵 더보기</Button></div> }
                                        </>
                                    ) : (
                                        <div className="shop_search_guide">
                                            <p>고객님이 설정한 위치 기준으로<br />근처 샵이 노출됩니다</p>
                                        </div>
                                    )}
                                </div>
                            ) }

                            { ( ! data || showLoading || ( posts.length === 0 && total_posts > 0 ) ) && (
                                <Loading />
                            ) }

                            { ( ! showLoading && data && total_posts === 0 ) && (
                                <Character useMarginTop type="no_result_05" text={`근처에 샵이 없어요\n고객님이 설정한 위치 기준으로\n근처 샵이 노출됩니다`} />
                            ) }


                            <div className="shop_accordion_wrap">

                                {(Array.isArray(areas) && areas.length > 0) && (
                                    <Accordion>
                                        <Accordion.Item type="title">
                                            <h2>전국 {currentCategory.name} 안내</h2>
                                        </Accordion.Item>
                                        <Accordion.Item type="content">
                                            <div className="shop_accordion_item">
                                                <ul className="column_harf">
                                                    {areas.map(item => (
                                                        <li key={item.id}>
                                                            <Link
                                                                href={ { pathname: '/shoplist/area/[area]/[category]', query: { area: decodeURI( item.slug ), category: decodeURI( currentCategory?.slug ) } } }
                                                                as={ `/지역기반/${ decodeURI( item.slug ) }/${ decodeURI( currentCategory?.slug ) }` }
                                                            >
                                                                <a>{item.name} {currentCategory?.name} 샵 안내</a>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="shop_accordion_content single_content">
                                                <p>
                                                    <Link href={ `${ process.env.DOMAIN }/` }><a>뭉치고에서 다양한 샵 정보 보기</a></Link>
                                                </p>
                                            </div>
                                        </Accordion.Item>
                                    </Accordion>
                                )}

                                <Accordion>
                                    <Accordion.Item type="title">
                                        <h2>자주 묻는 질문과 답변</h2>
                                    </Accordion.Item>
                                    <Accordion.Item type="content">

                                        <div className="shop_accordion_content single_content">
                                            <h6>{ location.lastName ? `${ location.lastName } 주변` : `${ location.name } 근처` }의 샵 노출 기준은 무엇인가요?</h6>
                                            <p>뭉치고는 다양한 샵 정보를 제공하기 위해 설정한 위치 기준으로 근처 샵이 노출됩니다. 위치 설정을 변경 하시려면 우측상단 <a href="#" onClick={ ( event ) => { event.preventDefault(); setShowLocation( true ); } } rel="nofollow" className="icon location">위치설정</a> 버튼을 클릭 해 위치를 변경 해주세요.</p>
                                            <h6>{ location.lastName || location.name }에는 어떤 샵이 있나요?</h6>
                                            <p></p>
                                            <ul className="ul-with-dot">
                                                {category.map(cate => {
                                                    const strQuery = queryString.stringify( { lat: query.lat, lng: query.lng, name: query.name }, queryStringOptions );
                                                    const newUrl = encodeURI( `/위치기반/${ decodeURI( cate.slug ) }` ) + ( strQuery ? `?${ strQuery }` : '' );
                                                    return <li key={cate.name}>
                                                        <Link
                                                            href={ { pathname: router.pathname, query: { category: decodeURI( cate.slug ), lat: query.lat, lng: query.lng, name: query.name } } }
                                                            as={ newUrl }
                                                            shallow={ true }
                                                        >{`${ location.lastName || location.name } ${cate.name}`}</Link>
                                                    </li>
                                                })}
                                            </ul>
                                        </div>

                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}


export const getServerSideProps = async ( { query } ) => {
    const category = await fetch( `${ WPURL }/components/category` ).then( res => res.json() );
    const areas = await fetch(`${WPURL}/components/area`).then(res => res.json());

    const { lat, lng, name } = query;
    const { kakaoRestApiKey } = require('lib/utils');
    const { Josa } = require('components/ui/Forms/utils');

    let lastName = ''; // 행정동
    let newQuery = { order: '', filter: [] };

    try {
        if( name ){
            // 우선 플레이스로 조회
            const geoplace = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURI(name)}`, {
                headers: {
                    Authorization : `KakaoAK ${kakaoRestApiKey}`
                }
            }).then( res => res.json() );

            // 플레이스 키워드가 없는 구역이면 주소 조회
            if( geoplace?.meta?.same_name?.keyword === '' || geoplace?.meta?.same_name?.keyword === 'undefined' ){
                const geolocation = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?y=${lat}&x=${lng}`, {
                    headers: {
                        Authorization : `KakaoAK ${kakaoRestApiKey}`
                    }
                }).then( res => res.json() );

                lastName = geolocation?.documents[0]?.address?.region_3depth_name;
            }
        }
    } catch ( err ){
        // console.log( err );
    }

    for ( const [ key, value ] of Object.entries( query ) ) {
        newQuery = { ...newQuery, [ key ]: ( typeof value === 'string' ? decodeURI( value ) : value ), };
    }

    if ( ! query?.category && category.length > 0 ) {
        return {
            redirect: {
                destination: encodeURI(`/위치기반/${decodeURI(category[0].slug)}/?${decodeURI(queryString.stringify(query, queryString))}`),
                statusCode: 301,
            }
        }
        // newQuery = { ...newQuery, category: decodeURI( category[0].slug ) };
    }

    if ( typeof newQuery.filter === 'string' ) {
        newQuery.filter = [ newQuery.filter ];
    }

    if ( newQuery?.category && category.filter( item => newQuery.category === decodeURI( item.slug ) ).length > 0 ) {
        const { category: seoCategory } = await fetch( `${ WPURL }/modules/shop/seo?${ queryString.stringify( newQuery, queryStringOptions ) }` ).then( res => res.json() );
        let seoData = {};
        let posts = [];

        if ( parseFloat( newQuery?.lat ) > 0 && parseFloat( newQuery?.lng ) > 0 ) {
            const data = await fetch( `${ WPURL }/modules/shop/list?${ queryString.stringify( newQuery, queryStringOptions ) }` ).then( res => res.json() );
            posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );

            if( lastName ){
                seoData = {
                    title: `${lastName} 주변 인기 ${ (seoCategory.name === '스웨디시') ? `${seoCategory.name} 마사지` : seoCategory.name } 업소 - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `${lastName}에 있는 다양한 ${ seoCategory.name } 업체를 만나보세요 인기있는 샵은 ${posts.filter(( item, idx ) => ( idx < 3 )).map(item => item.title).join(', ')}이 있습니다.`.replace( /\s\s+/g, ' ' ),
                };
            } else {
                seoData = {
                    title: `${newQuery.name} 근처 ${ seoCategory.name } - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `근처 ${seoCategory.name} 업소를 찾으세요? ${newQuery.name} ${seoCategory.name}${ Josa(seoCategory.name, '를') } 찾아보세요 - ${posts.filter(( item, idx ) => ( idx < 4 )).map(item => item.title).join(', ')}`.replace( /\s\s+/g, ' ' ),
                };
            }

            return {
                props: { data, query: newQuery, category, seoData, seoCategory, lastName, areas }
            }
        } else {
            if( lastName ){
                seoData = {
                    title: `${lastName} 주변 인기 ${ (seoCategory.name === '스웨디시') ? `${seoCategory.name} 마사지` : seoCategory.name } 업소 - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `${lastName}에 있는 다양한 ${ seoCategory.name } 업체를 만나보세요.`.replace( /\s\s+/g, ' ' ),
                };
            } else {
                seoData = {
                    title: `${newQuery.name} 근처 ${ seoCategory.name } - 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: `근처 ${seoCategory.name} 업소를 찾으세요? ${newQuery.name} ${seoCategory.name}${ Josa(seoCategory.name, '를') } 찾아보세요.`.replace( /\s\s+/g, ' ' ),
                };
            }

            return {
                props: { query: newQuery, category, seoData, seoCategory, lastName, areas }
            }
        }

    }

    return { notFound: true };
}
