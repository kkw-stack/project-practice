import React from 'react';

import Label from '../Label';
import Remove from '../Remove';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const Email = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const inputRef = React.useRef( null );
    const compId = `email-${ Math.random().toString().split('.').pop() }`;
    const reg = new RegExp( /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/ );
    const [ value, setValue ] = React.useState( props?.value || '' );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( ! reg.test( value ) ) {
                return `${ Josa( label, '은', true ) } 영문 소문자, 숫자, @ _ . – 만 가능합니다`
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const clearValue = event => {
        event.preventDefault();

        setValue( '' );
        if ( typeof inputRef?.current?.focus === 'function' ) inputRef.current.focus();

        return false;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Email',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Email',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={style.group_item}>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label for={ compId } text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div className="jt_form_field_wrap">
                <div className={ style.textfield }>
                    <input
                        ref={ inputRef }
                        type="text"
                        autoCapitalize="off"
                        inputMode="email"
                        id={ compId }
                        className={ style.input }
                        value={ value }
                        onChange={ ( e ) => setValue( e.target.value ) }
                        onBlur={ () => validateAction() }
                        placeholder={ props?.placeholder }
                        autoComplete="false"
                        disabled={ props?.disabled }
                        readOnly={ props?.readOnly }
                    />

                    { ( ! props?.hideClear && value.length > 0 && ! props?.disabled && ! props?.readOnly ) && (
                        <Remove onClick={ clearValue } sreenReader="이메일 삭제" />
                    ) }
                </div>
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Email;