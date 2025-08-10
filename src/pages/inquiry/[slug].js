import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { AppContext } from 'lib/context';
import { useInquiryDetail, useInquiryDetailPreview } from 'lib/swr';
import { getDateFormat } from 'lib/utils';

import Login from 'components/layout/Login';
import Loading from 'components/ui/Loading/Loading';
import NotFound from 'components/layout/NotFound/NotFound';
import Nav from 'components/ui/Nav/Nav';
import Button from 'components/ui/Button/Button';
import Header from 'components/ui/Header/Header';
import ModalImage from 'components/ui/ModalImage/ModalImage';
import Divider from 'components/ui/Divider/Divider';

export default function InquiryDetail( props ) {
    const { slug, preview_id = 0 } = props;
    const { user } = React.useContext( AppContext );
    const { data, mutate } = (
        parseInt( props?.query?.preview_id ) > 0 ?
        useInquiryDetailPreview( preview_id) :
        useInquiryDetail( slug )
    );
    const router = useRouter();

    const [ current, hash = '' ] = decodeURI( router.asPath ).split( '#' );
    const [ showModal, setShowModal ] = React.useState(
        hash !== '' && data?.gallery?.[ hash.split( '-' ).pop() ]?.path ?
        data.gallery[ hash.split( '-' ).pop() ].path :
        false
    );

    const handleModalClose = () => {
        router.back();
    }

    React.useEffect( () => {
        // if ( user !== false ) {
            mutate();
        // }
    }, [ user ] );

    React.useEffect( () => {
        if ( data ) {
            const newHash = ( showModal !== false ? `크게보기-${ ( data?.gallery || [] ).map( item => item?.path ).indexOf( showModal ) }` : '' );
            if ( hash !== newHash ) {
                router.push( { pathname: router.route, query: router.query }, `${ current }${ newHash ? `#${ newHash }` : '' }` );
            }
        }
    }, [ showModal ] );

    React.useEffect( () => {
        if ( data ) {
            if ( hash !== '' && showModal === false && data?.gallery?.[ hash.split( '-' ).pop() ]?.path ) {
                setShowModal( data.gallery[ hash.split( '-' ).pop() ].path );
            } else if ( hash === '' && showModal !== false ) {
                setShowModal( false );
            }
        }
    }, [ hash ] );

    React.useEffect( () => {
        if ( data ) {
            if ( hash !== '' && showModal === false && data?.gallery?.[ hash.split( '-' ).pop() ]?.path ) {
                setShowModal( data.gallery[ hash.split( '-' ).pop() ].path );
            } else if ( hash === '' && showModal !== false ) {
                setShowModal( false );
            }
        }
    }, [ data ] );

    if ( user === false ) {
        return (
            <>
                <Header useHome title="문의하기" />
                <Login />
            </>
        );
    } else if ( user && ! data ) return ( <Loading /> );
    else if ( user && data?.code === 'empty' ) return ( <NotFound /> );

    return (
        <>
        <Header useHome title="문의하기" />
        <div className="view">
            <Nav fixed>
                <Nav.item href="/inquiry/form" as="/문의하기/">1:1 문의하기</Nav.item>
                <Nav.item active href="/inquiry/list" as="/나의-문의내역/">나의 문의내역</Nav.item>
            </Nav>
            <div className="inquiry_content">
                <div className="jt_inquiry_form_inner my_inquiry_single inner_wrap">
                    <div className="my_inquiry_single_title">
                        <div className="my_inquiry_title_day">
                            <b className="h5" dangerouslySetInnerHTML={ { __html: data.title } } />
                            <span>{ getDateFormat( data.date, 'YYYY.MM.DD' ) }</span>
                        </div>

                        { ( data.is_answer ) ? (
                            <div className="my_inquiry_state complete">
                                <span>답변완료</span>
                            </div>
                        ) : (
                            <div className="my_inquiry_state">
                                <span>처리중</span>
                            </div>
                        ) }
                    </div>

                    <ul className="my_inquiry_single_content">
                        <li>
                            <div className="my_inquiry_single_content_list_title">
                                <b>닉네임</b>
                            </div>
                            <div className="my_inquiry_single_content_list_post">
                                <p>{ data.author.nickname }</p>
                            </div>
                        </li>
                        <li>
                            <div className="my_inquiry_single_content_list_title">
                                <b>이메일</b>
                            </div>
                            <div className="my_inquiry_single_content_list_post">
                                <p>{ data.email }</p>
                            </div>
                        </li>
                        <li>
                            <div className="my_inquiry_single_content_list_title">
                                <b>휴대폰번호</b>
                            </div>
                            <div className="my_inquiry_single_content_list_post">
                                <p>{ data.phone }</p>
                            </div>
                        </li>
                        <li>
                            <div className="my_inquiry_single_content_list_title">
                                <b>문의유형</b>
                            </div>
                            <div className="my_inquiry_single_content_list_post">
                                <p>{ data.term }</p>
                            </div>
                        </li>
                        <li>
                            <div className="my_inquiry_single_content_list_title">
                                <b>문의내용</b>
                            </div>
                            <div className="my_inquiry_single_content_list_post">
                                <p dangerouslySetInnerHTML={ { __html: data.content } } />

                                { data.gallery.map( ( item, idx ) => (
                                    <div key={ idx }>
                                        <a className="inquiry_photo" onClick={ () => setShowModal( item.path ) }>
                                            <figure className="jt_lazyload_wrap jt_lazy_img my_inquiry_file_img">
                                                <img src={ item.path } alt={ item.name } />
                                            </figure>
                                        </a>
                                    </div>
                                ) ) }
                            </div>
                        </li>
                    </ul>
                </div>

                { ( data.is_answer ) && (
                    <div className="my_inquiry_reply_container">
                        <Divider />
                        <div class="inner_wrap">
                            <div className="my_inquiry_reply">
                                <figure>
                                    <img src={ require( './images/reply-logo.svg' ) } alt="logo"/>
                                </figure>
                                <b>뭉치고</b>
                                <div className="my_inquiry_reply_post">
                                    <p dangerouslySetInnerHTML={ { __html: data.answer } } />
                                </div>
                            </div>
                        </div>
                    </div>
                ) }

                <Link href="/inquiry/list" as="/나의-문의내역">
                    <div className="goto_list_btn inner_wrap">
                        <Button secondary outline size="medium">목록으로 돌아가기</Button>
                    </div>
                </Link>
            </div>
        </div>

        <ModalImage
            show={ showModal !== false }
            onCloseClick={ handleModalClose }
            image={ showModal }
        />
        </>
    );
}

export const getServerSideProps = async ( { query } ) => {
    return {
        props: { ...query },
    }
}