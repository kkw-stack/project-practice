import React from 'react';
import { useRouter } from 'next/router';

import fetch from 'node-fetch';

import { WPURL } from 'lib/utils';
import { AppContext } from 'lib/context';

import Loading from 'components/ui/Loading/Loading';
import NotFound from 'components/layout/NotFound/NotFound';
import ReviewForm from 'components/layout/Review/Form';
import Header from 'components/ui/Header/Header';
import Login from 'components/layout/Login';

export default function ReviewModify( props ) {
    const { review } = props;
    const { user } = React.useContext( AppContext );
    const router = useRouter();

    const handleClose = event => {
        //event.preventDefault();

        router.push( '/review', '/후기관리' );

        return false;
    }

    return (
        <>
            <Header useHome title="후기수정" />

            { ( () => {
                if ( user === false ) {
                    return ( <Login /> );
                } else if ( ! review ) {
                    return ( <Loading /> );
                } else if ( review?.code || review?.author?.user_id !== user?.user_id ) {
                    return ( <NotFound /> );
                } else {
                    return ( <ReviewForm shop={ review.shop } data={ review } /> );
                }
            } )() }
        </>
    );
}

export const getServerSideProps = async ( { query } ) => {
    if ( parseInt( query?.id ) > 0 ) {
        const response = await fetch( `${ WPURL }/modules/review/exists/${ query.id }` ).then( res => res.json() );

        if ( response?.result === true && response?.data?.can_modify ) {
            const seoData = {
                title: `후기수정 | ${ response.data.shop.title } | 뭉치고`.replace( /\s\s+/g, ' ' ),
                description: '여기를 눌러 링크를 확인하세요.'.replace( /\s\s+/g, ' ' ),
            }
            return { props: { review: response.data, seoData, } };
        }
    }

    return { notFound: true };
}