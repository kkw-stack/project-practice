import React,{ Component } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';

import style from './NoticeSlideshow.module.css';

export default class NoticeSlideshow extends Component {

    render = () => {
        return (
            <div className={ style.container }>
                <p className={ style.icon_notice }><span className="sr_only">공지사항</span></p>
                <div className={ style.slideshow }>
                    <Swiper
                        direction={ 'vertical' }
                        loop={ true }
                        allowTouchMove={ false }
                        speed={ 1000 }
                        autoplay={ { delay: 2500, disableOnInteraction: false } }
                    >
                        { this.props.posts.map( ( item, i ) => {
                            return (
                                <SwiperSlide className={ style.slide } key={ `main_notice_${ i }` }>
                                    { ( item.target === true ) ? (
                                        <a href={ item.url } target="_blank" rel="noopener noreferrer">
                                            <span className={ style.slide_inner }>{ item.content }</span>
                                        </a>
                                    ) : (
                                        <a href={ item.url }>
                                            <span className={ style.slide_inner }>{ item.content }</span>
                                        </a>
                                    ) }
                                </SwiperSlide>
                            );
                        } ) }
                    </Swiper>
                </div>
            </div>
        );
    }

}