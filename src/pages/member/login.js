import React from 'react';

import Login from 'components/layout/Login';
import Header from 'components/ui/Header/Header';

export default function MemberLogin() {
    return (
        <>
            <Header useHome />
            <Login />
        </>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
