import React from 'react';
import Router from 'next/router';

import Header from 'components/ui/Header/Header';
import Form from 'components/ui/Forms';
import Divider from 'components/ui/Divider/Divider';

export default function PartnershipCalculator() {
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

    const handleCloseClick = () => {
        Router.push( '/partnership', '/제휴문의' );
    }

    const handleType = ( { value } ) => {
        if ( calcData.type !== parseInt( value ) ) {
            setCalcData( {
                ...calcData,
                type: parseInt( value ),
                addition: ( parseInt( value ) !== 2 ? calcData.addition : [] ),
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

    React.useEffect( () => {
        const addition = ( calcData.addition.indexOf( '배경색꾸미기' ) >= 0 ? 33000 : 0 );
        const origin = ( parseInt( advertising.type[ calcData.type ].price ) + addition ) * parseInt( advertising.period[ calcData.period ].month );
        const sale = origin - parseInt( origin * advertising.period[ calcData.period ].sale );
        const result = parseInt( origin * advertising.period[ calcData.period ].sale );

        setPrice( {
            origin: origin, sale: sale, result: result
        } );
    }, [ calcData ] );

    return (
        <>
        <Header title="뭉치고 계산기" useHome />
        <div className="article view">
            <div className="article_body">
                <div id="alliance_calculator_popup" className="alliance_calculator_popup popup_layout_wrap">
                    <div className="alliance_apply_wrap scroll_area">
                        <div className="alliance_apply_section_wrap">
                            <div className="alliance_apply_section ad_big_active">
                                <h2 className="alliance_apply_section_title">
                                    광고상품 안내
                                    <p>할인안내 : { advertising.period.map( ( item, idx ) => `${ idx > 0 ? ',' : '' } ${ item.name }${ item.desc }` ) }</p>
                                </h2>
                                <div className="alliance_apply_section_content">
                                    <div className="alliance_apply_item">
                                        <h3 className="title required">광고상품 선택</h3>
                                        <p className="desc">우리샵에 맞는 광고를 시작해보세요.</p>
                                        <Form.RadioButton label="광고상품" value={ calcData.type.toString() } onChange={ handleType } hideLabel required>
                                            { advertising.type.map( ( item, idx ) => (
                                                <Form.Item key={ idx } value={ idx.toString() } label={ item.name } desc={ item.desc } />
                                            ) ) }
                                        </Form.RadioButton>
                                    </div>

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
                                        <h3 className="title">광고기간 선택 </h3>

                                        <Form.RadioButton label="광고기간" value={ calcData.period.toString() } onChange={ handlePeriod } hideLabel>
                                            { advertising.period.map( ( item, idx ) => (
                                                <Form.Item key={ idx } value={ idx.toString() } label={ item.name } desc={ item.desc } />
                                            ) ) }
                                        </Form.RadioButton>
                                    </div>

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
                                </div>
                            </div>

                            <Divider />

                            <div className="alliance_apply_section">
                                <div className="alliance_info_result">
                                    <ul>
                                        <li><span>총 이용금액</span><p><b className="use_price">{ price.origin.toLocaleString( 'ko-KR' ) }</b>원</p></li>
                                        <li><span>할인금액</span><p><b className="sale_price">{` ${ price.sale > 0 ? '-': '' }${ price.sale.toLocaleString( 'ko-KR' ) }`}</b>원</p></li>
                                        <li className="total_price"><span>총 결제금액</span><p><b className="res_price">{ price.result.toLocaleString( 'ko-KR' ) }</b>원</p></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
