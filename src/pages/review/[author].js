import React from 'react';
import Head from 'next/head';

import ReviewList from 'components/layout/Review/List';
import { WPURL } from 'lib/utils';

import Header from 'components/ui/Header/Header';

export default function ReviewAuthorList( props ) {
    return (
        <>
        <Head>
            <meta name="robots" content="noindex" />
        </Head>
        <Header useHome title="사용자 후기 모아보기" />

        <div className="view">
            <ReviewList type="author" author={ props.author } />
        </div>
        </>
    );
}

export const getServerSideProps = async ( { query } ) => {
    if ( query?.author ) {
        const author = await fetch( `${ WPURL }/modules/review/author?author=${ query.author }` ).then( res => res.json() );

        if ( ! author?.code ) {
            return { props: { author, } };
        }
    }

    return { notFound: true };
}
