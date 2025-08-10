import React from 'react';

import Logo from '../Logo/Logo';
import ButtonClose from '../ButtonClose/ButtonClose';
import ButtonBack from '../ButtonBack/ButtonBack';
import ButtonMenu from '../ButtonMenu/ButtonMenu';
import HomeButton from '../HomeButton/HomeButton';
import LocationButton from '../LocationButton/LocationButton';
import Share from '../Share/Share';

import style from './Header.module.css';

import { useAppContext, AppContext } from 'lib/context';

export default function Header( props ) {
    const { isHome } = useAppContext();
    const { showMenu, setShowMenu } = React.useContext( AppContext );
    const [ headerTitle, setHeaderTitle ] = React.useState( props?.title ? props.title : <div className={ style.logo }><a href={`${process.env.DOMAIN}/`}><Logo noH1 /></a></div> );
    const progressRef = React.useRef();
    const [ centerMode, setCenterMode ] = React.useState( props?.centerMode );

    React.useEffect( () => {
        if( props?.title ){
            setHeaderTitle( props.title );
        } else {
            setCenterMode( true );
            setHeaderTitle( <div className={ style.logo }><a href={`${process.env.DOMAIN}/`}><Logo noH1 /></a></div> );
        }
    }, [ props?.title ] );

    React.useEffect( () => {

        if ( props?.useProgress && typeof window !== 'undefined' ) {
            const handleScroll = () => {
                //Get data for process the progress
                const scroll_top = window.scrollY,
                      doc_h = document.body.scrollHeight,
                      $win_h = window.innerHeight,
                      scroll_percent = (scroll_top / (doc_h - $win_h)) * 100,
                      position = scroll_percent;

                // Update the scale X info (width is not good for performance)
                if ( progressRef.current ) {
                    progressRef.current.style.transform = `scaleX(${position/100})`;
                }
            }

            window.addEventListener('scroll', handleScroll);

            return () => window.removeEventListener('scroll', handleScroll);
        }

    }, [] );

    return (
        <header className={`${ style.container } ${ props?.smallScreenOnly ? style.small_screen_only: '' } ${ props?.noFixed ? style.no_fixed : '' } ${ props?.useNoShadow ? style.no_shadow: ''}`}>
            { ( props?.useLocation ) ? ( isHome ? (
                    <div className={ `${ style.title } ${ centerMode ? style.center : '' }` }>
                        <span className={ style.location_button }>
                            <span className={ style.location_button_inner }>
                                { headerTitle === "뭉치고" ? "서울 전체" : headerTitle }
                            </span>
                        </span>
                    </div>
                ) : (
                    <h1 className={ `${ style.title } ${ centerMode ? style.center : '' }` }>
                        <span className={ style.location_button }>
                            <span className={ style.location_button_inner }>
                                { headerTitle }
                            </span>
                        </span>
                    </h1>
                )
            ) : (
                <>
                {(!props.useNoTitle) && ((!props.noTitleTag) ? (<h1 className={ `${ style.title } ${ centerMode ? style.center : '' }` }>{ headerTitle }</h1>) : (<div className={ `${ style.title } ${ centerMode ? style.center : '' }` }>{ headerTitle }</div>))}
                </>
            ) }

            { ( () => {
                if ( props.useMenu && !props.useHome ) {
                    return ( 
                        <>
                            <ButtonMenu />
                            <HomeButton /> 
                        </>
                    );
                } else if ( props.useHome ) {
                    return ( 
                        <>
                            <ButtonMenu />
                            <HomeButton home /> 
                        </>
                    );
                } else if ( props.useClose ) {
                    return (
                        <div className={`${style.close} ${props.closeRight ? style.right : ''}`}>
                            <ButtonClose onClick={ props.onCloseClick } />
                        </div>
                    );
                } else if ( props.useBack ) {
                    return ( <ButtonBack onClick={props.onBackClick} url={props.backUrl ? props.backUrl : '/'} /> );
                }
            } )() }

            { ( props?.useLocation ) && <LocationButton/> }            

            { ( props?.useShare ) && ( <div className={style.share}><Share useNoText></Share></div> ) }

            { ( props?.children ) && ( props.children ) }

            { ( props.useProgress ) && (
                <div ref={progressRef} className={ style.progress_bar }></div>
            ) }
        </header>
    );
}
