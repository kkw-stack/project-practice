import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Pagination} from 'swiper';

import { AppContext } from 'lib/context';

import ScrollTop from 'components/ui/ScrollTop/ScrollTop';

import { useWindowSize } from 'lib/utils';

import style from './Sidebar.module.css';

SwiperCore.use( [ Autoplay, Pagination ] );

export default function Sidebar() {

    const { googlebot } = React.useContext( AppContext );
    const { width } = useWindowSize();
    const paginationRef = React.createRef();
    const isMobile = ( width < 1024 );

    if ( !isMobile ) {
        return (
            <div className={ style.container }>

                <Swiper
                    className={ style.banner }
                    pagination={ { clickable: true } }
                    loop={ true }
                    slidesPerView={ 1 }
                    spaceBetween={ 15 }
                    resistance={ true }
                    resistanceRatio={ 0 }
                    autoplay={ { delay: 4000 } }
                    speed={ 600 }
                    onInit={ ( swiper ) => {
                        swiper.params.pagination.el = paginationRef.current;
                        swiper.pagination.update();
                    } }
                >
                    <SwiperSlide className={ style.banner_item }>
                        <a href="/제휴문의/" rel="nofollow">
                            <figure>
                                <img src={ require( './images/banner-01-v3.jpg' ) } alt="샵을 운영하고 계신가요? 동네 주민들에게 홍보해보세요 무료광고도 가능합니다" className={ !googlebot ? style.lazy : '' } />
                            </figure>
                        </a>
                    </SwiperSlide>
                    <SwiperSlide className={ style.banner_item }>
                        <a href="/회사소개/">
                            <figure>
                                <img src={ require( './images/banner-02-v3.jpg' ) } alt="졸릴~때, 뭉치고 심심할 때, 뭉치고 외로울 때, 뭉치고. 1등 힐링정보 플랫폼, 뭉치고" className={ !googlebot ? style.lazy : '' } />
                            </figure>
                        </a>
                    </SwiperSlide>
                    <div ref={ paginationRef }></div>
                </Swiper>

                <ScrollTop />
            </div>
        );
    }

    return null;
}