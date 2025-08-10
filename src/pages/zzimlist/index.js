import React from 'react';

import { AppContext } from 'lib/context';
import { useZzimList } from 'lib/swr';
import { useOnScreen, useDevice } from 'lib/utils';

import Login from 'components/layout/Login';
import Loading from 'components/ui/Loading/Loading';
import ListItem from 'components/ui/ListItem/ListItem';
import Character from 'components/ui/Character/Character';
import Header from 'components/ui/Header/Header';
import HeaderList from 'components/ui/HeaderList/HeaderList';
import Vh from 'components/ui/Vh/Vh';

export default function ZzimList() {
    const { user, location } = React.useContext( AppContext );

    const scrollRef = React.createRef();
    const { data, size, setSize, mutate } = useZzimList( { location: JSON.stringify( location ) } );

    const posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );

    const [ isMobile, setIsMobile ] = React.useState( false );

    React.useEffect( () => {
        if ( data && isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    React.useEffect( () => {
        mutate();
    }, [ user ] );

    React.useEffect( () => {
        const device = useDevice();
        setIsMobile( device.isMobile() );
    }, [] );

    if ( user === false ) return (
        <>
            <Header useHome title="찜한샵" />
            <Login />
        </>
    );
    if ( ! data || ( total_posts > 0 && posts.length === 0 ) ) return ( <Loading /> );

    return (
        <>
            <Header useHome title="찜한샵" />
            <div className="view">
            { ( total_posts > 0 ) ? (
                    <div className="wish_list_wrap">
                        <HeaderList title={`총 ${ total_posts }개`} tooltip="광고가 종료되었거나, 중단된 샵은 보여지지 않습니다" />

                        <div className="wish_list">
                            <ul>
                            {posts.map(item => <ListItem key={`${item.type}-${item.id}`} data={item} isMobile={isMobile} />)}
                            </ul>
                        </div>
                        <div ref={ scrollRef } />
                    </div>

            ) : (
                <Character useMarginTop type="like" text="자주 찾는 샵을 찜 해보세요" />
            ) }
            </div>
        </>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
