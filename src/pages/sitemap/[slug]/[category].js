import React from 'react';
import queryString from 'query-string';

// Next
import Link from 'next/link';
import { useRouter } from 'next/router';

// swr
import { useSitemapAreaList, useSitemapMetroList } from 'lib/swr';

// Utils
import { WPURL, queryStringOptions } from 'lib/utils';

// lib
import getHeader from 'lib/seo';

// Components
import Header from 'components/ui/Header/Header';
import Nav from 'components/ui/Nav/Nav';
import Divider from 'components/ui/Divider/Divider';
import Loading from 'components/ui/Loading/Loading';
import Pagination from 'components/ui/Pagination/Pagination';

export default function SitemapMetro( props ){

    // router
    const router = useRouter();

    // State
    const [ query, setQuery ] = React.useState( props.query );
    const [ serverData, setServerData ] = React.useState( props.data );
    const { data } = ( query.slug === 'metro' ) ? useSitemapMetroList( { rpp: 10, paged: ( query.paged || 1 ), category: ( props.category.filter(( item ) => ( decodeURI( item.slug ) === query.category ))[0] || {} )?.id }, serverData ) : useSitemapAreaList( { rpp: 10, paged: ( query.paged || 1 ), category: ( props.category.filter(( item ) => ( decodeURI( item.slug ) === query.category ))[0] || {} )?.id }, serverData );
    let posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const [ currentCategory, setCurrentCategory ] = React.useState( props.currentCategory );
    const [ totalPage, setTotalPage ] = React.useState( parseInt( props?.data?.total_pages || 1 ) );
    const [ currentPage, setCurrentPage ] = React.useState( query.paged || 1 );
    const [ seoData, setSeoData ] = React.useState( null );
    const [ showLoading, setShowLoading ] = React.useState( false );
    const [ endInit, setEndInit ] = React.useState( false );

    // Handler
    const handleCategory = ( event, category ) => {
        event.preventDefault();
        if( query.category !== category ){
            setQuery( { ...query, paged: 1, category: category } );
        }
        return false;
    }

    const handleSlug = ( event, slug ) => {
        event.preventDefault();
        if( query.slug !== slug ){
            setQuery( { ...query, paged:1, slug: slug } );
        }
        return false;
    }

    const handlePage = ( page ) => {
        if( query.paged !== page ){
            setQuery( { ...query, paged: parseInt( page ) } );
        }
        return false;
    }

    React.useEffect( () => {
        if( data ){
            setTotalPage( data.total_pages || 1 );
        }
    }, [ data ] );

    React.useEffect( async () => {
        if ( endInit ) {
            setShowLoading( true );
            setServerData( false );

            const strQuery = queryString.stringify( { paged: ( query.paged > 1 ? query.paged : '' ) }, queryStringOptions );
            const newUrl = encodeURI( `/sitemap/${query.slug}/${ decodeURI( query.category ) }` ) + ( strQuery ? `?${ strQuery }` : '' );

            if ( router.asPath !== newUrl ) {
                router.push(
                    { pathname: router.pathname, query: query },
                    newUrl,
                    { shallow: true }
                );
            }

            const seoCategory = props.category.filter(( item ) => ( decodeURI( item.slug ) === query.category ))[0];

            setSeoData( {
                title: `${ query.slug === 'metro' ? '지하철 역별' : '지역별' } ${ seoCategory?.name } 사이트맵`.replace( /\s\s+/g, ' ' ),
                description: `${ query.slug === 'metro' ? '지하철 역별' : '지역별' } ${ seoCategory?.name } 샵을 모아둔 사이트맵입니다.`.replace( /\s\s+/g, ' ' ),
            } );

            setCurrentCategory( seoCategory );
            setCurrentPage( query.paged || 1 );
            setShowLoading( false );
        }
    }, [ query ] );

    React.useEffect( () => {
        if ( endInit && !showLoading ) {
            if ( ( query.category !== router.query.category ) || ( query.slug !== router.query.slug ) ) {
                setQuery( { ...query, ...router.query } );
            } else {
                const newQuery = { category: query.category, ...queryString.parse( ( router.asPath.split( '?' ).length > 1 ? router.asPath.split( '?' ).pop() : '' ), queryStringOptions ) };
                if( ( parseInt( query?.paged ) || 1 ) !== ( parseInt( newQuery?.paged ) || 1 ) ){
                    setQuery( newQuery );
                }
            }
        }
    }, [ router ] );

    React.useEffect( () => {
        setEndInit( true );
    }, [] );

    return (
        <>
            { ( seoData !== null ) && ( getHeader( seoData ) ) }
            <div className="article view">
                <Header useHome title='사이트맵' />
                <div className="view article category_list_acticle">

                    <Nav fixed>
                        <Nav.item
                            href={ { pathname: router.pathname, query: { slug: 'area', category: decodeURI(currentCategory.slug) } } }
                            onClick={ e => handleSlug( e, 'area' ) }
                            active={ query.slug === 'area' }
                        >지역별</Nav.item>
                        <Nav.item
                            href={ { pathname: router.pathname, query: { slug: 'metro', category: decodeURI(currentCategory.slug) } } }
                            onClick={ e => handleSlug( e, 'metro' ) }
                            active={ query.slug === 'metro' }
                        >지하철 역별</Nav.item>
                    </Nav>

                    <div className="article_body">
                        <div className="tabs_component sitemap_component">
                            <Nav useArrow fixed>
                                { props.category.map(( item ) => {
                                    return (
                                        <Nav.item
                                            key={ item.id }
                                            href={ { pathname: router.pathname, query: { slug: query.slug, category: decodeURI( item.slug ) } } }
                                            onClick={ e => handleCategory( e, decodeURI( item.slug ) ) }
                                            active={ decodeURI( item.slug ) === decodeURI( query.category ) }
                                        >{ query.slug === 'metro' ? '호선별' : '지역별' } {item.name}</Nav.item>
                                    );
                                })}
                            </Nav>
                            <div className="tabs_panels">
                                { ( !showLoading && posts.length > 0 ) && (
                                    <div className="sitemap_wrap">
                                        { posts.map(( item, idx ) => {
                                            return (
                                                <div key={ idx }>
                                                    { idx !== 0 && <Divider /> }
                                                    <div className="sitemap_list" key={ idx }>
                                                        <h2 className="h4">{ item.name }</h2>
                                                        <ul>
                                                            { item.child.map(( child ) => {
                                                                const strQuery = queryString.stringify( { lat: child.location.lat, lng: child.location.lng, name: child.name }, queryStringOptions );
                                                                return (
                                                                    <li key={ child.id }>
                                                                        <Link
                                                                            href={{
                                                                                pathname: '/shoplist/location/[category]',
                                                                                query: {
                                                                                    category: query.category,
                                                                                    lat: child.location.lat,
                                                                                    lng: child.location.lng,
                                                                                    name: child.name
                                                                                }
                                                                            }}
                                                                            as={ `/위치기반/${ decodeURI( query.category ) }${ strQuery ? `?${ strQuery }` : '' }` }
                                                                        >
                                                                            <a>{ child.name } { query.slug === 'metro' ? '근처' : '주변' } { currentCategory.name }</a>
                                                                        </Link>
                                                                    </li>
                                                                )
                                                            }) }
                                                        </ul>
                                                    </div>
                                                </div>
                                            )
                                        }) }

                                        { ( totalPage > 1 ) && <>
                                            <Divider />
                                            <Pagination url={ router.asPath } current={ parseInt( currentPage ) } total={ totalPage } onChange={ page => handlePage( page ) } />
                                        </> }
                                    </div>
                                ) }

                                { ( !data || showLoading || ( posts.length === 0 && data.total_posts > 0 ) ) && (
                                    <Loading />
                                ) }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export const getServerSideProps = async ( { query } ) => {

    const category = await fetch( `${ WPURL }/components/category` ).then( res => res.json() );
    const currentCategory = category.filter(( item ) => ( decodeURI( item.slug ) === query.category ))[0] || {};
    const paged = query.paged || 1;

    if( ( query.slug === 'area' ) || ( query.slug === 'metro' ) ){
        if ( query?.category && category.filter( item => query.category === decodeURI( item.slug ) ).length > 0 ) {

            const strQuery = queryString.stringify( { paged: paged, category: currentCategory?.id, rpp: 10 }, queryStringOptions );
            const data = ( query.slug === 'metro' ) ? await fetch( `${ WPURL }/modules/sitemap_metro${ strQuery ? `?${ strQuery }` : '' }` ).then( res => res.json() ) : await fetch( `${ WPURL }/modules/sitemap${ strQuery ? `?${ strQuery }` : '' }` ).then( res => res.json() );
            const seoData = {
                title: `${( query.slug === 'metro' ) ? '지하철 역별' : '지역별' } ${ currentCategory?.name } 사이트맵`.replace( /\s\s+/g, ' ' ),
                description: `${( query.slug === 'metro' ) ? '지하철 역별' : '지역별' } ${ currentCategory?.name } 샵을 모아둔 사이트맵입니다.`.replace( /\s\s+/g, ' ' ),
            };

            return { props: { category, currentCategory, query, data, seoData } };
        }
    }

    return { notFound: true };

}
