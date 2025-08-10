import React from 'react';
import { AppContext } from 'lib/context';
import { useRouter } from 'next/router';

import style from './ButtonMenu.module.css';

export default function ButtonMenu(props) {

    const router = useRouter();

    // Context
    const { setShowMenu } = React.useContext( AppContext );

    // Event
    const handleMenuOpen = () => {
        setShowMenu(true);
        history.pushState({ menu: 'open' }, null, location.href);
    }

    React.useEffect(() => {
        router.beforePopState(({ url, as, options }) => {
            return false;
        });
    }, [ router ]);

    // React.useEffect(() => {

    //     const handlePopstate = () => {
    //         console.log( props )
    //     }

    //     window.addEventListener('popstate', handlePopstate)

    //     return () => {
    //         window.removeEventListener('popstate', handlePopstate);
    //     }
    // }, []);

    return ( 
        <button className={`${style.container} ${props.invert ? style.invert : ''}`} onClick={handleMenuOpen}>
            <span className={ style.inner }>
                <span className="sr_only">뭉치고 메뉴</span>
            </span>
        </button>
    );
}
