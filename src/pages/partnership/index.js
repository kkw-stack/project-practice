import React from 'react';
import Link from 'next/link';

import { animateInView } from 'lib/utils'

import Header from 'components/ui/Header/Header';
import Button from 'components/ui/Button/Button';

export default function Partnership() {

    const kakaoFabRef = React.createRef();

    React.useEffect( () => {
        animateInView(kakaoFabRef.current, '30%', false);
    },[]);

    return (
        <div className="article view">
            <Header useHome title="제휴문의">
                <Link href="/partnership/calculator" as="/제휴문의/계산기/">
                    <a className="btn_calculator"><span>계산기</span></a>
                </Link>
            </Header>
            <div className="article_body">
                <div className="alliance_info_wrap">
                    <div className="alliance_info_banner">
                        <div className="alliance_info_banner_inner">
                            <h2><span>뭉치고</span>와 함께하세요</h2>
                            <span>뭉치고는 사장님과 고객을 연결합니다 <br/>우리샵에 맞는 광고를 시작해보세요</span>
                        </div>
                    </div>
                    <div className="alliance_info_container">
                        <div className="alliance_info_item">
                            <h3><b>슈퍼리스트</b><span className="mark_mint">월정액</span></h3>
                            <p className="alliance_info_text">카테고리 리스트 최상단 영역에 노출됩니다. <br/>빅히트콜 영역에 한 번 더 노출됩니다.</p>
                            <p className="add_guide">원하는 지역에 광고를 여러 개 신청하는 것 역시 가능합니다.</p>
                            <figure className="jt_lazyload_wrap jt_lazy_img">
                                <img src={ require( './images/alliance-super@2x.png' ) } />
                            </figure>

                        </div>
                        <div className="alliance_info_item bg_noise">
                            <h3><b>빅히트콜</b><span className="mark_mint">월정액</span></h3>
                            <p className="alliance_info_text">위치기반서비스로 우리샵 주변의 <br/>다양한 고객과 만나보세요.</p>
                            <p className="add_guide">원하는 지역에 광고를 여러 개 신청하는 것 역시 가능합니다.</p>
                            <figure className="jt_lazyload_wrap jt_lazy_img">
                                <img src={ require( './images/alliance-big@2x.png' ) } />
                            </figure>
                        </div>
                        <div className="alliance_info_item">
                            <h3><b>일반샵</b><span className="mark_mint">월정액</span></h3>
                            <p className="alliance_info_text">광고 비용의 부담 없이 우리샵을 홍보해 보세요.</p>
                            <p className="add_guide">원하는 지역에 광고를 여러 개 신청하는 것 역시 가능합니다.</p>
                            <figure className="jt_lazyload_wrap jt_lazy_img">
                                <img src={ require( './images/alliance-normal@2x.png' ) } />
                            </figure>
                        </div>
                        <div className="alliance_info_item bg_noise">
                            <h3><b>배경색꾸미기</b><span className="mark_pink">추가상품</span></h3>
                            <p className="alliance_info_text">샵 리스트에서 <span>노란 배경색</span>을 통해 한 번 더 <br/>고객의 시선을 끌고 우리샵 선택을 유도해보세요.</p>
                            <figure className="jt_lazyload_wrap jt_lazy_img">
                                <img src={ require( './images/alliance-emphasis@2x.png' ) } alt="" />
                            </figure>
                        </div>
                    </div>
                    <div className="alliance_contact">
                        <h3>사장님, 도움이 필요하신가요?</h3>
                        <p>뭉치고 사장님 고객센터(카카오톡 채널)로 문의해주세요. <br/>최대한 빠른 도움드리겠습니다.</p>
                        <ul className="kakao_talk_contact">
                            <li className="kakao_channel">
                                <a href="https://pf.kakao.com/_xnxhxfHT" target="_blank" rel="noopener noreferrer">
                                    <Button kakao icon="kakao_channel">뭉치고 사장님 고객센터</Button>
                                </a>
                            </li>
                        </ul>
                        <Link href="/partnership/form" as="/제휴문의/신청/">
                            <div ref={ kakaoFabRef }  data-target=".btn_kakaotalk_link">
                                <Button>뭉치고 제휴신청하기</Button>
                            </div>
                        </Link>
                    </div>

                    <a href="https://pf.kakao.com/_xnxhxfHT" target="_blank" rel="noopener noreferrer" className="btn_kakaotalk_link">
                        <span className="sr_only">카카오톡 연결</span>
                    </a>
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
