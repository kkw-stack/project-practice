import React from 'react';
import Link from 'next/link';

import queryString from 'query-string';

import { AppContext } from 'lib/context';

import style from './CategoryMenu.module.css';
import { queryStringOptions } from 'lib/utils';

export default function CategoryMenu( props ) {
    const { location } = React.useContext( AppContext );
    const [ userLocation, setUserLocation ] = React.useState({area: 43, areaSlug: "%ec%84%9c%ec%9a%b8", lat: false, lng: false, name: "서울 전체"});

    const mainCategory = (props?.posts || []).filter(item => item.is_main);
    const subCategory = (props?.posts || []).filter(item => !item.is_main);

    React.useEffect( () => {
        if (location.name === "뭉치고") {
            setUserLocation({area: 43, areaSlug: "%ec%84%9c%ec%9a%b8", lat: false, lng: false, name: "서울 전체"});
        } else {
            setUserLocation( location );
        }
    }, [ location ] );

    return (
        <div className={ style.container }>
            <div className={ style.inner }>
                <ul className={ style.primary_category }>
                    { mainCategory.map( ( item ) => {
                        if ( userLocation?.lat && userLocation?.lng ) {
                            return (
                                <li key={ item.id } data-main-cat={ item.class } className={ style.category_item }>
                                    <Link
                                        href={ {
                                            pathname: '/shoplist/location/[category]',
                                            query: { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name, category: decodeURI( item.slug ) }
                                        } }
                                        as={ `/위치기반/${ decodeURI( item.slug ) }?${ queryString.stringify( { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name }, queryStringOptions ) }` }
                                    >
                                        <a>
                                            { ( item.image ) ? (
                                                <figure className={ style.category_icon_img }>
                                                    <p><img src={ item.image } alt={ item.name } /></p>
                                                </figure>
                                            ) : (
                                                <span className={ style.icon }></span>
                                            ) }
                                            <span>{ item.name }</span>
                                        </a>
                                    </Link>
                                </li>
                            );
                        } else {
                            return (
                                <li key={ item.id } data-main-cat={ item.class } className={ style.category_item }>
                                    <Link
                                        href={ {
                                            pathname: '/shoplist/area/[area]/[category]',
                                            query: { area: userLocation.areaSlug, category: item.slug }
                                        } }
                                        as={ `/지역기반/${ decodeURI( userLocation.areaSlug ) }/${ decodeURI( item.slug ) }` }
                                    >
                                        <a>
                                            { ( item.image ) ? (
                                                <figure className={ style.category_icon_img }>
                                                    <p><img src={ item.image } alt={ item.name } /></p>
                                                </figure>
                                            ) : (
                                                <span className={ style.icon }></span>
                                            ) }
                                            <span>{ item.name }</span>
                                        </a>
                                    </Link>
                                </li>
                            );
                        }
                    } ) }
                    {(() => {
                        if(mainCategory.length % 4 !== 0){
                            let empty_items = [];
                            for(let i=1; i <= 4 - parseInt(mainCategory.length % 4); i++){
                                empty_items.push(<li key={ i } className={ style.empty }></li>)
                            }
                            return (empty_items);
                        }
                    })()}
                </ul>
                <ul className={ style.secondary_category }>
                    { subCategory.map( ( item ) => {
                        if ( userLocation?.lat && userLocation?.lng ) {
                            return (
                                <li key={ item.id }>
                                    <Link
                                        href={ {
                                            pathname: '/shoplist/location/[category]',
                                            query: { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name, category: decodeURI( item.slug ) }
                                        } }
                                        as={ `/위치기반/${ decodeURI( item.slug ) }?${ queryString.stringify( { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name }, queryStringOptions ) }` }
                                    >
                                        <a>
                                            <span>{ item.name }</span>
                                        </a>
                                    </Link>
                                </li>
                            )
                         } else {
                            return (
                                <li key={ item.id }>
                                    <Link
                                        href={ {
                                            pathname: '/shoplist/area/[area]/[category]',
                                            query: { area: userLocation.areaSlug, category: item.slug }
                                        } }
                                        as={ `/지역기반/${ decodeURI( userLocation.areaSlug ) }/${ decodeURI( item.slug ) }` }
                                    >
                                        <a>
                                            <span>{ item.name }</span>
                                        </a>
                                    </Link>
                                </li>
                            )
                        }
                    } ) }
                </ul>
            </div>
        </div>
    );
}
