import React from 'react';
import Link from 'next/link';

import { Swiper, SwiperSlide } from 'swiper/react';

import { getDateFormat } from 'lib/utils';

import ButtonPrev from 'components/ui/ButtonNav/ButtonPrev';
import ButtonNext from 'components/ui/ButtonNav/ButtonNext';

import style from './BlogSection.module.css';

export default function BlogSection( props ) {

    const prevRef = React.createRef();
    const nextRef = React.createRef();

    const [ posts, setPosts ] = React.useState( props?.posts || [] );

    React.useEffect( () => {
        if ( JSON.stringify( posts ) !== JSON.stringify( props?.posts ) ) {
            setPosts( props?.posts || [] );
        }
    }, [ props?.posts ] );

    return (
        <div className={ style.container }>
            <p className={ style.subtitle }>뭉치고 피곤해서<br />Flex 해버렸지 뭐야?</p>
            <h2><Link href="/blog" as="/뭉치고-블로그/"><a>뭉치고 블로그 <span>#우리샵소개</span></a></Link></h2>
            { ( posts.length > 0 ) && (
                <div className={ style.slideshow }>
                    <Swiper
                        loop={ false }
                        slidesPerView={ 'auto' }
                        slidesOffsetAfter={ 10 }
                        longSwipesRatio={ 0.1 }
                        resistance={ true }
                        resistanceRatio={ 0 }
                        onInit={(swiper) => {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                        }}
                    >
                        { posts.map( item => {
                            const thumb = item.thumbnail.length ? item.thumbnail : require('./images/blog-no-image@2x.jpg')
                            return (
                                <SwiperSlide className={ style.slide } key={ item.id }>
                                    <Link href={ { pathname: '/blog/[slug]', query: { slug: item.slug } } } as={ decodeURI( item.url ) }>
                                        <a>
                                            <figure>
                                                <img src={ thumb } alt={ item.title } />
                                            </figure>
                                            <div className={ style.content }>
                                                <h3>{ item.title }</h3>
                                                <time dateTime={ getDateFormat( item.date, 'YYYY-MM-DD' ) }>
                                                    { getDateFormat( item.date, 'YYYY.MM.DD' ) }
                                                </time>
                                            </div>
                                        </a>
                                    </Link>
                                </SwiperSlide>
                            );
                        } ) }

                        <SwiperSlide className={ `${style.slide} ${style.more} ` }>
                            <div className={style.more_inner}>
                                <Link href="/blog" as="/뭉치고-블로그">
                                    <a><i></i>더보기</a>
                                </Link>
                            </div>
                        </SwiperSlide>
                        <div className={ style.slideshow_nav }>
                            <ButtonPrev refer={ prevRef } />
                            <ButtonNext refer={ nextRef } />
                        </div>
                    </Swiper>
                </div>
            ) }
        </div>
    )
}