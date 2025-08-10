import React from 'react';

import { WPURL } from 'lib/utils';
import { usePrivacyRegist } from 'lib/swr';

import Header from 'components/ui/Header/Header';

export default function Personal( props ) {
    const { data } = usePrivacyRegist( props.data );

    return (
        <>
        <Header title="개인정보 수집 및 이용" />
        <div className="article sub_privacy view">
            <div className="article_body">
                <div className="privacy_box_wrap">
                    <div className="inner_wrap" dangerouslySetInnerHTML={ { __html: data } }></div>
                </div>
            </div>
        </div>
        </>
    );
}


export async function getServerSideProps() {
    const data = await fetch( `${ WPURL }/components/privacy/regist` ).then( res => res.json() );

    return { props: { data, } }
}