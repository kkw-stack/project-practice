import React from 'react';
import { useRouter } from 'next/router';

import queryString from 'query-string';

import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { useShopDetail } from 'lib/swr';
import { WPURL, queryStringOptions } from 'lib/utils';

import Gallery from 'components/ui/Gallery/Gallery';

export default function ShopImage( props ) {
    const { location } = React.useContext( AppContext );
    const searchLocation = {
        lat: ( parseFloat( props?.location?.lat ) > 0 ? props.location.lat : ( parseFloat( location?.lat ) > 0 ? location.lat : 0 ) ),
        lng: ( parseFloat( props?.location?.lng ) > 0 ? props.location.lng : ( parseFloat( location?.lng ) > 0 ? location.lng : 0 ) ),
        ...( parseInt( props?.query?.preview_id ) > 0 ? { preview_id: props.query.preview_id } : {} )
    };

    const { data } = useShopDetail( props.data.slug, searchLocation, props.data );

    const router = useRouter();

    const redirectShop = () => {
        router.push(
            { pathname: '/shop/[slug]', query: { slug: decodeURI( data.slug ), ...location } },
            ( data.slug ? `/샵/${ decodeURI( data.slug ) }` : '#' )
        );
    }

    React.useEffect( () => {
        if ( data ) {
            if ( Array.isArray( data?.basic?.gallery ) && data.basic.gallery.length === 0 ) {
                redirectShop();
            }
        }
    }, [ data ] );

    return (
        <Gallery images={ data.basic.gallery } onCloseClick={ () => router.back() } />
    );
}


export const getServerSideProps = async ( { query } ) => {
    if ( query?.slug ) {
        const location = {
            lat: ( parseFloat( query?.lat ) > 0 ? parseFloat( query.lat ) : '' ),
            lng: ( parseFloat( query?.lng ) > 0 ? parseFloat( query.lng ) : '' ),
            name: ( query?.name ? query.name : '' ),
        };

        const strQuery = (
            parseFloat( query?.lat ) > 0 && parseFloat( query?.lng ) > 0 ?
            queryString.stringify( { lat: query.lat, lng: query.lng }, queryStringOptions ) :
            ''
        );
        const data = (
            parseInt( query?.preview_id ) > 0 ?
            {} :
            await fetch( `${ `${ WPURL }/modules/shop/get/${ encodeURI( decodeURI( query.slug ) ) }` }${ strQuery ? `?${ strQuery }` : '' }` ).then( res => res.json() )
        );

        if ( parseInt( query?.preview_id ) > 0 || data.status === 'publish' ) {
            const seoData = (
                parseInt( query?.preview_id ) > 0 ?
                {} :
                {
                    title: `사진 모두보기 | ${ data.title } | 뭉치고`.replace( /\s\s+/g, ' ' ),
                    description: '여기를 눌러 링크를 확인하세요.',
                    // ...( data?.thumbnail ? { image: data.thumbnail } : {} ),
                }
            );

            if ( ! data?.code || parseInt( query?.preview_id ) > 0 ) {
                return { props: { data, location, seoData, query } };
            }
        }
    }
    return { notFound: true };
}