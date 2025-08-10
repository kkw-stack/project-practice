import React from 'react';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { AppContext } from 'lib/context';
import { WPURL, cookies, jtAlert } from 'lib/utils';

import Loading from 'components/ui/Loading/Loading';
import NotFound from 'components/layout/NotFound/NotFound';
import Header from 'components/ui/Header/Header';
import Icon from 'components/ui/Icon/Icon';
import Button from 'components/ui/Button/Button';
import Login from 'components/layout/Login';

export default function PartnershipResult( props ) {
    const { user } = React.useContext( AppContext );
    const { slug } = props;
    const [ showLoading, setShowLoading ] = React.useState( false );
    const [ data, setData ] = React.useState( false );
    const [ copyText, setCopyText ] = React.useState( '' );

    React.useEffect( () => {
        if ( ! cookies.get( 'jt-mcg-nonce' ) ) {
            setData( false );
        } else if ( ! data ) {
            setShowLoading( true );
            fetch( `${ WPURL }/modules/partnership/result/${ slug }`, { headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) } } )
            .then( res => res.json() )
            .then( res => {
                if ( res?.code === 'empty' || ! res?.type ) {
                    setData( null );
                } else {
                    setData( res );
                }
            } );
        }
    }, [ user ] );

    React.useEffect( () => {
        setShowLoading( false );

        let text = '';
        text += '사장님, 제휴신청이 완료되었습니다\n';
        text += `관리자 확인 후, 샵이 등록되오니 ${ data.type === '일반샵' && false ? '' : '입금 후' } 아래 정보를 꼭 알려주세요!\n\n`;
        text += `(${ data.type })\n`;

        if ( data.type === '일반샵' && false) {
            text += '샵 이름, 닉네임, 샵 전화번호';
        } else {
            text += '샵 이름, 닉네임, 입금일, 입금자명, 입금액\n\n';
            text += '(입금안내)\n';
            text += `● 입금액 : ${ data.price }원\n`;
            text += `● ${ data.bank } ${ data.account }\n`;
            text += `● 예금주 : ${ data.name }`;
        }

        setCopyText( text );
    }, [ data ] );

    return (
        <>
        <Header useHome title="입금안내" />
        { ( showLoading === true ) && (
            <Loading />
        ) }

        { ( showLoading === false && user === false ) && (
            <Login />
        ) }

        { ( showLoading === false && user !== false && data === null ) && (
            <NotFound />
        ) }

        { ( showLoading === false && user !== false && data !== null && data?.type ) && (
            <div className="view">
                <div className="success_inner_wrap inner_wrap">
                    <div className="success_icon">
                        <Icon type="success" size={ 48 } />
                    </div>
                    <h1 className="success_title h3">사장님, 제휴신청이 완료되었습니다.</h1>

                    { ( data.type === '일반샵' && false) ? (
                        <p className="success_subtitle t1">
                            관리자 확인 후, 샵이 등록되오니 <br />
                            아래 정보를 꼭 알려주세요!
                        </p>
                    ) : (
                        <p className="success_subtitle t1">
                            관리자 확인 후, 샵이 등록되오니 <br />
                            입금 후 아래 정보를 꼭 알려주세요!
                        </p>
                    ) }

                    <div className="success_info">
                        <h2 className="success_info_title">{ data.type }</h2>
                        { ( data?.type && data.type === '일반샵' && false) && (
                            <p className="success_info_subtitle t2">샵 이름, 닉네임, 샵 전화번호</p>
                        ) }

                        { ( data?.type && data.type !== '일반샵' || true) && (
                            <>
                            <p className="success_info_subtitle t2">샵 이름, 닉네임, 입금일, 입금자명, 입금액</p>
                            <div className="success_info_list">
                                <b className="success_info_list_title t2">입금안내</b>
                                <ul>
                                    <li>입금액 : { data.price }원</li>
                                    <li>{ data.bank } { data.account }</li>
                                    <li>예금주 : { data.name }</li>
                                </ul>
                            </div>
                            </>
                        ) }

                        <CopyToClipboard text={ copyText } onCopy={ () => jtAlert( '정보를 복사했습니다' ) } options={ { format: 'text/plain' } }>
                            <Button outline>복사</Button>
                        </CopyToClipboard>

                        { ( data.type !== '일반샵' && false) && (
                            <div className="alliance_apply_item">
                                <h3 className="title">광고추가 안내</h3>
                                <p className="add_explain">원하는 지역에 광고를 여러 개 신청하는 것 역시 가능합니다. 광고를 추가하고 싶다면, 제휴신청하기를 추가 작성하시거나 뭉치고 사장님 고객센터로 연락바랍니다.</p>
                            </div>
                        ) }
                    </div>

                    <Button kakao onClick={ () => window.open( 'https://pf.kakao.com/_xnxhxfHT', '_blank' ) }>뭉치고 사장님 고객센터</Button>
                </div>
            </div>
        ) }
        </>
    );
}

export const getServerSideProps = ( { query } ) => ( { props: { ...query } } );
