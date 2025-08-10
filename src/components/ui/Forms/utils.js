export const Josa = ( word, format, join ) => {
    const _hasJong = string => ( ( string.charCodeAt( string.length - 1 ) - 0xac00 ) % 28 > 0 );
    const _f = [
        string => ( _hasJong( string ) ? '을' : '를' ), //을/를 구분
        string => ( _hasJong( string ) ? '은' : '는' ), //은/는 구분
        string => ( _hasJong( string ) ? '이' : '가' ), //이/가 구분
        string => ( _hasJong( string ) ? '과' : '와' ), //와/과 구분
        string => ( _hasJong( string ) ? '으로' : '로' ), //으로/로 구분
    ];

    const _formats = {
        '을/를': _f[0], '을': _f[0], '를': _f[0], '을를': _f[0], //을/를 구분
        '은/는': _f[1], '은': _f[1], '는': _f[1], '은는': _f[1], //은/는 구분
        '이/가': _f[2], '이': _f[2], '가': _f[2], '이가': _f[2], //이/가 구분
        '와/과': _f[3], '와': _f[3], '과': _f[3], '와과': _f[3], //와/과 구분
        '으로/로': _f[4], '으로': _f[4], '로': _f[4], '으로로': _f[4], //으로/로 구분
    }

    try {
        return ( join ? word : '' ) + _formats[ format ]( word );
    } catch ( e ) {
        return ( join ? word : '' ) + format;
    }
}

export const getDaumPostCode = ( callback ) => {
    if ( typeof window.daum === 'undefined' ) {
        const script = document.createElement( 'script' );
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.id = 'kakao-map';

        document.body.appendChild( script );

        if ( callback && typeof callback === 'function' ) {
            script.onload = callback;
        }
    } else {
        if ( callback && typeof callback === 'function' ) {
            callback();
        }
    }
}

export const isObjectEquals = ( obj1, obj2 ) => {
    const keys1 = Object.keys( obj1 );
    const keys2 = Object.keys( obj2 );

    if ( keys1.length !== keys2.length ) return false;

    for ( const key of keys1 ) {
        const val1 = obj1[ key ];
        const val2 = obj2[ key ];
        const areObjects = isObject( val1 ) && isObject( val2 );

        if ( ( areObjects && ! isObjectEquals( val1, val2 ) ) || ( ! areObjects && val1 !== val2 ) ) return false;
    }

    return true;
}

export const isObject = ( object ) => ( object !== null && typeof object === 'object' );