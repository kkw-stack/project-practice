/*
Ref https://www.digitalocean.com/community/tutorials/react-tabs-component
*/
import React from 'react';
import { useRouter } from 'next/router';

import PropTypes from 'prop-types';

import Tab from './Tab';

import style from './Tabs.module.css';

export default function Tabs( props ) {
    const router = useRouter();
    const { children } = props;
    const [ current, hash ] = decodeURI( router.asPath ).split( '#' );
    const [ activeTab, setActiveTab ] = React.useState( props?.active || children[0].props.label );
    const [ rendered, setRendered ] = React.useState( Date.now() );
    const [ scrollPos, setScrollPos ] = React.useState( 0 );
    const [ isInitted, setIsInitted ] = React.useState( false );

    const menuRef = React.useRef( null );
    const panelsRef = React.useRef( null );

    const handleTabClick = tab => {

        if ( props?.useHash && ( hash || '' ).split( '-' )[0] !== tab ) {
            if ( props?.usePush ) {
                router.push(
                    { pathname: router.route, query: router.query },
                    `${ current }${ props?.ignoreFirst && children[0].props.label === tab ? '' : `#${ tab }` }`,
                    { shallow: true }
                )
            } else {
                router.replace(
                    { pathname: router.route, query: router.query },
                    `${ current }${ props?.ignoreFirst && children[0].props.label === tab ? '' : `#${ tab }` }`,
                    { shallow: true }
                );
            }
        } else {
            setActiveTab( tab );
        }
        
        if (typeof props?.onChange === 'function') {
            return props.onChange(tab);
        }
    }

    React.useEffect( () => {
        if ( isInitted ) {
            if ( props?.rememberScroll ) {
                window.scrollTo( 0, scrollPos );
            }else{
                window.scrollTo( 0, 0 );
            }
        }

        if ( props?.useRefreshOnTabChanged ) {
            setRendered( Date.now() );
        }
    }, [ activeTab ] );

    React.useEffect( () => {
        if ( isInitted && props?.useHash ) {
            if ( ( hash || '' ).length > 0 && hash.split( '-' )[0] !== activeTab ) {
                setActiveTab( hash.split( '-' )[0] );
            } else if ( ( hash || '' ).length === 0 ) {
                setActiveTab( children[0].props.label );
            }
        }

        const handleScroll = () => {
            const scrollY = window.scrollY;
            let top = 0;

            if ( props?.sticky && parseInt( panelsRef.current?.offsetTop ) >= 0 ) {
                const offset = window.innerWidth > 1023 ? 135 : 117 ; // Todo : make it dynamic
                top = ( panelsRef.current.offsetTop - offset < scrollY ? panelsRef.current.offsetTop - offset : scrollY );
            } else {
                top = scrollY;
            }

            setScrollPos( top );
        };

        window.addEventListener( 'scroll', handleScroll );

        return () => {
            window.removeEventListener( 'scroll', handleScroll );
        }
    }, [ hash ] );

    React.useEffect( () => {
        if ( props?.useHash && hash && ( hash || '' ).split( '-' )[0] !== activeTab && children.map( item => item.props.label ).indexOf( ( hash || '' ).split( '-' )[0] ) >= 0 ) {
            setActiveTab( ( hash || '' ).split( '-' )[0] );
        }

        setIsInitted( true );
    }, [] );

    return (
        <div className={ props?.seamless ? style.seamless : '' }>
            <ol ref={ menuRef } className={ `${ style.nav } ${ style[ 'num_'+ children.length ] } ${ props?.fixed ? style.fixed : '' } ${ props?.sticky ? style.sticky : '' }` }>
                { children.map( ( child, idx ) => (
                    <Tab
                        key={ idx }
                        active={ activeTab === child.props.label }
                        title={ child.props?.title || child.props.label }
                        label={ child.props.label }
                        onClick={ handleTabClick }
                    />
                ) ) }
            </ol>

            <div ref={ panelsRef }>
                { children.map( ( child, childIdx ) => (
                    <div key={ `${ rendered }-${ childIdx }` } className={ `${ style.panel } ${ activeTab === child.props.label ? style.show : '' }` }>
                        { child }
                    </div>
                ) ) }
            </div>
        </div>
    );
}

Tabs.propTypes = {
    children: PropTypes.instanceOf( Array ).isRequired,
};
