import React from 'react';
import ReactDOM from 'react-dom';

import style from './Alert.module.css';

export default function Alert(props) {

    // props
    const {portalNode} = props;  

    // Hook
    React.useEffect(() => {
       // Add portal node
        document.body.appendChild(portalNode);

       // Fix scroll
       document.body.style.top = `-${window.scrollY}px`;

       // Prevent scroll
       document.body.style.position = 'fixed';
       document.body.style.width = '100%';
       document.body.style.overflow ='hidden';
       document.documentElement.style.overflow ='hidden';
       
        return () => {
            // Remove portal node
            document.body.removeChild(portalNode);
   
            // Save previous scroll to restore later
            const scrollY = document.body.style.top;
            const scrollPosY = parseInt(scrollY)* -1;      
          
            // Remove prevent scroll style
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.overflow ='';
            document.documentElement.style.overflow ='';
            document.body.style.top = '';

            // restore scroll
            window.scrollTo(0, scrollPosY);
        };
    }, [portalNode]);

    React.useEffect(() => {
        // Force close alert on click browser back button
        const handleBackButton = (e) => {            
            if(props.confirm){
                props.confirmResult(false);
            }else{
                if(typeof props.callback === 'function') props.callback();  
            }
            ReactDOM.unmountComponentAtNode(portalNode);
        }
        window.addEventListener('popstate', handleBackButton)

        return () => {
            window.removeEventListener('popstate', handleBackButton)
        }
    },[]);

    // Event
    const handleAlertClose = () => {
        if(typeof props.callback === 'function') props.callback();  
        ReactDOM.unmountComponentAtNode(portalNode);
    };

    const handleConfirmOk = () => {
        props.confirmResult(true);
        ReactDOM.unmountComponentAtNode(portalNode);
    };

    const handleConfirmCancel = () => {
        props.confirmResult(false);
        ReactDOM.unmountComponentAtNode(portalNode);
    };

    // n2br helper to allow \n in props message
    const lines = props.message.split('\n');
    const message = lines.map((line, index) => {
        return (
        <React.Fragment key={index}>
            {line}
            {index < lines.length - 1 && <br />}
        </React.Fragment>
        );
    });

    return ReactDOM.createPortal(
        <>
            <div className={style.overlay}></div>
            <div className={style.container}>
                <div className={style.inner}>
                    <div className={style.text}>{message}</div>
                </div>
                {props.confirm ? (
                    <div className={style.button_group}>
                        <div className={style.button} onClick={handleConfirmCancel}>취소</div>
                        <div className={style.button} onClick={handleConfirmOk}>확인</div>
                    </div>
                ) : (
                    <div className={style.button} onClick={handleAlertClose}>확인</div>
                )}
            </div>
        </>, 
    portalNode );

}

