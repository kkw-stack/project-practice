import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { WPURL, objectToFormData, cookies, getDateFormat, jtAlert } from 'lib/utils';

import Login from 'components/layout/Login';
import Avatar from 'components/ui/Avatar/Avatar';
import Content from 'components/ui/Content/Content';
import Divider from 'components/ui/Divider/Divider';
import Header from 'components/ui/Header/Header';
import Form from 'components/ui/Forms';
import Loading from 'components/ui/Loading/Loading';
import Button from 'components/ui/Button/Button';

export default function Profile() {
    const { user, mutateUser } = React.useContext( AppContext );
    const [ avatar, setAvatar ] = React.useState( parseInt( user.avatar ) ? parseInt( user.avatar ) : 1 );
    const [ marketing, setMarketing ] = React.useState( user.marketing === 'Y' );
    const [ logout, setLogout ] = React.useState( false );
    const router = useRouter();

    const handleSubmit = async ( event ) => {
        event.preventDefault();

        try {
            const formData = objectToFormData( { avatar: parseInt( avatar ) } );
            const response = await fetch( `${ WPURL }/member/profile`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: formData,
            } ).then( res => res.json() );

            if ( response === true ) {
                mutateUser();
            }
            jtAlert( '내 정보 수정이 완료되었습니다',()=>{
                router.push( '/' );
            } );
        } catch ( e ) {
            console.log( e );
            jtAlert( '내 정보 수정 중 오류가 발생했습니다' );
        }

        return false;
    }

    const handleAvatar = ( { target } ) => {
        setAvatar( parseInt( target.value ) );
    }

    const handleLogOut = ( event ) => {
        event.preventDefault();

        setLogout( true );

        fetch( `${ WPURL }/member/logout`, {
            method: 'POST',
            headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
        } ).then( () => {
            router.push( '/' );
            cookies.destroy( 'jt-mcg-nonce' );
            mutateUser( false );
        } );

        return false;
    }

    React.useEffect( () => {
        if ( user !== false ) {
            const newValue = ( marketing === true ? 'Y' : 'N' );
            if ( newValue !== user.marketing ) {
                fetch( `${ WPURL }/member/profile`, {
                    method: 'POST',
                    headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                    body: objectToFormData( { marketing: newValue } ),
                } ).then( () => {
                    mutateUser( { ...user, marketing: newValue } );
                } );

                setTimeout( () => {
                    const message = `마케팅 정보 메일 수신${ marketing ? '동의' : '거부' }\n` +
                        `전송자 : 뭉치고\n` +
                        `적용일시 : ${ getDateFormat( Date.now(), 'YYYY-MM-DD HH:mm' ) }\n` +
                        `처리내용 : 수신${ marketing ? '동의' : '거부' } 처리완료`;
                    jtAlert( message );
                }, 300 );
            }
        }
    }, [ marketing ] );

    return (
        <>
        <Header useHome title="내 정보 수정" />
        { ( logout === true ) && (
            <Loading />
        ) }
        { ( logout === false && user === false ) && (
            <Login />
        ) }

        { ( logout === false && user !== false ) && (
            <div className="article view">
                <form onSubmit={ handleSubmit }>
                    <div className="profile_modify_wrap">
                        <div className="content_wrap">
                            <ul className="profile_select">
                                <li className="profile_1">
                                    <input type="radio" id="profile_1" value="1" checked={ avatar === 1 } onChange={ handleAvatar } />
                                    <label htmlFor="profile_1">
                                        <Avatar type="1" size="medium" active={ avatar === 1 } />
                                        <span className="sr_only">사랑스러운</span>
                                    </label>
                                </li>
                                <li className="profile_2">
                                    <input type="radio" id="profile_2" value="2" checked={ avatar === 2 } onChange={ handleAvatar } />
                                    <label htmlFor="profile_2">
                                        <Avatar type="2" size="medium" active={ avatar === 2 } />
                                        <span className="sr_only">멋진</span>
                                    </label>
                                </li>
                                <li className="profile_3">
                                    <input type="radio" id="profile_3" value="3" checked={ avatar === 3 } onChange={ handleAvatar } />
                                    <label htmlFor="profile_3">
                                        <Avatar type="3" size="medium" active={ avatar === 3 } />
                                        <span className="sr_only">귀여운</span>
                                    </label>
                                </li>
                            </ul>

                            <Content title="닉네임">
                                <p>{ user.nickname }</p>
                            </Content>

                            <Content title="이메일">
                                <p className="jt_complete_text">{ user.email }</p>
                            </Content>
                        </div>
                        <Divider />
                        <div className="content_wrap marketing_modify">
                            <Content title="마케팅 정보 수신동의" subtitle="이벤트 및 혜택에 대한 정보를 받으실 수 있어요.">
                                <div className="marketing_agree">
                                    <span>메일 수신동의</span>
                                    <Form.TrueFalse name="jt_marketing" type="toggle" hideLabel checked={ marketing } onChange={ ( { value } ) => setMarketing( value ) } />
                                </div>
                                <ul className="mypage_modify_util">
                                    <li>
                                        <Link href="/">
                                            <a onClick={ handleLogOut }><span>로그아웃</span></a>
                                        </Link>
                                    </li>
                                    <li className="withdraw_open">
                                        <Link href="/member/withdraw" as="/회원탈퇴/">
                                            <a><span>회원탈퇴</span></a>
                                        </Link>
                                    </li>
                                </ul>
                            </Content>

                            <Button type="submit"><span>완료</span></Button>
                        </div>
                    </div>
                </form>
            </div>
        ) }
        </>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
