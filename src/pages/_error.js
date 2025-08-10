import React from 'react';

import Error from 'components/layout/Error/Error';
import Header from 'components/ui/Header/Header';

export default function Custom404() {
    return (
        <>
            <Header useHome />
            <Error />
        </>
    );
}
