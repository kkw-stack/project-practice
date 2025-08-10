import React from 'react';
import Router from 'next/router';
import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { cookies, WPURL, objectToFormData, jtAlert } from 'lib/utils';

import Login from 'components/layout/Login';
import Nav from 'components/ui/Nav/Nav';
import Vh from 'components/ui/Vh/Vh';
import Form from 'components/ui/Forms';
import Header from 'components/ui/Header/Header';
import Button from 'components/ui/Button/Button';

export default function InquiryForm( props ) {
    const { user } = React.useContext( AppContext );
    const { config } = props;
    const [ isProcess, setIsProcess ] = React.useState( false );

    const handleSubmit = async ( data ) => {
        setIsProcess( true );

        try {
            const formData = objectToFormData( data );

            const response = await fetch( `${ WPURL }/modules/inquiry/add`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: formData,
            } ).then( res => res.json() );

            if ( response?.success ) {
                jtAlert( '문의가 완료되었습니다\n빠른 답변드리겠습니다',()=>{
                    Router.push( { pathname: '/inquiry/list' }, '/나의-문의내역/', { shallow: true } );
                } );
            } else if ( response?.message ) {
                jtAlert( response.message );
            } else {
                jtAlert( '문의 등록 중 오류가 발생했습니다' );
            }
        } catch ( e ) {
            console.log( e );
            jtAlert( '문의 등록 중 오류가 발생했습니다' );
        } finally {
            setIsProcess( false );
        }
    }

    if ( user === false ) {
        return (
            <>
                <Header useHome title="문의하기" />
                <Login />
            </>
        );
    }

    return (
        <>
        <Header useHome title="문의하기" />
        <div className="view">
            <Nav fixed>
                <Nav.item active href={ { pathname: '/inquiry/form' } } as="/문의하기/">1:1 문의하기</Nav.item>
                <Nav.item href={ { pathname: '/inquiry/list' } } as="/나의-문의내역/">나의 문의내역</Nav.item>
            </Nav>

            <div className="inquiry_content">
                <Vh offset={{sm:115,lg:133}}>
                    <Form onSubmit={ handleSubmit } useAlertAgreement>
                        <div className="jt_inquiry_form_inner inner_wrap">
                            <Form.Email name="email" label="이메일" placeholder="이메일을 입력해주세요" value={ user?.email } required />
                            <Form.Phone name="phone" label="휴대폰번호" onlyPhone split required />
                            <Form.Select name="term" label="문의유형" guide="문의유형을 선택해주세요" value={ config?.selectedTerm } required>
                                { config.terms.map( item => (
                                    <Form.Item key={ item.term_id } value={ item.term_id } label={ item.name } />
                                ) ) }
                            </Form.Select>
                            <Form.Text name="title" label="제목" placeholder="제목을 30자 이내로 입력해주세요" max="30" required />
                            <Form.TextArea name="content" label="문의내용" placeholder="문의내용을 입력해주세요" max="1000" size="large" required noMarginBottom />
                            <Form.File name="gallery" { ...config.file } />
                            <Form.Agreement name="privacy" label="개인정보 수집이용 동의" requiredMsg="개인정보 수집이용에 동의해주세요" hideError required>
                                <p>
                                    뭉치고는 이용자님께서 문의한 내용을 통해 소비자 불만 및 분쟁, 제휴상담 등을 처리하고자 최소한의 범위 내에서 아래와 같이 개인정보를 수집·이용합니다.
                                </p>
                                <ul>
                                    <li>
                                        <div className="inquiry_privacy_list">
                                            <b>수집이용·목적</b>
                                        </div>
                                        <p>문의하기</p>
                                    </li>
                                    <li>
                                        <div className="inquiry_privacy_list">
                                            <b>수집항목</b>
                                        </div>
                                        <p>이메일, 휴대폰번호</p>
                                    </li>
                                    <li>
                                        <div className="inquiry_privacy_list">
                                            <b>보유기간</b>
                                        </div>
                                        <p>전자상거래 등에서의 소비자보호에 관한 법률에 따라 3년</p>
                                    </li>
                                </ul>
                            </Form.Agreement>
                            
                            <div className="inquiry_content_submit">
                                <Button type="submit"  disabled={ isProcess } stickBottom>완료</Button>
                            </div>

                        </div>
                    </Form>
                </Vh>
            </div>
        </div>
        </>
    );
}

export const getServerSideProps = async ( { query } ) => {
    const config = await fetch( `${ WPURL }/modules/inquiry/config` ).then( res => res.json() );

    if ( ! config?.code ) {
        if ( ( query?.term || '' ).length > 0 && parseInt( config.terms.find( item => item.name === query.term )?.term_id ) > 0 ) {
            config.selectedTerm = config.terms.find( item => item.name === query.term ).term_id;
        }

        return { props: { config }, };
    }

    return { notFound: true };
}