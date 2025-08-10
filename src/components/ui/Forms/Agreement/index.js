import React from 'react';

import Error from '../Error';

import style from '../Form.module.css';

const Agreement = React.forwardRef( ( props, ref ) => {

    if ( ! props?.name ) throw new Error( 'name 은 필수 항목입니다' );
    if ( ! props?.label ) throw new Error( 'label 은 필수 항목입니다' );

    const childRef = React.useRef( ref );
    const [ show, setShow ] = React.useState( false );
    const [ value, setValue ] = React.useState( props?.checked ? true : false );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = ( newValue = value ) => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! newValue ) {
                return ( props?.requiredMsg ? props.requiredMsg : `${ label }에 동의해주세요` );
            }

            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const handleClick = event => {
        if ( typeof props?.onClick === 'function' ) {
            return props.onClick( event );
        }
    }

    const handleLabelClick = event => {
        if ( typeof props?.onLabelClick === 'function' ) {
            return props?.onLabelClick( event );
        }
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( Boolean( props?.checked ) !== value ) {
            setValue( props.checked );
            validateAction( props.checked );
        }
    }, [ props?.checked ] );

    React.useEffect( () => {
        validateAction();
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Agreement',
                name: props?.name,
                value: ( value === true ? ( props?.value ? props.value : true ) : false ),
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Agreement',
        name: props?.name,
        value: ( value === true ? ( props?.value ? props.value : true ) : false ),
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={ `${ ( props?.className ? props.className : '' ) } ${style.agreement}` }>
            <label className={ `${ style.checkbox } ${ ( props.right ? style.checkbox_right : '' ) } ${ props?.round ? style.round : '' } ${ props?.required ? 'required' : ''} ${props?.seamless ? style.checkbox_seamless : ''}` }>
                { ( props?.append && props?.label ) && (
                    <span className={`${props?.onLabelClick ? style.agreement_link : '' }`} onClick={ handleLabelClick }>
                        { props.label }
                        { ( props.required ) && (
                            <i className={style.required}>필수</i>
                        ) }
                    </span>
                ) }

                <input
                    type="checkbox"
                    className="jt_icheck"
                    checked={ value }
                    onChange={ () => setValue( ! value ) }
                    onClick={ handleClick }
                    onBlur={ () => validateAction() }
                />

                { ( ! props?.append && props?.label ) && (
                    <span>
                        <span  className={`${props?.onLabelClick ? style.agreement_link : '' }`} onClick={ handleLabelClick }>
                        { props.label }
                        { props.required &&
                            <i className={style.required}>필수</i>
                        }
                        </span>
                    </span>
                ) }
            </label>

            { ( props?.children ) && (
                <>
                    <button type="button" className={`${ ( show ? style.agreement_privacy_btn_open : '' ) } ${style.agreement_privacy_btn}`} onClick={ () => setShow( ! show ) }>
                        <span>내용보기</span>
                    </button>

                    <div className={ `${ ( show ? style.agreement_privacy_container_open : '' ) } ${style.agreement_privacy_container}` }>
                        { props.children }
                    </div>
                </>
            ) }
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Agreement;