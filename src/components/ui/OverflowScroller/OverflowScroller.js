import React from 'react';

import debounce from './utils/debounce';

import style from './OverflowScroller.module.css';

function OverflowScroller(props) {
    const [height, setheight] = React.useState(0);

    const getWinHeight = () => {
        let win_height = 0;

        if(window.screen.height === window.innerHeight){
                //  WITHOUT ios address bar  (fullscreen)
            win_height = window.screen.height;
        }else{
                // WITH ios address bar
            win_height = window.innerHeight;
        }
        
        return win_height;
    }

    const getOffset = () => {
        const smallScreenOffset = props.offset?.sm ? props.offset.sm : 0;
        const largeScreenOffset = props.offset?.lg ? props.offset.lg : (props.offset?.sm ? props.offset.sm : 0);
        const offset = window.innerWidth > 1023 ? largeScreenOffset : smallScreenOffset;

        return offset;
    }

    React.useEffect(() => {
        
        // Set initial height
        setheight(getWinHeight() - getOffset ());

        // Listen on resize
        const debouncedHandleResize = debounce(function handleResize() {
            setheight(getWinHeight() - getOffset ());
        }, 200)

        window.addEventListener('resize', debouncedHandleResize)

        return () => {
            window.removeEventListener('resize', debouncedHandleResize)
        }
    },[])

    return (
        <div className={`${props.className ? props.className : ''} ${style.container}`} style={{height:height+'px'}}>
            {props.children}
        </div>
    )
}

export default OverflowScroller;