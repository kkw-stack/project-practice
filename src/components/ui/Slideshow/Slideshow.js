import React from 'react';

import { AppContext } from 'lib/context';

import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Lazy} from 'swiper';

import { useDevice } from 'lib/utils';

import style from './Slideshow.module.css';

SwiperCore.use([Autoplay, Navigation, Lazy]);

export default function Slideshow( props ){
    const { googlebot } = React.useContext( AppContext );

    const [ swiperIndex, setSwiperIndex ] = React.useState( 0 );
    const [ displayNav, setDisplayNav ] = React.useState( true );

    const prevRef = React.useRef();
    const nextRef = React.useRef();

    const device = useDevice();

    return (
        <Swiper
            className={`${style.container} ${props?.size === 'large' ? style['size_large'] : '' }`}
            loop={true}
            lazy={{loadPrevNext: true}}
            preloadImages= {false}
            slidesPerView={1}
            watchOverflow = {true}
            autoplay={{ delay: 8000 }}
            speed={600}
            cssMode={device.isChromeIos()}
            onInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.update();
                if ( props?.posts?.length <= 1 ) {
                    swiper.disable();
                    setDisplayNav( false );
                }
            }}
            onSlideChange={slider => {
                setSwiperIndex( slider.realIndex + 1 );
            }}
        >
            { props?.posts?.map( ( item, i ) => {

                const conditionalAttr = {};

                // 구글 저장된 페이지 처리
                // Google Crawling Image Loaded Issue
                if( googlebot ){
                    conditionalAttr.src = item.image;
                    conditionalAttr.srcSet = `${ item.image } 2x`;
                } else {
                    if (i === 0) {
                        conditionalAttr.src = item.image;
                        conditionalAttr.srcSet = `${ item.image } 2x`;
                    } else {
                        conditionalAttr['data-src']= item.image;
                        conditionalAttr['data-srcset']=`${ item.image } 2x`;
                        conditionalAttr.className ="swiper-lazy";
                    }
                }

                return (
                    <SwiperSlide className={style.item} key={ `main_slide_${ i }` }>
                        { ( item.target ) === true ? (
                            <a href={ item.url } target="_blank" rel="noopener noreferrer">
                                <img {...conditionalAttr} alt={item?.alt || `뭉치고 이벤트 ${ i }`} />
                            </a>
                        ) : (
                            <a href={ item.url }>
                                <img {...conditionalAttr} alt={item?.alt || `뭉치고 이벤트 ${ i }`} />
                            </a>
                        ) }
                    </SwiperSlide>
                );
            } ) }

            { ( displayNav === true ) && (
                <>
                    <button type="button" className={`${style.nav} ${style.prev}`} ref={prevRef}>Prev</button>
                    <button type="button" className={`${style.nav} ${style.next}`} ref={nextRef}>Next</button>

                    <div className={style.paging}>
                        <a href={props?.allBtnUrl} onClick={props?.onAllBtnClick} >
                            <div className={style.paging_info}>
                                <span className={style.paging_num}>{swiperIndex} / {props?.posts.length}</span>
                                <p className={style.paging_view_all}><span>모두보기</span></p>
                            </div>
                        </a>
                    </div>
                </>
            )}

        </Swiper>
    );

}