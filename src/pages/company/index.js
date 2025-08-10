import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, {Navigation} from 'swiper';

import { animateInView } from 'lib/utils'

import Header from "components/ui/Header/Header";
import Logo from 'components/ui/Logo/Logo';
import Icon from 'components/ui/Icon/Icon';
import ButtonPrev from 'components/ui/ButtonNav/ButtonPrev';
import ButtonNext from 'components/ui/ButtonNav/ButtonNext';

SwiperCore.use( [ Navigation ] );

export default function Company() {
    const paginationRef = React.createRef();
    const prevRef = React.createRef();
    const nextRef = React.createRef();
    const sectionMainRef = React.createRef();
    const sectionShopListRef = React.createRef();
    const sectionShopViewRef = React.createRef();
    const sectionMessageRef = React.createRef();

    React.useEffect( () => {
        animateInView(sectionMainRef.current);
        animateInView(sectionShopListRef.current);
        animateInView(sectionShopViewRef.current);
        animateInView(sectionMessageRef.current);
    },[]);

    return (
        <>
        <Header useHome title="회사소개" />
        <div className="article view">
            <div className="article_body">
                <div className="introduce_wrap">
                    <h2><Logo /></h2>

                    <Swiper
                        className="introduce_slider"
                        pagination={ { clickable: true } }
                        centeredSlides={ true }
                        spaceBetween={ 10 }
                        slidesPerView={ 'auto' }
                        resistance={ true }
                        resistanceRatio={ 0 }
                        onInit={ ( swiper ) => {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                            swiper.params.pagination.el = paginationRef.current;
                            swiper.pagination.update();
                        } }
                    >
                        <SwiperSlide className="introduce_slider_item introduce_slider_item_01">
                            <p>우리동네 다양한 샵 정보를 <br />쉽게 찾아주는 <br />모바일 플랫폼입니다.</p>
                        </SwiperSlide>
                        <SwiperSlide className="introduce_slider_item introduce_slider_item_02">
                            <p>건전한 샵을 통해 <br />누구나 마음 편한 힐링문화를 <br />만들어나갑니다.</p>
                        </SwiperSlide>
                        <SwiperSlide className="introduce_slider_item introduce_slider_item_04">
                            <p>우리동네 소상공인과 이웃들을 연결하는 <br />지역생활 커뮤니티 서비스로 <br />성장하겠습니다.</p>
                        </SwiperSlide>
                        <SwiperSlide className="introduce_slider_item introduce_slider_item_05">
                            <p>이웃끼리 교류하고 소통하는 <br />따뜻한 지역 생활정보 플랫폼으로 <br />성장하는게 목표입니다.</p>
                        </SwiperSlide>

                        <div ref={ paginationRef }></div>
                        <div className="introduce_slider_nav">
                            <ButtonPrev refer={ prevRef } />
                            <ButtonNext refer={ nextRef } />
                        </div>

                    </Swiper>
                </div>

                <div ref={ sectionMainRef } className="moongchigo_main moongchigo_introduce">
                    <h3>메인화면</h3>
                    <p>세분화된 카테고리로 다양한 샵을 <br />쉽게 찾을 수 있습니다.</p>
                    <div className="phone_case_wrap">
                        <div className="phone_case">
                            <div className="phone_screen_img"></div>
                            <div className="phone_screen_box"></div>
                        </div>
                    </div>
                </div>
                <div ref={ sectionShopListRef } className="moongchigo_shop_list moongchigo_introduce">
                    <h3>샵 목록화면</h3>
                    <p>위치기반을 이용한 인근 샵 정보를 제공합니다.</p>
                    <div className="phone_case_wrap">
                        <div className="phone_case">
                            <div className="phone_screen_img"></div>
                        </div>
                    </div>
                </div>
                <div ref={ sectionShopViewRef } className="moongchigo_shop_view moongchigo_introduce">
                    <h3>샵 상세화면</h3>
                    <p>샵 사진, 샵 상세정보, 샵 후기 등을 <br />확인할 수 있으며, 선택하신 샵에 <br />바로 전화 또는 문자할 수 있습니다.</p>
                    <div className="phone_case_wrap">
                        <div className="phone_case">
                            <div className="phone_screen_img"></div>
                            <div className="phone_screen_box"></div>
                            <div className="btn_call"></div>
                        </div>
                    </div>
                </div>
                <div ref={ sectionMessageRef } className="moongchigo_message moongchigo_introduce">
                    <h3>세상은 <Icon type="globe" size="22" /> 넓고<br />샵은 무진장하다</h3>
                    <p>
                        뭉치고는 고객 여러분의 의견에 <br />
                        귀를 기울이며 더 나은 서비스를 제공하기 위해<br />
                        최선을 다하겠습니다. <br />
                        <span>언제나 첫날의 마음가짐을 잊지 않겠습니다.</span>
                    </p>
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
