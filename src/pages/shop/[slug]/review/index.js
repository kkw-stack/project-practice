import React from 'react';
import { useRouter } from 'next/router';

import queryString from 'query-string';

import { AppContext } from 'lib/context';
import { WPURL, cookies, queryStringOptions, jtAlert } from 'lib/utils';

import Login from 'components/layout/Login';
import Header from 'components/ui/Header/Header';
import ReviewForm from 'components/layout/Review/Form';

export default function ReviewWrite( props ) {
    const { shop } = props;
    const router = useRouter();
    const { user, location } = React.useContext( AppContext );

    const checkAuth = async () => {
        const strQuery = ( parseFloat( location?.lat ) > 0 && parseFloat( location?.lng ) > 0 ? queryString.stringify( location, queryStringOptions ) : '' );

        if ( user.shop.find( item => parseInt( item.shop_id ) === parseInt( shop.id ) ) ) {
            router.push(
                { pathname: '/shop/[slug]', query: { slug: decodeURI( shop.slug ), ...location } },
                `/샵/${ decodeURI( shop.slug ) }/${ strQuery ? `?${ strQuery }` : '' }#후기`
            );
            jtAlert( '클린 시스템이 작동 중입니다\n뭉치고 사장님 고객센터로 연락바랍니다' );
        } else {
            const result = await fetch( `${ WPURL }/modules/review/can?shop_id=${ shop.id }`, {
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) }
            } ).then( res => res.json() );

            if ( ! result?.success ) {
                router.push(
                    { pathname: '/shop/[slug]', query: { slug: decodeURI( shop.slug ), ...location } },
                    `/샵/${ decodeURI( shop.slug ) }/${ strQuery ? `?${ strQuery }` : '' }#후기`
                );
                jtAlert( result?.message || '오류가 발생했습니다' );
            }
        }
    }

    React.useEffect( () => {
        if ( user !== false ) {
            checkAuth();
        }
    }, [ user ] );

    return (
        <>
            <Header useHome title="후기작성" />
            { ( user === false ) ? (
                <Login />
            ) : (
                <ReviewForm shop={ { id: shop.id, title: shop.title, slug: decodeURI( shop.slug ) } } />
            ) }
        </>
    );
}


export const getServerSideProps = async ( { query } ) => {
    if ( query?.slug ) {
        const shop = await fetch( `${ WPURL }/modules/shop/get/${ query.slug }` ).then( res => res.json() );

        if ( ! shop.code && shop?.title ) {
            const seoData = {
                title: `후기작성 | ${ shop.title } | 뭉치고`.replace( /\s\s+/g, ' ' ),
                description: '여기를 눌러 링크를 확인하세요.'.replace( /\s\s+/g, ' ' ),
            };
            return { props: { shop, seoData, } };
        }
    }
    return { notFound: true };
}