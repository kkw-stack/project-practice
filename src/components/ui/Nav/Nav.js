import React, { Component } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation } from 'swiper';
import { useDevice } from 'lib/utils';

import style from './Nav.module.css';

SwiperCore.use([Navigation]);

export default function Nav( props ) {
    const itemCount = props.children.length ;
    const slidesPerView = ( itemCount >= 1  && itemCount <= 3 ) ? itemCount : 'auto';
    const [ activeIndex, setActiveIndex ] = React.useState( props.children.findIndex( obj => obj?.props?.active === true ) );
    const swiperRef = React.useRef(null);
    const containerRef = React.useRef(null);
    const prevRef = React.useRef(null);
    const nextRef = React.useRef(null);

    React.useEffect(()=>{
        const newIndex = props.children.findIndex( obj => obj?.props?.active === true );
        const swiper = swiperRef.current.swiper
        swiper.slideTo(newIndex)
    },[props.children.findIndex( obj => obj?.props?.active === true )])

    return (
        <div ref={containerRef} className={`${style['slideshow_count_'+props.children.length]} ${style.container} ${ props?.showCursor ? style.has_cursor : '' } ${ props?.fixed ? style.fixed : '' }`}>
            <Swiper
                ref={swiperRef}
                className={style.slideshow}
                slidesPerView= { slidesPerView }
                slideToClickedSlide = {false} 
                freeMode= {true} 
                freeModeMomentum= {true}
                freeModeMomentumBounceRatio = {0}
                freeModeMomentumRatio = {0.3}
                freeModeMomentumVelocityRatio= {0.9}
                loop={ false }
                centeredSlides={ true }
                centeredSlidesBounds={ true }
                //touchAngle={ 30 }
                //threshold={ 20 }
                resizeObserver={ true } // ios debug 필수 
                resistance={ true }
                resistanceRatio={ 0 }
                //onSwiper={ swiper => swiper.slideTo( ( activeIndex >= 0 ? activeIndex : 0 ), 0 ) }
                onInit={(swiper) => {
                    if(props.useArrow){
                        swiper.params.navigation.prevEl = prevRef.current;
                        swiper.params.navigation.nextEl = nextRef.current;

                        const device = useDevice();
                        const wrapEl = document.createElement('div');

                        wrapEl.appendChild(swiperRef.current.querySelector('.swiper-wrapper'));
                        swiperRef.current.prepend(wrapEl);
                        
                        // Fix galaxy note 9 bug
                        if(device.isAndroid() && activeIndex === 0){
                            setTimeout(function(){
                                swiper.slideTo(1,0)
                            },0)
                        }
                    }
                }}
            >
                { props.children.map( ( child, index ) => {
                    return (
                        <SwiperSlide key={ index } className={ style.item }>
                            { child }
                        </SwiperSlide>
                    );
                } ) }

                {props.useArrow  && (
                    <>
                        <button type="button" className={`${style.nav} ${style.prev}`} ref={prevRef}><span></span>Prev</button>
                        <button type="button" className={`${style.nav} ${style.next}`} ref={nextRef}>Next</button>
                    </>
                )}
            </Swiper>
        </div>
    );
}

Nav.item = ( props ) => {
    const router = useRouter();
    const handleClick = event => {
        if ( typeof props?.onClick === 'function' ) {
            return props.onClick( event );
        }
    }
    return (
        <Link href={ props?.href ? props.href : '#' } as={ props?.as }>
            <a onClick={ handleClick } className={ `${ props?.active === true ? style.active : '' }` }>
                <span>{ props.children }</span>
            </a>
        </Link>
    );
}