import React from 'react';
import { useRouter} from 'next/router';
import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { WPURL, cookies, objectToFormData, jtAlert } from 'lib/utils';

import Form from 'components/ui/Forms';
import Login from '../Login';
import Vh from 'components/ui/Vh/Vh';
import Button from 'components/ui/Button/Button';

export default function ReviewForm( props ) {
    const router = useRouter();
    const { user } = React.useContext( AppContext );
    const { shop, data: review } = props;

    const handleSubmit = ( data ) => {
        const formData = objectToFormData( { ...data, shop: shop.slug } );

        if ( review ) {
            fetch( `${ WPURL }/modules/review/update/${ review.id }`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: formData,
            } ).then( res => res.json() ).then( response => {
                if ( response?.success ) {
                    jtAlert( response.message, ()=>{
                        if ( router.pathname === '/review/modify/[id]' ) {
                            router.push( '/review', '/후기관리' );
                        } else {
                            router.push( { pathname: '/shop/[slug]', query: { slug: decodeURI( shop.slug ) } }, `/샵/${ decodeURI( shop.slug ) }#후기` );
                        }
                    } );

                } else if ( response?.message ) {
                    jtAlert( response.message );
                } else {
                    jtAlert( '처리 중 오류가 발생했습니다' );
                }
            } );
        } else {
            fetch( `${ WPURL }/modules/review/add`, {
                method: 'POST',
                headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
                body: formData,
            } ).then( res => res.json() ).then( response => {
                if ( response?.success ) {
                    jtAlert( response.message, ()=> {
                        if ( router.pathname === '/review/modify/[id]' ) {
                            router.push( '/review', '/후기관리' );
                        } else {
                            router.push( { pathname: '/shop/[slug]', query: { slug: decodeURI( shop.slug ) } }, `/샵/${ decodeURI( shop.slug ) }#후기` );
                        }
                    } );
                } else if ( response?.message ) {
                    jtAlert( response.message );
                } else {
                    jtAlert( '처리 중 오류가 발생했습니다' );
                }
            } );
        }
    }

    if ( user === false ) {
        return (
            <Login />
        );
    }

    return (
        <div className="view review_write_modal">
            <Vh offset={{sm:62,lg:80}}>
                <Form onSubmit={ handleSubmit } useAlert>
                    <div className="review_write_wrap">
                        <div className="review_container_inner inner_wrap">
                            <h2>{ shop.title }</h2>
                            <Form.Rating name="score" value={ parseInt( review?.score ) } label="별점" max="5" hideLabel required />

                            <div className="jt_form_field_wrap review_field files_in_txt">
                                <Form.TextArea name="content" label="후기" placeholder="별점 선택 후, 후기를 작성해주세요 (최소 20자) &#13;&#10;Tip : 위치, 청결도, 의사소통, 만족도 등을 평가해주세요" min="20" max="400" size="large" value={ review?.content } hideLabel noMarginBottom />
                            </div>

                            <Form.File name="files" label="사진" hideLabel extension={ [ 'jpg', 'png', 'jpeg', 'gif' ] } max="1" value={ review?.files } noMarginBottom />

                            <p className="review_write_desc t4">
                                솔직하게 작성하신 후기는 샵을 이용하는 고객님들께 큰 도움이 됩니다.
                                하지만 허위 후기나 명예훼손, 욕설, 비방 글 등 <b>선량한 업주나 제3자의 권리를 침해하는 게시물</b>은 삭제되거나 보이지 않게 될 수 있습니다.
                                게시에 따른 책임은 작성자에게 있으며, 뭉치고는 이에 대한 법적 책임을 지지 않습니다.
                            </p>
                            <Button type="submit">완료</Button>
                        </div>
                    </div>
                </Form>
            </Vh>
        </div>
    );
}
