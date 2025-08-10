import React from 'react';
import { useRouter } from 'next/router';

import { AppContext } from 'lib/context';
import { getSessionStorageData, delSessionStorageData, objectToFormData, WPURL, cookies, jtAlert } from 'lib/utils';

import Character from 'components/ui/Character/Character';
import Form from 'components/ui/Forms';
import Header from 'components/ui/Header/Header';
import Button from 'components/ui/Button/Button';

export default function MemberRegist( props ) {
    const router = useRouter();
    const { user, mutateUser } = React.useContext( AppContext );
    const [ termStatus, setTermStatus ] = React.useState( { terms_agree: false, policy_agree: false, jt_marketing: false, render: Date.now() } );
    const userData = getSessionStorageData( 'jt-mcg-regist' );
    const [ hideError, setHideError ] = React.useState( false );

    const handleSubmit = async ( data ) => {
        try {
            const formData = {
                user_id: ( userData?.user_id ? userData.user_id : 0 ),
                user_login: ( userData?.user_login ? userData.user_login : '' ),
                nickname: ( data?.nickname ? data.nickname : '' ),
                email: ( data?.email ? data.email : '' ),
                phone: ( userData?.phone ? userData?.phone : '' ),
                terms_agree: ( data?.terms_agree === true ? 'Y' : '' ),
                policy_agree: ( data?.policy_agree === true ? 'Y' : '' ),
                jt_marketing: ( data?.jt_marketing === true ? 'Y' : '' ),
                token: userData?.token,
            };

            setHideError( true );
            const response = await fetch( `${ WPURL }/member/regist/kakao`, {
                method: 'POST',
                body: objectToFormData( formData ),
            } ).then( res => {
                if ( res.headers.get( 'X-WP-Nonce' ) ) {
                    cookies.set( 'jt-mcg-nonce', res.headers.get( 'X-WP-Nonce' ) );
                }
                return res.json()
            } );

            if ( parseInt( response?.user_id ) > 0 ) {
                if ( router?.query?.popup !== undefined ) window.close();
                else router.push( '/' );

                mutateUser( response );
                delSessionStorageData( 'jt-mcg-regist' );
                jtAlert( '가입을 완료했습니다' );
            } else if ( response?.message ) {
                setHideError( false );
                jtAlert( response.message );
            }
        } catch ( e ) {
            console.log( e );
        }
   }

    const handleTerms = ( name, value ) => {
        setTermStatus( {
            ...termStatus,
            [ name ]: value,
        } );
    }

    const handleUpTo14Click = () => {
        jtAlert('정보통신망 이용촉진 및 정보보호 등에 관한 법률에는 만 14세 미만 아동의 개인정보 수집시 법정대리인 동의를 받도록 규정하고 있으며, 만 14세 미만 아동이 법정대리인 동의없이 회원가입을 하는 경우 회원탈퇴 또는 서비스 이용이 제한 될 수 있습니다');
    }

    const toggleAll = ( { target: { checked: value } } ) => {
        setTermStatus( { terms_agree: value, policy_agree: value, jt_marketing: value } );
    }

    const handleAgreementLabelClick = ( event, value ) => {
        if ( value === 'privacy' || value === 'terms' ) {
            event.preventDefault();

            if ( value === 'privacy' ) {
                window.open( '/개인정보수집및이용/seamless', '_blank' );
            } else if ( value === 'terms' ) {
                window.open( '/이용약관/seamless', '_blank' );
            }

            return false;
        }
    }

    React.useEffect( () => {
        if ( user !== false ) {
            delSessionStorageData( 'jt-mcg-regist' );
            router.push( '/' );
        }

        if ( ! userData ) {
            router.push( '/member/login', '/로그인' );
        }
    }, [] );

    React.useEffect( () => {
        if ( user !== false ) {
            router.push( '/' );
        }
    }, [ user ] );

    if ( user !== false || ! userData ) {
        return null;
    }

    return (
        <>
        <Header useHome />
        <div className={ `article register_agree_acticle view` }>
            <div className="article_body">
                <Form onSubmit={ handleSubmit } useAlertAgreement>
                    <div className="inner_wrap">
                        <div className="register_agree_container">
                            <h2 className="h1">오호, 어서오세요!</h2>
                            <p>약관에 동의하시고 다양한 <br/>뭉치고 서비스를 이용해보세요</p>
                            <div className="character_img">
                                <Character type="congratulation" />
                            </div>

                            <div className="register_agree_box">
                                <p className="agree_check_all">
                                    <Form.TrueFalse
                                        label="약관 전체동의"
                                        checked={ ( termStatus.terms_agree === true && termStatus.policy_agree === true && termStatus.jt_marketing === true ) }
                                        hideLabel
                                        noMarginBottom
                                        onClick={ toggleAll }
                                    />
                                </p>

                                <ul>
                                    <li className="terms_agree">
                                        <Form.Agreement
                                            key={ termStatus.render }
                                            name="terms_agree"
                                            label="뭉치고 이용약관 동의"
                                            requiredMsg="뭉치고 이용약관에 동의해주세요"
                                            checked={ termStatus.terms_agree }
                                            onClick={ event => handleTerms( 'terms_agree', event.target.checked ) }
                                            onLabelClick={ e => handleAgreementLabelClick( e, 'terms' ) }
                                            hideError
                                            seamless
                                            modal
                                            required
                                        />
                                    </li>
                                    <li className="policy_agree">
                                        <Form.Agreement
                                            key={ termStatus.render }
                                            name="policy_agree"
                                            label="개인정보 수집이용 동의"
                                            requiredMsg="개인정보 수집이용에 동의해주세요"
                                            checked={ termStatus.policy_agree }
                                            onClick={ event => handleTerms( 'policy_agree', event.target.checked ) }
                                            onLabelClick={ e => handleAgreementLabelClick( e, 'privacy' ) }
                                            hideError
                                            seamless
                                            modal
                                            required
                                        />
                                    </li>
                                    <li>
                                        <Form.Agreement
                                            key={ termStatus.render }
                                            name="jt_marketing"
                                            label="마케팅 정보 메일 수신동의 (선택)"
                                            checked={ termStatus.jt_marketing }
                                            onClick={ event => handleTerms( 'jt_marketing', event.target.checked ) }
                                            seamless
                                        />
                                    </li>
                                </ul>
                            </div>
                            <div className="register_agree_guide">
                                <p>만 14세 이상 고객만 가입 가능합니다.<button type="button" className="agree_policy" onClick={handleUpTo14Click}><span>내용보기</span></button></p>
                                <span>뭉치고는 만 14세 미만 아동의 회원가입을 제한하고 있습니다.</span>
                            </div>
                        </div>

                        <div className="register_useinfo_container">
                            <Form.Member type="nickname" name="nickname" label="닉네임" placeholder="닉네임은 2~10자로 입력해주세요" value={ userData.nickname } banList={ props?.banList || [] } min="2" max="10" hideError={ hideError } required />
                            <Form.Member type="email" name="email" label="이메일" placeholder="이메일을 입력해주세요" value={ userData.email } hideError={ hideError } required />
                            <Form.Member type="phone" name="phone" label="휴대폰번호" value={ userData?.phone } hideError={ hideError } disabled />
                        </div>

                        <Button type="submit">가입완료</Button>

                    </div>
                </Form>
            </div>
        </div>
        </>
    );
}

export const getServerSideProps = async () => {
    const banList = await fetch( `${ WPURL }/member/ban` ).then ( res => res.json() );

    return { props: { banList, } };
}