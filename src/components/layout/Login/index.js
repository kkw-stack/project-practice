import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import fetch from 'node-fetch';

import { cache } from 'swr';
import { kakaoApiKey, cookies, WPURL, setSessionStorageData,jtAlert } from 'lib/utils';
import { AppContext } from 'lib/context';

import Loading from 'components/ui/Loading/Loading';
import Character from 'components/ui/Character/Character';
import Button from 'components/ui/Button/Button';

export default function Login() {
    const router = useRouter();
    const { user, mutateUser } = React.useContext( AppContext );
    const [ kakao, setKakao ] = React.useState( {} );
    const [ showLoading, setShowLoading ] = React.useState( false );

    const userLogin = ( event ) => {
        event.preventDefault();

        kakao.Auth.login( {
            success: async ( response ) => {
                setShowLoading( true );

                const formData = new FormData();
                formData.append( 'access_token', response.access_token );

                const result = await fetch( `${ WPURL }/member/login/kakao`, {
                    method: 'POST',
                    body: formData
                } ).then( res => {
                    if ( res.headers.get( 'X-WP-Nonce' ) ) {
                        cookies.set( 'jt-mcg-nonce', res.headers.get( 'X-WP-Nonce' ) );
                    }
                    return res.json();
                } );

                if ( parseInt( result?.user_id ) > 0 ) {
                    if ( router.pathname === '/member/login' ) {
                        if ( router?.query?.popup !== undefined ) window.close();
                        else router.push( router?.query.redirect ? router.query.redirect : '/' );
                    }

                    mutateUser( result );
                    
                    cache.cache.clear();

                } else if ( ! result?.phone ) {
                    jtAlert( '휴대폰번호 인증된 카카오계정만 로그인 가능합니다\n쿠키 삭제 후 다시 로그인하세요',()=>{
                        setShowLoading( false );
                    } );
                    return false;
                } else {
                    setSessionStorageData( 'jt-mcg-regist', result );

                    if ( router?.query?.popup !== undefined ) router.push( '/member/regist?popup', '/회원가입?popup' );
                    else router.push( '/member/regist', '/회원가입' );

                    return false;
                }

                setShowLoading( false );
            },
            fail: ( err ) => {
                setShowLoading( false );
                console.log( err );
            }
        } );

        return false;
    }

    React.useEffect( () => {
        if ( typeof window.Kakao === 'undefined' ) {
            const script = document.createElement( 'script' );
            script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
            script.id = 'kakao-sdk';

            document.body.appendChild( script );
            script.onload = () => {
                if ( ! window.Kakao.isInitialized() ) {
                    window.Kakao.init( kakaoApiKey );
                }

                setKakao( window.Kakao );
            }
        } else {
            if ( ! window.Kakao.isInitialized() ) {
                window.Kakao.init( kakaoApiKey );
            }

            setKakao( window.Kakao );
        }

        // if ( user !== false && router.pathname === '/member/login' ) {
        //     router.push( router?.query.redirect ? router.query.redirect : '/' );
        // }
    }, [] );

    React.useEffect( () => {
        if ( user !== false && router.pathname === '/member/login' ) {
            router.push( router?.query.redirect ? router.query.redirect : '/' );
        }
    }, [ user ] );

    // if ( user !== false ) {
    //     router.push( router.query.redirect ? router.query.redirect : '/' );
    // }

    return (
        <>
            { ( user !== false || showLoading === true ) ? (
                <Loading />
            ) : (
                <div className="view">
                    <Character useMarginTop type="welcome" text="카카오계정으로 로그인하세요" />
                    <div className="login_account_box">
                        <Button kakao outline onClick={ userLogin }>카카오로 쉬운시작</Button>
                    </div>
                </div>
            ) }
        </>
    );
}