import React from 'react';
import { useRouter } from 'next/router';

import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { cookies, WPURL, jtAlert, jtConfirm } from 'lib/utils';
import Header from 'components/ui/Header/Header';
import Form from 'components/ui/Forms';
import Loading from 'components/ui/Loading/Loading';
import Button from 'components/ui/Button/Button';

export default function MemberWithdraw() {
    const { user, mutateUser } = React.useContext( AppContext );
    const router = useRouter();
    const [ agree, setAgree ] = React.useState( false );

    const handleWithdraw = async ( event ) => {
        event.preventDefault();

        if ( agree && await jtConfirm( '정말로 회원탈퇴하시겠습니까?' ) ) {
            const response = await fetch( `${ WPURL }/member/withdraw`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) }
            } ).then( res => res.json() );

            if ( response === true ) {
                router.push( '/' );
                cookies.destroy( 'jt-mcg-nonce' );
                mutateUser( false );
            } else if ( response?.message ) {
                jtAlert( response.message );
            } else {
                jtAlert( '회원 탈퇴 중 오류가 발생했습니다' );
            }
        }

        return false;
    }

    React.useEffect( () => {
        if ( user === false ) {
            router.push( '/' );
        }
    }, [ user ] );

    if ( user === false ) {
        return ( <Loading /> );
    }

    return (
        <div className="article view">
            <Header useHome title="회원탈퇴" />
            <div className="article_body">
                <div id="withdraw_popup" className="withdraw_popup popup_layout_wrap">
                    <div className="withdraw_container scroll_area">
                        <h2>유의사항</h2>
                        <span>회원탈퇴 전에 꼭 확인해주세요.</span>
                        <ul>
                            <li>뭉치고 회원탈퇴 시 뭉치고 계정이 삭제되며, 보유하고 계신 포인트 및 쿠폰은 소멸되고 재발행이 불가능합니다.</li>
                            <li>탈퇴한 계정의 이용 기록은 모두 삭제되며, 삭제된 데이터는 복구가 불가합니다.</li>
                            <li>[삭제되는 이용 기록] <br/>닉네임, 이메일, 찜, 후기, 1:1문의, 정보 수정요청, 제휴문의, 포인트, 쿠폰</li>
                        </ul>
                        <p className="withdraw_agree">
                            <Form.TrueFalse key={ Date.now() } hideLabel label="위 내용을 확인하였으며 이에 동의합니다." checked={ agree } onChange={ ( { value } ) => setAgree( value ) } />
                        </p>
                        <Button  disabled={ ! agree } onClick={ handleWithdraw }>계정 삭제하기</Button>
                    </div>
                    { /*
                    <button type="button" className={ `jt_btn_basic btn_withdraw jt_type_01 ${ ( agree === true ? '' : 'disabled' ) }` } disabled={ ! agree } onClick={ handleWithdraw } style={ { position: 'fixed' } }>
                        <span>계정 삭제하기</span>
                    </button>
                    */}
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
