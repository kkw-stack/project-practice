import React from 'react';
import Router from 'next/router';

import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { WPURL, objectToFormData, cookies, jtAlert } from 'lib/utils';

import Login from 'components/layout/Login';
import Header from 'components/ui/Header/Header';
import Form from 'components/ui/Forms';
import Divider from 'components/ui/Divider/Divider';
import Button from 'components/ui/Button/Button';

export default function PartnershipForm( props ) {
    const { user } = React.useContext( AppContext );

    const { config } = props;
    const advertising = {
        type: [
            { name: '슈퍼리스트', price: 88000, desc: '(88,000원)' },
            { name: '빅히트콜', price: 55000, desc: '(55,000원)' },
            // { name: '일반샵', price: 0, desc: '(무료)' },
            { name: '일반샵', price: 33000, desc: '(33,000원)' },
        ],
        period: [
            { name: '1개월', month: 1, sale: 1, desc: '(정가)' },
            { name: '2개월', month: 2, sale: 0.9, desc: '(10% 할인)' },
            { name: '5개월', month: 5, sale: 0.8, desc: '(20% 할인)' },
        ],
    };

    const [ calcData, setCalcData ] = React.useState( { type: 1, period: 0, addition: [] } );
    const [ price, setPrice ] = React.useState( { origin: 0, sale: 0, result: 0 } );
    const [ privacyStatus, setPrivacyStatus ] = React.useState( false );
    const [ termStatus, setTermStatus ] = React.useState( false );

    const handleType = ( { value } ) => {
        if ( calcData.type !== parseInt( value ) ) {
            setCalcData( {
                ...calcData,
                type: parseInt( value ),
                // addition: ( parseInt( value ) !== 2 ? calcData.addition : [] ),
                addition: calcData.addition,
                // period: ( parseInt( value ) === 2 ? 0 : calcData.period ),
                period: calcData.period,
            } );
        }
    }

    const handlePeriod = ( { value } ) => {
        if ( calcData.period !== parseInt( value ) ) {
            setCalcData( {
                ...calcData,
                period: parseInt( value ),
            } );
        }
    }

    const handleAddition = ( { value } ) => {
        if ( JSON.stringify( value ) !== JSON.stringify( calcData.addition ) ) {
            setCalcData( {
                ...calcData,
                addition: value,
            } );
        }
    }

    const handleCloseClick = () => {
        Router.push( '/partnership', '/제휴문의' );
    }

    const handleSubmit = async ( data ) => {
        try {
            data.ad_type = advertising.type[ data.ad_type ].name;
            // data.ad_period = ( data.ad_type === '일반샵' ? '1개월' : advertising.period[ data.ad_period ].name );
            data.ad_period = advertising.period[data.ad_period].name;
            data.ad_price = price;

            const sendData = objectToFormData( data );

            const response = await fetch( `${ WPURL }/modules/partnership/add`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: sendData,
            } ).then( res => res.json() );

            if ( response?.slug ) {
                Router.push( { pathname: '/partnership/[slug]', query: { slug: response.slug } }, `/입금안내/${ response.slug }` );
            } else if ( response?.message ) {
                jtAlert( response.message );
            } else {
                jtAlert( '오류가 발생했습니다\n잠시 후 다시 시도해주세요' );
            }
        } catch ( e ) {
            jtAlert( '오류가 발생했습니다\n잠시 후 다시 시도해주세요' );
        }
    }


    React.useEffect( () => {
        const addition = ( calcData.addition.indexOf( '배경색꾸미기' ) >= 0 ? 33000 : 0 );
        const origin = ( parseInt( advertising.type[ calcData.type ].price ) + addition ) * parseInt( advertising.period[ calcData.period ].month );
        const sale = origin - parseInt( origin * advertising.period[ calcData.period ].sale );
        const result = parseInt( origin * advertising.period[ calcData.period ].sale );

        setPrice( {
            origin: origin, sale: sale, result: result
        } );
    }, [ calcData ] );

    React.useEffect( () => {
        if ( typeof window.daum === 'undefined' ) {
            const script = document.createElement( 'script' );
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.id = 'kakao-map';

            document.body.appendChild( script );

            script.onload = () => {
                if ( typeof window.daum === 'undefined' ) {
                    window.location.reload();
                }
            }
        }
    }, [] );

    return (
        <>
        <div>
            <Header title="제휴신청하기" useHome useProgress />
        </div>
        { ( user === false ) && (
            <Login />
        ) }

        { ( user !== false ) && (
            <div className={`article view`}>
                <div className="article_body">
                    <div className="alliance_apply_wrap">
                        <Form onSubmit={ handleSubmit } useAlertAgreement>
                            <div className="alliance_apply_section_wrap">
                                <h2 className="alliance_apply_section_title">
                                    1. 광고상품 안내
                                    <p>할인안내 : { advertising.period.map( ( item, idx ) => `${ idx > 0 ? ',' : '' } ${ item.name }${ item.desc }` ) }</p>
                                </h2>
                                <div className="alliance_apply_section_content">
                                    <div className="alliance_apply_item">
                                        <h3 className="title required">광고상품 선택</h3>
                                        <p className="desc">우리샵에 맞는 광고를 시작해보세요.</p>
                                        <Form.RadioButton name="ad_type" label="광고상품" value={ calcData.type.toString() } onChange={ handleType } hideLabel required>
                                            { advertising.type.map( ( item, idx ) => (
                                                <Form.Item key={ idx } value={ idx.toString() } label={ item.name } desc={ item.desc } />
                                            ) ) }
                                        </Form.RadioButton>
                                    </div>

                                    {(calcData.type !== 2 || true) && (
                                        <div className="alliance_apply_item option_add_product_wrap" style={ { display: 'block' } }>
                                            <h3 className="title">추가상품 선택</h3>
                                            <p className="desc">샵 리스트에서 노란 배경색을 사용하여 샵의 가시성을 높이고 고객을 유인하세요.</p>

                                            <div>
                                                <div className="check_bg_emphasis">
                                                    <Form.CheckBox noMarginBottom name="ad_addition" onChange={ handleAddition }>
                                                        <Form.Item value="배경색꾸미기" desc="(33,000원)" />
                                                    </Form.CheckBox>
                                                </div>
                                                <figure>
                                                    <img src={ require( './images/alliance-emphasis-02@2x.jpg' ) } alt="배경색꾸미기" />
                                                </figure>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Divider />
                                <div className="alliance_apply_section">
                                    <h2 className="alliance_apply_section_title">2. 신청인 정보</h2>
                                    <div className="alliance_apply_section_content">
                                        <Form.Text name="ceo_name" label="사장님 성함" placeholder="성함을 입력해주세요" required />
                                        <Form.Phone name="ceo_phone" label="사장님 휴대폰번호" split required noMarginBottom onlyPhone appendChild>
                                            <p className="explain">
                                                <span className="emphasis">
                                                    <i>카카오 알림톡이 입력한 휴대폰번호로 발송됩니다.</i>
                                                </span>
                                            </p>
                                        </Form.Phone>
                                    </div>
                                </div>

                                <Divider />
                                <div className="alliance_apply_section">
                                    <h2 className="alliance_apply_section_title">3. 샵 기본정보</h2>
                                    <div className="alliance_apply_section_content">
                                        <Form.Text name="shop_name" label="샵 이름" placeholder="샵 이름을 30자 이내로 입력해주세요" max="30" required />
                                        <Form.Phone name="shop_phone" label="샵 휴대폰번호 또는 일반전화번호" appendChild noMarginBottom split required>
                                            <>
                                            <p className="explain">샵 휴대폰번호를 우선 기재해주세요.<br />
                                                <span className="emphasis">
                                                    <i>휴대폰번호만 고객의 예약문자를 받을 수 있습니다.</i>
                                                </span>
                                            </p>
                                            </>
                                        </Form.Phone>
                                        <div className="alliance_apply_section_content_trueflase">
                                            <Form.TrueFalse name="shop_use_sms" label="문자예약이 가능한 샵만 체크해주세요." hideLabel />
                                        </div>

                                        <Form.Address name="shop_address" label="샵 주소" explain="홈케어는 출발지의 주소를 입력해주세요." noMarginBottom required />
                                        <div className="alliance_apply_section_content_trueflase">
                                            <Form.TrueFalse name="shop_hide_map" label="주소 및 지도 노출을 원하지 않는 샵만 체크해주세요." hideLabel />
                                        </div>

                                        <Form.Text name="shop_location" label="샵 찾아오는 길" explain="홈케어는 서비스 지역을 입력해주세요." placeholder="예) 강남역 7번 출구 도보 3분" required />

                                        <Form.Text name="shop_price" label="최소금액" placeholder="가장 저렴한 코스 금액을 입력해주세요" required />

                                        <Form.Label text="바로결제 선택 (현재 준비중, 추후 공지 예정)" />
                                        <Form.TrueFalse name="shop_use_card" hideLabel desc="바로결제가 가능한 샵만 체크해주세요."  />

                                        <Form.TextArea name="shop_opening" label="영업시간" placeholder="예) 매일 - 오전 10:00 ~ 익일 새벽 5:00" max="400" required />

                                        <Form.Text name="shop_holiday" label="휴무일" placeholder="예) 연중무휴" required />

                                        {(calcData.type !== 2 || true) && (
                                            <Form.File name="shop_gallery" label="샵 사진" validLabel="사진" { ...config.file.shop } explain={ `${ config.file.shop.size || 15 }MB 이하, 사진 파일만 등록 가능합니다.` } noMarginBottom />
                                        )}
                                    </div>
                                </div>

                                <Divider />
                                <div className="alliance_apply_section">
                                    <h2 className="alliance_apply_section_title">4. 메뉴 탭</h2>
                                    <div className="alliance_apply_section_content">
                                        {(calcData.type !== 2 || true) && (
                                            <Form.TextArea name="menu_guide" label="안내 및 혜택" placeholder="우리샵만의 특장점 또는 이벤트 내용을 입력해주세요 (최대 400자)" max="400" />
                                        )}
                                        <Form.TextList name="menu_keywords" label="#우리샵은이래요" explain="우리샵만의 주요 특징 또는 편의시설 정보를 키워드로 입력해주세요. (최대 10개)" placeholder="주요 특징 또는 편의시설 정보를 입력해주세요" max="10" addText="키워드 추가" itemMax="20" />
                                        <Form.TextArea name="menu_course" labelText="코스안내" label="코스목록" explain="대표코스를 지정해서 입력하시면, 코스명에 '대표' 뱃지가 노출됩니다. (최대 3개)" max="1000" placeholder="우리샵의 코스목록을 입력해주세요" required noMarginBottom />
                                        <Form.File name="menu_gallery" label="사진" hideLabel { ...config.file.menu }>
                                            <p className="jt_custom_file_info">
                                                코스목록을 사진으로 첨부해주시면 정보입력에 큰 도움이 됩니다. <br />
                                                { config.file.menu.size || 15 }MB 이하, 사진 파일만 등록 가능합니다.
                                            </p>
                                        </Form.File>

                                        <Form.CheckList
                                            name="menu_category"
                                            labelText="카테고리 선택"
                                            label="카테고리"
                                            explain="우리샵에 맞는 카테고리를 선택해주세요. (중복선택 가능)<br />카테고리는 관리자 확인 후 확정됩니다."
                                            className="alliance_category_select"
                                            appendError
                                            required
                                        >
                                            { config.terms.map( ( item, idx ) => (
                                                <Form.Item key={ idx } className={ ( item?.class ? item.class : '' ) } value={ item.id } label={ item.name }>
                                                    {/* 아이콘 제거 :: 2022-11-14 요청건
                                                    <>
                                                    { ( item?.image ) ? (
                                                        <figure className="category_icon_img">
                                                            <p><img src={ item.image } alt={ item.name } /></p>
                                                        </figure>
                                                    ) : (
                                                        <span className="category_icon"></span>
                                                    ) }
                                                    </> */}
                                                </Form.Item>
                                            ) ) }
                                        </Form.CheckList>
                                    </div>
                                </div>

                                <Divider />
                                <div className="alliance_apply_section">
                                    <h2 className="alliance_apply_section_title">5. 정보 탭</h2>
                                    <div className="alliance_apply_section_content">
                                        <Form.TextArea name="info_intro" label="샵 소개" placeholder="우리샵을 소개해주세요 (최대 400자)" max="400" />
                                        <Form.TextArea name="info_member" label="관리사님 소개" placeholder="관리사님 소개 글을 입력해주세요 (최대 400자)" max="400" />
                                        <Form.TextList name="info_manager" label="관리사님 호칭" placeholder="예) 제니 관리사님" max="20" countStr="명" addText="관리사님 추가" />
                                        <Form.Text name="info_company" label="상호명" placeholder="상호명을 입력해주세요" />
                                        <Form.CompanyCode name="info_code" label="사업자등록번호" split />
                                    </div>
                                </div>

                                {(calcData.type !== 2 || true) && (
                                    <>
                                    <Divider />
                                    <div className="alliance_apply_section shop_review">
                                        <h2 className="alliance_apply_section_title">6. 후기 탭</h2>
                                        <div className="alliance_apply_section_content">
                                            <Form.TextArea name="review_notice" label="알려드립니다" placeholder="후기이벤트 관련 내용을 입력해주세요 (최대 400자)" max="400" noMarginBottom />
                                        </div>
                                    </div>
                                    </>
                                )}

                                <Divider />
                                <div className="alliance_apply_section">
                                    <div className="alliance_agree_box">
                                        <Form.Agreement
                                            name="agreement_privacy"
                                            label="개인정보 수집이용 동의"
                                            className="alliance_privacy"
                                            requiredMsg="개인정보 수집이용에 동의해주세요"
                                            checked={ privacyStatus }
                                            onChange={ ( { value } ) => setPrivacyStatus( value ) }
                                            hideError
                                            required
                                        >
                                            <p className="t4">뭉치고는 고객님께서 제휴신청한 내용을 통해 광고서비스 이용을 진행하고자 아래와 같은 개인정보를 수집&middot;이용합니다.</p>
                                            <ul>
                                                <li>
                                                    <div className="inquiry_privacy_list">
                                                        <b>수집이용&middot;목적</b>
                                                    </div>
                                                    <p>광고서비스 이용</p>
                                                </li>
                                                <li>
                                                    <div className="inquiry_privacy_list">
                                                        <b>수집항목</b>
                                                    </div>
                                                    <p>신청인 성함, 신청인 휴대폰번호, 샵 전화번호, 샵 주소</p>
                                                </li>
                                                <li>
                                                    <div className="inquiry_privacy_list">
                                                        <b>보유기간</b>
                                                    </div>
                                                    <p>광고서비스 이용계약 해지 시까지</p>
                                                </li>
                                            </ul>
                                        </Form.Agreement>
                                        <Form.Agreement
                                            name="agreement_pledge"
                                            label="뭉치고 제휴서약서 동의"
                                            className="alliance_pledge"
                                            requiredMsg="뭉치고 제휴서약서에 동의해주세요"
                                            checked={ termStatus }
                                            onChange={ ( { value } ) => setTermStatus( value ) }
                                            hideError
                                            required
                                        >
                                            <p className="pledge_desc t4">뭉치고는 건전한 샵을 통해 누구나 마음 편한 힐링문화를 만들어나갑니다. <br/>(뭉치고 제휴샵으로서 다음 사항에 동의합니다. 제휴서약서는 자동 저장됩니다.)</p>
                                            <ul className="pledge_list">
                                                <li><p>저희 샵은 건전하게 운영되며, 퇴폐 등의 불법행위를 절대 하지 않을 것임을 동의합니다.</p></li>
                                                <li><p>저희 샵은 제휴기간 중 불법행위가 확인될 시, 제휴기간이 강제 종료됨을 동의합니다.</p></li>
                                                <li><p>추후 저희 샵에 어떠한 문제가 발생하더라도, 이는 뭉치고와는 무관하며 사이트 운영자에게 어떤 책임도 없음을 동의합니다.</p></li>
                                            </ul>
                                        </Form.Agreement>
                                        <Form.Agreement name="agreement_marketing" label="마케팅 정보 메일 SMS 수신동의 (선택)" />
                                    </div>
                                </div>

                                <Divider />
                                <div className="alliance_apply_section alliance_apply_price_section">
                                    <h2 className="alliance_apply_section_title">이용 가격 (30일 단위, VAT 포함)</h2>
                                    <div className="alliance_apply_section_content">
                                        <div className="alliance_apply_item">
                                            <h3 className="title">광고상품</h3>
                                            <p className="select_text">{ advertising.type[ calcData.type ].name }</p>
                                        </div>

                                        <div className="alliance_apply_item">
                                            <h3 className="title required">광고기간 선택</h3>
                                            <Form.RadioButton key={ calcData.type } name="ad_period" label="광고기간" value={ calcData.period.toString() } onChange={ handlePeriod } hideLabel>
                                                { advertising.period.map( ( item, idx ) => (
                                                    <Form.Item key={ `${ calcData.type }-${ idx }` } value={ idx.toString() } label={ item.name } desc={ item.desc } />
                                                ) ) }
                                            </Form.RadioButton>
                                        </div>

                                        {(calcData.type !== 2 || true) && (
                                            <div className="alliance_apply_item">
                                                <h3 className="title">추가상품</h3>
                                                <p className="select_text">
                                                    { ( calcData.addition.length > 0 ) ? (
                                                        calcData.addition.map( ( item, idx ) => ( idx > 0 ? ',' : '' ) + item )
                                                    ) : (
                                                        '선택안함'
                                                    ) }
                                                </p>
                                            </div>
                                        )}
                                        <div className="alliance_apply_item">
                                            <h3 className="title">광고추가 안내</h3>
                                            <p className="add_explain">원하는 지역에 광고를 여러 개 신청하는 것 역시 가능합니다. 광고를 추가하고 싶다면, 제휴신청하기를 추가 작성하시거나 뭉치고 사장님 고객센터로 연락바랍니다.</p>
                                        </div>
                                    </div>
                                </div>

                                <Divider />
                                <div className="alliance_apply_section">
                                    <div className="alliance_info_result">
                                        <ul>
                                            <li><span>총 이용금액</span><p><b className="use_price">{ price.origin.toLocaleString( 'ko-KR' ) }</b>원</p></li>
                                            <li><span>할인금액</span><p><b className="sale_price">{ ( price.sale > 0 ? '-' + price.sale.toLocaleString( 'ko-KR' ) : '0' ) }</b>원</p></li>
                                            <li className="total_price"><span>총 결제금액</span><p><b className="res_price">{ price.result.toLocaleString( 'ko-KR' ) }</b>원</p></li>
                                        </ul>
                                    </div>
                                    {(calcData.type !== 2 || true) && (
                                        <div className="alliance_apply_section_content">
                                            <div className="alliance_apply_item">
                                                <p className="desc">
                                                    제휴신청 완료 후 안내되는 계좌로 입금하신 후 <span className="emphasis">뭉치고 사장님 고객센터</span> (<a href={ config.bank.link } className="ceo_sc" target="_blank" rel="noopener noreferrer">바로가기</a>) 로 연락바랍니다.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="jt_btn_wrap">
                                <Button type="submit">뭉치고 제휴신청 완료</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        ) }
        </>
    );
}

export const getServerSideProps = async () => {
    const config = await fetch( `${ WPURL }/modules/partnership/config` ).then( res => res.json() );
    return { props: { config }, }
}
