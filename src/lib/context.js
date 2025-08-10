import React from 'react';
import { useRouter } from 'next/router';
import { getLocalStorageData, cookies, setLocalStorageData } from './utils';
import { useUser } from './swr';

export const AppContext = React.createContext( {} );

export const useAppContext = () => {
    const router = useRouter();

    const [ loading, setLoading ] = React.useState( ( cookies.get( 'jt-mcg-nonce' ) || '' ).length > 0 );
    const { data: user, error, mutate: mutateUser } = useUser();
    const [ location, setLocation ] = React.useState( getLocalStorageData( 'jt-mcg-location' ) || ( getLocalStorageData( 'jt-mcg-locations' ) || [] )?.[0] || { area: false, areaSlug: '', lat: false, lng: false, name: '뭉치고', } );
    const [ isHome, setIsHome ] = React.useState( false );
    const [ showMenu, setShowMenu ] = React.useState( false );
    const [ showLocation, setShowLocation ] = React.useState( false );
    const [ searching, setSearching ] = React.useState( false );
    const [ isLocation, setIsLocation ] = React.useState( false );

    React.useEffect( () => {
        if ( error || user?.code ) {
            cookies.destroy( 'jt-mcg-nonce' );
            mutateUser( false );
        }

        setLoading( false );
    }, [ user ] );

    React.useEffect( () => {
        if( JSON.stringify(location) !== JSON.stringify(getLocalStorageData('jt-mcg-location')) ){
            setLocalStorageData( 'jt-mcg-location', location );
            setIsLocation( true );
        }
    }, [ location ] );

    React.useEffect( () => {
        if ( cookies.get( 'jt-mcg-nonce' ) && user === false ) {
            setLoading( true );
            mutateUser();
        }
    }, [] );

    React.useEffect(() => {
        if( router.pathname === '/' ) {
            setIsHome( true );
        } else {
            setIsHome( false );
        }     
    }, [ router?.pathname ]);

    return { loading, location, user, mutateUser, setLocation, isHome, setIsHome, showMenu, setShowMenu, showLocation, setShowLocation, isLocation, setIsLocation, searching, setSearching };
}