import useSWR, { useSWRInfinite } from 'swr';
import queryString from 'query-string';

import { WPURL, queryStringOptions, cookies } from 'lib/utils';

const fetcher = ( ...args ) => fetch( ...args ).then( res => res.json() );
const fetcherWithNonce = ( url, options ) => {
    try {
        if ( cookies.get( 'jt-mcg-nonce' ) ) {
            if ( ! options ) options = {};
            if ( ! options?.headers ) options.headers = {};

            options.headers['X-WP-Nonce'] = cookies.get( 'jt-mcg-nonce' );

            if ( url === `${ WPURL }/member/user` ) {
                return fetch( url, options ).then( res => res.json() );
            } else {
                return fetch( url, options ).then( res => res.json() );
            }
        } else {
            if ( url === `${ WPURL }/member/user` ) {
                return false;
            } else {
                return fetch( url, options ).then( res => res.json() );
            }
        }
    } catch ( e ) {
        return null;
    }
}

export const useUser = () => useSWR(
    `${ WPURL }/member/user`,
    fetcherWithNonce,
    { initialData: false, revalidateOnMount: true, revalidateAll: true, }
);

export const useMain = ( initData ) => useSWR(
    `${ WPURL }/components/main`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const useMenuNow = (initData) => useSWR(
    `${ WPURL }/components/sidebar/now`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const useMenu = () => useSWR(
    `${ WPURL }/components/menu`,
    fetcher,
    { revalidateOnMount: true }
);

export const useArea = ( initData ) => useSWR(
    `${ WPURL }/components/area`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const usePrivacy = ( initData ) => useSWR(
    `${ WPURL }/components/privacy`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const useTerms = ( initData ) => useSWR(
    `${ WPURL }/components/terms`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const usePrivacyRegist = ( initData ) => useSWR(
    `${ WPURL }/components/privacy/regist`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const useCategory = ( initData ) => useSWR(
    `${ WPURL }/components/category`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const useNoticeList = ( initData ) => useSWRInfinite(
    ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/notice/list?paged=${ index + 1 }` ),
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);
export const useNoticeDetail = ( slug, initData ) => useSWR(
    `${ WPURL }/modules/notice/get/${ slug }`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);
export const useNoticeDetailPreview = ( preview_id, initData ) => useSWR(
    `${ WPURL }/modules/notice/preview/${ preview_id }`,
    fetcherWithNonce,
    { initialData: initData, revalidateOnMount: true }
);

export const useBlogList = ( initData ) => useSWRInfinite(
    ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/blog/list?paged=${ index + 1 }` ),
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);
export const useBlogDetail = ( slug, initData ) => useSWR(
    `${ WPURL }/modules/blog/get/${ slug }`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);
export const useBlogDetailPreview = ( slug, initData ) => useSWR(
    `${ WPURL }/modules/blog/preview/${ slug }`,
    fetcherWithNonce,
    { initialData: initData, revalidateOnMount: true }
);

export const useEventList = ( initData ) => useSWRInfinite(
    ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/event/list?paged=${ index + 1 }` ),
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);
export const useEventDetail = ( slug, initData ) => useSWR(
    `${ WPURL }/modules/event/get/${ slug }`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);
export const useEventDetailPreview = ( slug, initData ) => useSWR(
    `${ WPURL }/modules/event/preview/${ slug }`,
    fetcherWithNonce,
    { initialData: initData, revalidateOnMount: true }
);

export const useShopList = ( params, initData ) => {
    if ( initData ) {
        return useSWRInfinite(
            ( index, preData ) => ( preData && ! preData?.posts.length ? null : `${ WPURL }/modules/shop/list?paged=${ index + 1 }&${ queryString.stringify( params, queryStringOptions ) }` ),
            fetcher,
            { initialData: initData }
        );
    }
    return useSWRInfinite(
        ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/shop/list?paged=${ index + 1 }&${ queryString.stringify( params, queryStringOptions ) }` ),
        fetcher,
        { fallbackData: initData, revalidateOnMount: true }
    );
}
export const useShopDetail = ( slug, params, initData ) => useSWR(
    `${ WPURL }/modules/shop/get/${ slug }?${ queryString.stringify( params, queryStringOptions ) }`,
    fetcherWithNonce,
    { initialData: initData, revalidateOnMount: true }
);
export const useShopDetailPreview = ( preview_id, params, initData ) => useSWR(
    `${ WPURL }/modules/shop/preview/${ preview_id }?${ queryString.stringify( params, queryStringOptions ) }`,
    fetcherWithNonce,
    { initialData: initData, revalidateOnMount: true }
);

export const useZzimList = ( params ) => useSWRInfinite(
    ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/shop/zzim/list?paged=${ index + 1 }&${ queryString.stringify( params, queryStringOptions ) }` ),
    fetcherWithNonce,
    { revalidateOnMount: true, revalidateAll: true, }
);

export const useReviewList = ( params ) => useSWRInfinite(
    ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/review/list?paged=${ index + 1 }&${ queryString.stringify( params, queryStringOptions ) }` ),
    fetcherWithNonce,
    { revalidateOnMount: true }
);

export const useInquiryList = ( params ) => useSWRInfinite(
    ( index, preData ) => ( preData && preData?.total_pages < index ? null : `${ WPURL }/modules/inquiry/list?paged=${ index + 1 }&${ queryString.stringify( params, queryStringOptions ) }` ),
    fetcherWithNonce,
    { revalidateOnMount: true }
);
export const useInquiryDetail = ( slug ) => useSWR(
    `${ WPURL }/modules/inquiry/get/${ slug }`,
    fetcherWithNonce,
    { revalidateOnMount: true }
);
export const useInquiryDetailPreview = ( preview_id ) => useSWR(
    `${ WPURL }/modules/inquiry/preview/${ preview_id }`,
    fetcherWithNonce,
    { revalidateOnMount: true }
);

export const useSitemapAreaList = ( params, initData ) => useSWR(
    `${ WPURL }/modules/sitemap?${ queryString.stringify( params, queryStringOptions ) }`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);

export const useSitemapMetroList = ( params, initData ) => useSWR(
    `${ WPURL }/modules/sitemap_metro?${ queryString.stringify( params, queryStringOptions ) }`,
    fetcher,
    { initialData: initData, revalidateOnMount: true }
);