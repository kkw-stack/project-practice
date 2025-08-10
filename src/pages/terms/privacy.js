import React from 'react';
import { useRouter } from 'next/router';

import fetch from 'node-fetch';

import { WPURL } from 'lib/utils';

import { usePrivacy } from 'lib/swr';

import Header from 'components/ui/Header/Header';
import Form from 'components/ui/Forms';

export default function PrivacyPage( props ) {
    const router = useRouter();
    const isPopup = decodeURI( router.asPath ) === '/개인정보처리방침/seamless';

    const { data } = usePrivacy( props.data );
    const [ currentUrl, hash = '' ] = decodeURI( router.asPath ).split( '#' );
    const [ current, setCurrent ] = React.useState( data.find( item => item.title === hash ) ? data.indexOf( data.find( item => item.title === hash ) ) : 0 );
    const [ currentData, setCurrentData ] = React.useState( '' );
    const handleChange = ( { value } ) => {
        router.push( { pathname: router.route, query: router.query }, `${ currentUrl }#${ data[ value ].title }` );
    }

    React.useEffect( () => {
        if ( data.find( item => item.title === hash ) ) {
            setCurrent( data.indexOf( data.find( item => item.title === hash ) ) );
        }
    }, [ hash ] );

    React.useEffect( () => {
        if ( data?.[ current ]?.content ) {
            setCurrentData( data[ current ]?.content );
        } else {
            setCurrentData( '' );
        }
    }, [ current, data ] );

    return (
        <>
        <Header useHome={ ! isPopup } title="개인정보처리방침" />
        <div className="article sub_privacy view">
            <div className="article_body">
                <div className="privacy_box_wrap">
                    <div className="inner_wrap">
                        <div className="privacy_select">
                            <Form.Select value={ current } onChange={ handleChange } hideGuide>
                                { data.map( ( item, idx ) => (
                                    <Form.Item key={ idx } value={ idx } label={ `${ idx === 0 ? '[현행] ' : '' }${ item.title }` } />
                                ) ) }
                            </Form.Select>
                        </div>

                        <div className="privacy_container" dangerouslySetInnerHTML={ { __html: currentData } }></div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export async function getServerSideProps() {
    const data = await fetch( `${ WPURL }/components/privacy` ).then( res => res.json() );

    return { props: { data, } }
}