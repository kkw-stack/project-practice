import React from 'react';
import { AppContext } from 'lib/context';
import { useRouter } from 'next/router';

import style from './LocationButton.module.css';

export default function LocationButton( props ) {

    const router = useRouter();

    // Context
    const { setShowLocation } = React.useContext( AppContext );

    // Event
    const handleOpen = () => {
        setShowLocation( true );
        history.pushState({ location: 'open' }, null, location.href);
    }

    React.useEffect(() => {
        router.beforePopState(({ url, as, options }) => {
            return false;
        });
    }, [ router ]);

    return (
        <a className={`${style.container} ${props.invert ? style.invert : ''}`} onClick={handleOpen}>
            <span className="sr_only">위치설정</span>
        </a>
    );
}