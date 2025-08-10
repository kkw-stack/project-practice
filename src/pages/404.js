import React from 'react';

import NotFound from 'components/layout/NotFound/NotFound';
import Header from 'components/ui/Header/Header';

export default function Custom404() {
    return (
        <>
            <Header useHome />
            <NotFound />
        </>
    );
}