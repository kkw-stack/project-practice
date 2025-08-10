import React from 'react';
import { useRouter } from 'next/router';
import fetch from 'node-fetch';

import { AppContext } from 'lib/context';
import { WPURL, cookies, objectToFormData, jtAlert } from 'lib/utils';

import Login from 'components/layout/Login';
import Header from 'components/ui/Header/Header';
import Vh from 'components/ui/Vh/Vh';
import Form from 'components/ui/Forms';
import Checkbox from 'components/ui/Checkboxes/Checkbox';
import Button from 'components/ui/Button/Button';

export default function ShopModify( props ) {
    const { config } = props;
    const { user } = React.useContext( AppContext );
    const router = useRouter();
    const [ categories, setCategories ] = React.useState( [] );

    const handleSubmit = async ( data ) => {
        const sendData = {
            shop: config.shop.id,
            categories: categories,
            content: data.content,
            files: data.files,
        };

        if ( sendData.categories.length === 0 ) {
            jtAlert( '정보 수정요청 사항을 선택해주세요' );
            return false;
        }

        if ( sendData.content.length === 0 ) {
            jtAlert( '정보 수정요청 내용을 알려주세요' );
            return false;
        } else if ( sendData.content.length > 1000 ) {
            jtAlert( '정보 수정요청 사항은 최대 1000자 이하 작성해주세요' );
            return false;
        }

        const formData = objectToFormData( sendData );
        const response = await fetch( `${ WPURL }/modules/modify/add`, {
            method: 'POST',
            headers: { 'X-WP-Nonce': cookies.get( 'jt-mcg-nonce' ) },
            body: formData,
        } ).then( res => res.json() );

        if ( response?.success ) {
            jtAlert( '감사합니다\n정보 수정요청이 완료되었습니다',()=>{
                router.push( { pathname: '/shop/[slug]', query: { slug: decodeURI( config.shop.slug ) } }, `/샵/${ decodeURI( config.shop.slug ) }` );
            } );
        } else if ( response?.message ) {
            jtAlert( response.message );
        } else {
            jtAlert( '처리 중 오류가 발생했습니다' );
        }
    }

    const handleCategories = event => {
        if ( event.target.checked ) {
            setCategories( categories.filter( item => item !== event.target.value ).concat( event.target.value ) );
        } else {
            setCategories( categories.filter( item => item !== event.target.value ) );
        }
    }

    const goBack = () => {
        router.push( { pathname: '/shop/[slug]', query: { slug: decodeURI( config.shop.slug ) } }, `/샵/${ decodeURI( config.shop.slug ) }` );
    }

    if ( user !== false && user.shop.find( item => parseInt( item.shop_id ) === parseInt( config.shop.id ) ) ) {
        jtAlert( '클린 시스템이 작동 중입니다\n뭉치고 사장님 고객센터로 연락바랍니다',()=>{
            router.push( { pathname: '/shop/[slug]', query: { slug: decodeURI( config.shop.slug ) } }, `/샵/${ decodeURI( config.shop.slug ) }` );
        } );
        return null;
    }

    return (
        <div id="shop_modify_popup" className="shop_modify_popup popup_layout_wrap">

            { ( user === false ) ? (
                <React.Fragment>
                    <Header title={ config.shop.title } useHome />
                    <Login />
                </React.Fragment>
            ) : (
                <Form onSubmit={ handleSubmit } useAlert>
                    <Header title={ config.shop.title } useHome />
                    <Vh>
                        <div className="shop_modify_container nicescroll_area jt_form_data">
                            <div className="shop_modify_container_inner">
                                <p className="modify_title">정보 수정요청 사항을 알려주세요 <span>(중복선택 가능)</span></p>
                                <ul>
                                    { config.terms.map( ( item ) => (
                                        <li key={ item.term_id }>
                                            <label className="jt_icheck_label">
                                                <span className="shop_modify_checkbox">
                                                    <Checkbox
                                                        value={ item.term_id }
                                                        checked={ categories.indexOf( item.term_id.toString() ) >= 0 }
                                                        onChange={ handleCategories }
                                                    />
                                                </span>
                                                <span>{ item.name }</span>
                                            </label>
                                        </li>
                                    ) ) }
                                </ul>
                                <div className="jt_form_field_wrap shop_modify_field">
                                    <label className="field_content_desc sr_only" htmlFor="shop_modify_content">
                                        <span>정보 수정요청 내용을 알려주세요 <br />관리자 확인 후 빠르게 반영됩니다</span>
                                    </label>
                                    <div className="jt_form_field_wrap shop_modify_field">
                                        <Form.TextArea name="content" label="정보 수정요청 내용" hideLabel placeholder="정보 수정요청 내용을 알려주세요 &#13;&#10;관리자 확인 후 빠르게 반영됩니다" max="1000" noMarginBottom />
                                    </div>
                                </div>
                                <div className="jt_form_data_files">
                                    <Form.File name="files" label="사진" hideLabel { ...config.file } />
                                </div>
                                <Button type="submit">뭉치고에 알리기</Button>
                            </div>
                        </div>
                    </Vh>
                </Form>
            ) }
        </div>
    );
}

export const getServerSideProps = async ( { query } ) => {
    const config = await fetch( `${ WPURL }/modules/modify/config?shop=${ query.slug }` ).then( res => res.json() );
    const seoData = {
        title: `정보 수정요청 | ${ config.shop.title } | 뭉치고`.replace( /\s\s+/g, ' ' ),
        description: '여기를 눌러 링크를 확인하세요.'.replace( /\s\s+/g, ' ' ),
    }

    return {
        props: { config, seoData, }
    }
}