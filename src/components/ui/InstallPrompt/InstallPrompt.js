import React, { Component, createRef } from 'react';

import { cookies, useDevice } from 'lib/utils';

import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import ButtonClose from '../ButtonClose/ButtonClose';

import style from './InstallPrompt.module.css';

export default class InstallPrompt extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            show : false
        }
        this.deferredPrompt = createRef(null);
    }

    componentDidMount(){
        const device = useDevice();
        const showPrompt = (parseInt(cookies.get('hide_pwa_prompt'))) ?  false : true; 
        const isStandalone = navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
          
        if(showPrompt && !isStandalone){
            if(device.isIos() && !device.isChromeIos()){
                if(!(device.isKakao() || device.isNaver())){
                    if(this.props.enableIos) { // disable on ios by default
                        this.setState({ show : true })
                        this.toggleBodyClass();
                    }
                }
            }else{
                this.listenBeforeinstallprompt();
            }
        } 
    }

    componentDidUpdate() {
        this.toggleBodyClass();
    }

    listenBeforeinstallprompt = () => {
        window.addEventListener('beforeinstallprompt', (e) =>  {

            // Prevent Chrome 76 and later from showing the mini-infobar
            e.preventDefault();
        
            // Stash the event so it can be triggered later.
            this.deferredPrompt.current = e;

            // Show custom prompt
            this.setState({
                show : true
            })
            this.toggleBodyClass();

        });
    }
    
    showNativeInstallPrompt = () => {    
        if (!this.deferredPrompt.current) return false;

        // Show the prompt
        this.deferredPrompt.current.prompt();
   
        // Wait for the user to respond to the prompt
        this.deferredPrompt.current.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
                this.closeModal();
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            this.deferredPrompt.current = null;
        });
    }

    closeModal = (e,remember) => {
        this.setState({
            show : false
        })

        // Show after 1 day
        if(remember){
            cookies.set('hide_pwa_prompt','1',{ 'max-age': 86400 })
        }
    }
    
    toggleBodyClass = () => {
        if ( this.state.show ) {
            if(window.innerWidth < 680){
                document.body.classList.add( style.open_body );
            }
        } else {
            document.body.classList.remove( style.open_body );
        }
    }

    render() { 
        const desc =  ( 
            <div className={style.desc}>
                <div className={style.logo}>
                    <Logo noH1 width={70} height={28} />
                </div>
                <p className={style.text}>
                    <b>뭉치고</b>에서, <br />
                    동네 주민이 남긴 <br />
                    진짜 후기를 확인해보세요!
                </p>
            </div>
        )
        
        return (
            <> 
            {this.state.show && (
                 <> 
                    <div onClick={this.closeModal} className={style.overlay}></div>
                    <div className={style.container}>
                        <div className={style.inner}>
                            <div className={style.close}>
                                <ButtonClose onClick={(e)=>{this.closeModal(e,true)}} />
                            </div>
                            <div className={style.content}>
                                {desc}
                                <div className={style.btn}>
                                    <Button className={style.btn} type="button" onClick={this.showNativeInstallPrompt}>홈 화면에 추가하기</Button>
                                </div>
                                <div className={style.ios_notice}>
                                    <span>아이콘을 탭하여 홈 화면에 추가하기</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            </>
         );
    }
}