import React from 'react';
import ReactDOM from 'react-dom';

import dayjs from 'dayjs';
import getAgent from '@egjs/agent';

import Alert from 'components/ui/Alert/Alert';

export const WPURL = `${ process.env.DOMAIN }/cmsadmin/wp-json/jt/v1`;
export const kakaoApiKey = '530b7b7cd7f7c74f7ec61d894e4ce5f9';
export const kakaoRestApiKey = 'de477e8c5ddbbb91c817cb4b3cf050a9';
export const queryStringOptions = { arrayFormat: 'bracket', skipNull: true, skipEmptyString: true };

// https://stackoverflow.com/questions/63406435/how-to-detect-window-size-in-next-js-ssr-using-react-hook
export const useWindowSize = () => {
    const [ windowSize, setWindowSize ] = React.useState( {
        width: undefined,
        height: undefined,
    } );

    React.useEffect( () => {
        if ( typeof window !== 'undefined' ) {
            function handleResize() {
                setWindowSize( {
                    width: window.innerWidth,
                    height: window.innerHeight,
                } );
            }

            window.addEventListener( 'resize', handleResize );
            handleResize();
            return () => window.removeEventListener( 'resize', handleResize );
        }
    }, [] );
    return windowSize;
}

// https://github.com/vercel/swr/blob/master/examples/infinite-scroll/hooks/useOnScreen.js
export const useOnScreen = ( ref, dep = [] ) => {
    const [ isIntersecting, setIntersecting ] = React.useState( false );

    React.useEffect( () => {
        if ( ref.current ) {
            const observer = new IntersectionObserver( ( [ entry ] ) => setIntersecting( entry.isIntersecting ) );

            observer.observe( ref.current );

            return () => {
                observer.disconnect();
            }
        }
    }, dep );

    return isIntersecting;
}

/* kakao script loader (TEST) */
// https://velog.io/@bearsjelly/React-kakao-지도-띄우기-2-앱키를-이용해-지도-띄우기
export const kakaoMapLoader = ( options = {}, callback ) => {

    if ( typeof callback !== 'function' ) return;

    if ( typeof kakao === 'undefined' ) {
        const script = document.createElement( 'script' );
        script.async = true;

        if ( Object.keys( options ).length > 0 ) {
            const params = Object.keys( options ).map( key => encodeURIComponent( key ) + '=' + encodeURIComponent( options[ key ] ) ).join( '&' );
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${ kakaoApiKey }&autoload=false&${ params }`;
        } else {
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${ kakaoApiKey }&autoload=false`;
        }

        document.head.appendChild( script );

        script.onload = callback;
    } else {
        callback();
    }
}

export const setLocalStorageData = ( key, data ) => {
    try {
        return window.localStorage.setItem( key, JSON.stringify( data ) );
    } catch ( e ) {
        // console.log( e );
        return false;
    }
}

export const delLocalStorageData = key => {
    try {
        window.localStorage.removeItem( key );

        return true;
    } catch ( e ) {
        return false;
    }
}

export const getLocalStorageData = ( key, defaultValue = null ) => {
    try {
        const data = JSON.parse( window.localStorage.getItem( key ) );
        return ( data ? data : defaultValue );
    } catch ( e ) {
        // console.log( e );
        return ( defaultValue ? defaultValue : null );
    }
}

export const setSessionStorageData = ( key, data ) => {
    try {
        return window.sessionStorage.setItem( key, JSON.stringify( data ) );
    } catch ( e ) {
        // console.log( e );
        return false;
    }
}

export const delSessionStorageData = ( key ) => {
    try {
        window.sessionStorage.removeItem( key );
        return true;
    } catch ( e ) {
        return false;
    }
}

export const getSessionStorageData = ( key, defaultValue = null ) => {
    try {
        const data = JSON.parse( window.sessionStorage.getItem( key ) );
        return ( data ? data : defaultValue );
    } catch ( e ) {
        // console.log( e );
        return ( defaultValue ? defaultValue : null );
    }
}

export const objectToFormData = ( obj, rootName, ignoreList ) => {
    var formData = new FormData();

    const appendFormData = ( data, root ) => {
        if ( ! ignore( root ) ) {
            root = root || '';
            if ( data instanceof File ) {
                formData.append( root, data );
            } else if ( Array.isArray( data ) ) {
                for ( var i = 0; i < data.length; i++ ) {
                    appendFormData( data[ i ], root + '[' + i + ']' );
                }
            } else if ( typeof data === 'object' && data ) {
                for ( var key in data ) {
                    if ( data.hasOwnProperty( key ) ) {
                        if ( root === '' ) {
                            appendFormData( data[ key ], key );
                        } else {
                            appendFormData( data[ key ], root + '[' + key + ']' );
                        }
                    }
                }
            } else {
                if ( data !== null && typeof data !== 'undefined' ) {
                    formData.append( root, data );
                }
            }
        }
    }

    const ignore = ( root ) => Array.isArray( ignoreList ) && ignoreList.some( ( x ) => { return x === root; } );

    appendFormData( obj, rootName );

    return formData;
}


// https://ko.javascript.info/cookie
export const cookies = {
    set : ( name, value, options = {} ) => {
        options = { path: '/', ...options };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent( name ) + "=" + encodeURIComponent( value );

        for ( let optionKey in options ) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[ optionKey ];
            if ( optionValue !== true ) {
                updatedCookie += "=" + optionValue;
            }
        }

        window.document.cookie = updatedCookie;
    },
    get: name => {
        if ( typeof window === 'undefined' ) return null;

        let matches = window.document.cookie.match( new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ) );
        return matches ? decodeURIComponent( matches[1] ) : undefined;
    },
    destroy : name => cookies.set( name, '', { 'max-age': -1 } )
};

export const getDateFormat = ( data, format ) => {
    try {
        const date = dayjs( data );
        const weekName = [ '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일' ];
        const weekShort = [ '일', '월', '화', '수', '목', '금', '토' ];
        const newFormat = format.replace( /(E|e)/gi, item => {
            if ( item === 'E' ) {
                return weekName[ date.format( 'd' ) ];
            } else if ( item === 'e' ) {
                return weekShort[ date.format( 'd' ) ];
            } else {
                return item;
            }
        } );

        return date.format( newFormat );
    } catch ( e ) {
        return data;
    }
}

export const animateInView = (el, top = '-50%', once = true) => {
    const observerOptions = {
        root: null,
        threshold: 0,
        rootMargin: `0px 0px ${top} 0px`
    };

    const observer = new IntersectionObserver(entries => {
        if(entries){
            entries.forEach(entry => {

                let targetEl = null;
                if(typeof entry.target.dataset.target != 'undefined'){
                    targetEl = document.querySelector(entry.target.dataset.target);
                }else{
                    targetEl = entry.target
                }

                if (entry.isIntersecting) {
                    if(targetEl) targetEl.classList.add('in_view');

                    if(once){
                        observer.unobserve(entry.target);
                    }
                }else{
                    if(targetEl) targetEl.classList.remove('in_view');
                }
            });
        }
    }, observerOptions);

    observer.observe(el);

}

export const useDevice = () => {
    const getMobileDetect = ( userAgent ) => {
        const isAndroid = () => Boolean(userAgent.match( /Android/i ) );
        const isIos = () => Boolean(userAgent.match( /iPhone|iPad|iPod/i ) );
        const isChromeIos = () => Boolean(userAgent.match(/CriOS/i) );
        const isKakao = () => Boolean(userAgent.match(/KAKAOTALK/i) );
        const isNaver = () => Boolean(userAgent.match(/NAVER/i) );
        const isOpera = () => Boolean(userAgent.match( /Opera Mini/i ) );
        const isWindows = () => Boolean(userAgent.match( /IEMobile/i ) );
        const isSSR = () => Boolean(userAgent.match( /SSR/i ) );
        const isMobile = () => Boolean( isAndroid() || isIos() || isOpera() || isWindows() );
        const isDesktop = () => Boolean( ! isMobile() && ! isSSR() );
        return { isMobile, isDesktop, isAndroid, isIos, isSSR, isChromeIos, isKakao, isNaver }
    }

    const userAgent = ( typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent );
    return getMobileDetect( userAgent );
}


// From underscore.js
export const debounce = (func, wait, immediate) => {

    var timeout;

    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);

    };

};

// Alert and confirm helper
export function jtAlert(msg, callback) {
    const agent = getAgent();
    if ( agent?.browser?.name === 'safari' && agent?.browser?.webview === false && agent?.isMobile === true ) {
        // On ios use custom alert to fix back button issue 
        const portalNode = document.createElement('div');
        ReactDOM.render(<Alert message={msg} portalNode={portalNode} callback={callback} />, portalNode);
    } else  {
        // Run default browser alert (client request)
        alert(msg);
        if(typeof callback === 'function') callback(); 
    }
}

// Confirm  helper ( async await required )
/* Usage :
 * const handleClick = async() => {
 *     const result = await jtConfirm('confirm test');
 * }
 */
export const jtConfirm = (msg) => {
    return new Promise(resolve => {
        const agent = getAgent();
        if ( agent?.browser?.name === 'safari' && agent?.browser?.webview === false && agent?.isMobile === true ) {
            const portalNode = document.createElement('div');
            const confirmResult = (val) => {
                resolve(val);
            };
            ReactDOM.render(<Alert confirm message={msg} portalNode={portalNode} confirmResult={confirmResult} />, portalNode);
        } else {
            resolve(confirm(msg));
        }
       
    });
}
