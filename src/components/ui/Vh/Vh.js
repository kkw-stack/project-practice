import React from 'react';

import debounce from './utils/debounce';

import style from './Vh.module.css';

function Vh(props) {
    const [height, setheight] = React.useState(0);

    // Helper
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

    const setterHeight = () => {
        if(props.smScreenOnly){
            if(window.innerWidth > 1023){
                setheight(0);
            }else{
                setheight(getWinHeight() - getOffset ());
            }
        }else{
            setheight(getWinHeight() - getOffset ());
        }
    }

    // Callback 
    React.useEffect(() => {
        
        // Set initial height
        setterHeight();

        // Listen on resize
        const debouncedHandleResize = debounce(function handleResize() {
            setterHeight();
        }, 200)

        window.addEventListener('resize', debouncedHandleResize)

        return () => {
            window.removeEventListener('resize', debouncedHandleResize)
        }
    },[])

    // Set Vertical align middle if need
    let children = null;
    let heightStyle = {};
    const h = (height === 0) ? 'auto' :  height+'px'

    if(props.alignMiddle){
        children = <div className={style.aligner}><div className={style.aligner_inner}> {props.children} </div></div>;
        if(props.maxHeight){
            heightStyle = {height:h, maxHeight:props.maxHeight+'px'}
        }else{
            heightStyle = {height:h}
        }
    }else if(props.fixHeight){
        children = props.children;
        if(props.maxHeight){
            heightStyle = {height:h, maxHeight:props.maxHeight+'px'}
        }else{
            heightStyle = {height:h}
        }
    }else{
        children = props.children;
        heightStyle = {minHeight:h}
    }
    
    // Renderer
    return (
        <div className={`${props.className ? props.className : ''} ${style.container}`} style={heightStyle}>
            {children}
        </div>
    )
}

export default Vh;