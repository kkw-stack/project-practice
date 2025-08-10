import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import fetch from 'node-fetch';

import { useEventDetail, useEventDetailPreview } from 'lib/swr';
import { WPURL, getDateFormat } from 'lib/utils';

import Header from 'components/ui/Header/Header';
import Button from 'components/ui/Button/Button';
import NotFound from 'components/layout/NotFound/NotFound';

export default function EventDetail( props ) {
    const router = useRouter();
    const { data } = (
        parseInt( props?.query?.preview_id ) > 0 ?
        useEventDetailPreview( props.query.preview_id, props.data ) :
        useEventDetail( router.query.slug, props.data )
    );

    if ( data === null ) {
        return null;
    }

    if ( data?.code ) {
        return (
            <NotFound />
        );
    }

    return (
        <>
        <Header useHome useShare title="이벤트" noTitleTag />
        <div className="jt_single view">
            <div className="single_header">
                <div className="single_header_inner">
                    <h1 className="single_title" dangerouslySetInnerHTML={ { __html: data.title || '제목이 없습니다' } }></h1>
                    { data?.start_date &&
                    <div className="single_meta">
                        <p className="event_period">
                            <b>이벤트 기간</b>
                            <span>{ `${ getDateFormat( data.start_date, 'YYYY.M.D' ) } ~${ ( data?.end_date ? ` ${ getDateFormat( data.end_date, 'YYYY.M.D' ) }` : '' ) }` }</span>
                        </p>
                    </div>
                    }
                </div>
            </div>

            <div className="single_body">
                <div className="single_content_wrap">
                    <div className="single_content" dangerouslySetInnerHTML={ { __html: data.content } }></div>

                    { ( data.attachment.length > 0 ) && (
                        <div className="single_attachments single_wrap">
                            <div className="download_list">
                                <b>첨부파일</b>
                                { data.attachment.map( ( item, idx ) => {
                                    return (
                                        <a key={ idx } href={ item.file_url } download={ item.file_name }>{ item.file_name }</a>
                                    );
                                } ) }
                            </div>
                        </div>
                    ) }

                    <Link href="/event" as="/이벤트">
                        <div className="goto_list_btn inner_wrap">
                            <Button secondary outline size="medium">목록으로 돌아가기</Button>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}

export const getServerSideProps = async ( { query } ) => {
    if ( query?.slug ) {
        const data = (
            parseInt( query?.preview_id ) > 0 ?
            null :
            await fetch( `${ WPURL }/modules/event/get/${ encodeURI( decodeURI( query?.slug ) ) }` ).then( res => res.json() )
        );

        const seoData = (
            parseInt( query?.preview_id ) > 0 ?
            {} :
            {
                title: `${ data.title } | 이벤트 | 뭉치고`.replace( /\s\s+/g, ' ' ),
                description: ( data.excerpt ? data.excerpt : ( data.content || '' ).replace( /(<([^>]+)>)/gi, '' ).replace( /\s\s+/g, ' ' ).substr( 0, 100 ) ),
                ...( data?.thumbnail ? { image: data.thumbnail } : {} ),
            }
        );

        if ( ! data?.code || parseInt( query?.preview_id ) > 0 ) {
            return { props: { data, seoData, query, } };
        }

    }

    return { notFound: true };
}