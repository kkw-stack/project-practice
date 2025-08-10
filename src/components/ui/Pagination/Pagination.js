import React from 'react';

import queryString from 'query-string';
import { queryStringOptions } from 'lib/utils';

// Style
import Link from 'next/link';
import style from './Pagination.module.css';

const PaginationProvider = () => (
    <li className={ style.ellipsis }>
        <span>…</span>
    </li>
);

// Init
export default function Pagination( props ) {
    const { total = 1, current = 1, paginationLength = 5, url = '' } = props;

    // 가운데 표시 페이지갯수 구하기
    const calcLength = ( paginationLength < 5 ? 5 : ( paginationLength % 2 === 0 ? paginationLength - 1 : paginationLength ) ) - 2;

    // 초기값 전체 페이지 수로 설정
    let pagination = [ ...Array( total ).keys() ].map( item => item + 1 );

    // 전체 페이지 수가 표시할 페이지수보다 많을 경우
    // 2022-07-25 공지사항 페이징네이션 string으로 들어왔을 경우 paging 버그 수정
    if ( total > calcLength + 2 ) {
        const separator = Math.max( 1, ( calcLength - 1 ) / 2 ); // 가운데 표시값의 최대/최소 값을 구하기 위한 구분자
        const start = Math.max( 1, parseInt(current) - separator ); // 페이징 시작 값
        const end = Math.min( total, parseInt(current) + separator ); // 페이징 종료 값

        // 전체 페이지 수가 계산된 페이지수보다 많을 경우
        if ( total > calcLength ) {
            // 시작값 <= 페이징 <= 종료값으로 필터링
            pagination = pagination.filter( item => item >= start && item <= end );
        }

        // 계산된 페이징보다 적을경우
        while ( pagination.length < calcLength ) {
            pagination = Math.max( ...pagination ) === total ? [ Math.min( ...pagination ) - 1 ].concat( pagination ) : pagination.concat( [ Math.max( ...pagination ) + 1 ] );
        }

        // 페이징의 최소값이 {1}인 경우 {최대값 + 1} 추가
        if ( Math.min( ...pagination ) === 1 ) {
            pagination = pagination.concat( Math.max( ...pagination ) + 1 );
        // 페이징의 최소값이 {2}인 경우 {1} 추가
        } else if ( Math.min( ...pagination ) === 2 ) {
            pagination = [ 1 ].concat( pagination );
        // 페이징의 최대값이 {total}인 경우 {최소값 - 1} 추가
        } else if ( Math.max( ...pagination ) === total ) {
            pagination = [ Math.min( ...pagination ) - 1 ].concat( pagination );
        // 페이징의 최대값이 {total - 1}인 경우 {total} 추가
        } else if ( Math.max( ...pagination ) === total - 1 ) {
            pagination = pagination.concat( total );
        }
    }

    const currentUrl = url.split( '?' )[0];
    const query = queryString.parse( url.replace(  currentUrl, '' ), queryStringOptions );

    const handleClick = ( event, page ) => {
        if ( typeof props?.onChange === 'function' ) {
            event.preventDefault();

            props.onChange( page );

            return false;
        }
    }

    // Renderer
    return (
        <nav aria-label="페이지네이션" className={ style.container }>
            { ( current <= total && total > 1 ) && (
                <ul>
                    { ( current > 1 ) && (
                        <li className={ style.prev }>
                            <Link href={ `${ currentUrl }?${ queryString.stringify( { ...query, page: current - 1 }, queryStringOptions ) }` }>
                                <a onClick={ ( e ) => handleClick( e, current - 1 ) }>&nbsp;<span className="sr-only">이전</span></a>
                            </Link>
                        </li>
                    ) }

                    { ( Math.min( ...pagination ) > 1 ) && (
                        <>
                            <li>
                                <Link href={ `${ currentUrl }?${ queryString.stringify( { ...query, page: 1 }, queryStringOptions ) }` }>
                                    <a onClick={ ( e ) => handleClick( e, 1 ) }>1</a>
                                </Link>
                            </li>
                            <PaginationProvider />
                        </>
                    ) }

                    { pagination.map( pageNum => {
                        return (
                            <li key={ pageNum } className={ `${ parseInt( pageNum ) === parseInt( current ) ? style.current : '' }` }>
                                <Link href={ `${ currentUrl }?${ queryString.stringify( { ...query, page: pageNum }, queryStringOptions ) }` }>
                                    <a { ...( pageNum === current ? { 'aria-current': true } : {} ) } onClick={ ( e ) => handleClick( e, pageNum ) }>{ pageNum }</a>
                                </Link>
                            </li>
                        )
                    } ) }

                    { ( Math.max( ...pagination ) < total ) && (
                        <>
                            <PaginationProvider />
                            <li>
                                <Link href={ `${ currentUrl }?${ queryString.stringify( { ...query, page: total }, queryStringOptions ) }` }>
                                    <a onClick={ ( e ) => handleClick( e, total ) }>{ total }</a>
                                </Link>
                            </li>
                        </>
                    ) }

                    { ( current < total ) && (
                        <li className={ style.next }>
                            <Link href={ `${ currentUrl }?${ queryString.stringify( { ...query, page: current + 1 }, queryStringOptions ) }` }>
                                <a onClick={ ( e ) => handleClick( e, current + 1 ) }>&nbsp;<span className="sr-only">다음</span></a>
                            </Link>
                        </li>
                    ) }
                </ul>
            ) }
        </nav>
    );
}