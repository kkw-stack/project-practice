import React from 'react';
import { useRouter } from 'next/router';

import { jtAlert, jtConfirm } from 'lib/utils';

export default function Form( props ) {
    const router = useRouter();
    const [ submitted, setSubmitted ] = React.useState( Date.now() );
    const childItems = [];
    let dataSort = [];

    const [ updated, setUpdated ] = React.useState( false );
    const lastHistoryState = React.useRef( global?.history?.state );

    const handleChange = ( childData, child ) => {
        setUpdated( true );

        if ( child?.props.onChange && typeof child.props.onChange === 'function' ) {
            child.props.onChange( childData );
        }
    };

    const handleSubmit = ( event ) => {
        event.preventDefault();

        try {
            if ( ! props?.useAlert ) setSubmitted( true );

            const data = {};

            for ( const { current: target } of childItems ) {
                if ( target?.validate !== true ) {
                    if ( props?.useAlert || ( props?.useAlertAgreement && target?.type === 'Agreement' ) ) {
                        jtAlert( target.validate,()=>{
                            target.focus();
                        } );
                    }else{
                        target.focus();
                    }                    
                    return false;
                } else if ( target?.name && target?.validate === true ) {
                    data[ target.name ] = target.value;
                }
            }

            if ( typeof props?.onSubmit === 'function' ) {
                setUpdated( false );
                props.onSubmit( data );
            }
        } catch ( e ) {
            throw e;
        } finally {
            return false;
        }
    };

    const drawChildComponent = child => {
        if ( ! React.isValidElement( child ) ) {
            return child;
        }

        if ( child?.props.children ) {
            if ( child.props?.name ) {
                if ( dataSort.indexOf( child.props?.name ) >= 0 ) throw new Error( '네임이 중복됩니다.' );

                const childRef = React.createRef();

                childItems.push( childRef );
                dataSort.push( child.props.name );

                return React.cloneElement( child, {
                    ...child.props,
                    ref: childRef,
                    submitted: submitted.toString(),
                    onChange: data => handleChange( data, child ),
                    children: React.Children.map( child.props.children, drawChildComponent ),
                } );
            } else {
                return React.cloneElement( child, {
                    ...child.props,
                    children: React.Children.map( child.props.children, drawChildComponent ),
                } );
            }
        } else {
            if ( child.props?.name ) {
                if ( dataSort.indexOf( child.props?.name ) >= 0 ) throw new Error( '네임이 중복됩니다.' );

                const childRef = React.createRef();

                childItems.push( childRef );
                dataSort.push( child.props.name );

                return React.cloneElement( child, {
                    ...child.props,
                    ref: childRef,
                    submitted: submitted.toString(),
                    onChange: data => handleChange( data, child ),
                } );
            } else {
                return React.cloneElement( child, { ...child.props } );
            }
        }
    };
    const childComponents = React.Children.map( props.children, drawChildComponent );

    const confirmationMessage = '사이트에서 나가시겠습니까?\n변경사항이 저장되지 않을 수 있습니다.';
    const beforeUnloadHandler = e => {
        if ( updated ) {
            ( e || window.event ).returnValue = confirmationMessage;
            return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
        }

        return true;
    };
    const beforeRouteHandler = (url) => {
        if ( updated ) {
            if ( router.asPath !== url && ! confirm( confirmationMessage ) ) {
                router.events.emit( 'routeChangeError' );

                const state = lastHistoryState.current;

                if ( state !== null && history.state != null && state.idx !== history.state.idx ) {
                    history.go( state.idx < history.state.idx ? -1 : 1 );
                }
                throw 'Abort Route Change';
            }
        }
    };
    const storeLastHistoryState = () => {
        lastHistoryState.current = history.state;
    };

    React.useEffect(() => {
        window.addEventListener( 'beforeunload', beforeUnloadHandler );
        router.events.on( 'routeChangeStart', beforeRouteHandler );

        return () => {
            window.removeEventListener( 'beforeunload', beforeUnloadHandler );
            router.events.off( 'routeChangeStart', beforeRouteHandler );
        };
    }, [ updated ] );

    React.useEffect( () => {
        router.events.on( 'routeChangeComplete', storeLastHistoryState );

        return () => {
            router.events.off( 'routeChangeComplete', storeLastHistoryState );
        }
    }, [] );

    return (
        <form onSubmit={ handleSubmit }>
            { childComponents }
        </form>
    );
}