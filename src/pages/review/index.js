import React from 'react';
import Head from 'next/head';

import { AppContext } from 'lib/context';

import Login from 'components/layout/Login';
import ReviewList from 'components/layout/Review/List';
import Header from 'components/ui/Header/Header';

export default function ReviewManageList( props ) {
    const { user } = React.useContext( AppContext );

    return (
        <>
            <Head>
                <meta name="robots" content="noindex" />
            </Head>
            <Header useHome title="후기관리" />
            {user === false ? (
                <Login />
            ) : (
                <div className="view">
                    <ReviewList type="user" author={ user } />
                </div>
            )}
        </>
    );

}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
