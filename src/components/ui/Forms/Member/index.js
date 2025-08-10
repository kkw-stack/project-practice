import React from 'react';

import Label from '../Label';
import Remove from '../Remove';
import Error from '../Error';

import { Josa } from '../utils';
import { WPURL, objectToFormData } from 'lib/utils';

import style from '../Form.module.css';

const Member = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const inputRef = React.useRef( null );
    const { required, type, banList = [], submitted = false, min = 0, max = 0 } = props;
    const compId = `member-${ Math.random().toString().split('.').pop() }`;
    const [ success, setSuccess ] = React.useState( '' );
    const [ value, setValue ] = React.useState( props?.value || '' );
    const [ validate, setValidate ] = React.useState( '' );
    const [ isInited, setIsInited ] = React.useState( false );

    const abortController = new AbortController();
    const { signal } = abortController;

    const readOnly = ( props?.readOnly || [ 'nickname', 'email' ].indexOf( type ) < 0 );

    const handleValue = e => {
        if ( type === 'email' ) {
            setValue( ( parseInt( props?.max ) > 0 ? e.target.value.substr( 0, props.max ) : e.target.value ).toLowerCase() );
        } else {
            setValue( parseInt( props?.max ) > 0 ? e.target.value.substr( 0, props.max ) : e.target.value );
        }
    }

    const clearValue = event => {
        event.preventDefault();

        setValue( '' );
        if ( inputRef.current ) {
            inputRef.current.focus();
        }

        return false;
    }

    const validateAction = () => {
        const newValid = ( async () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            let newValidate = true;
            let newSuccess = '';
            if ( required && ! value ) {
                newValidate = `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( type === 'email' ) {
                const reg = new RegExp( /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/ );
                if ( ! reg.test( value ) ) {
                    newSuccess = '';
                    newValidate = `${ Josa( label, '은', true ) } 영문 소문자, 숫자, @ _ . – 만 가능합니다`;
                } else {
                    const response = await fetch( `${ WPURL }/member/unique`, {
                        method: 'POST',
                        body: objectToFormData( { type: 'email', value: value } ),
                    } ).then( res => res.json() );

                    if ( response === false ) {
                        newSuccess = '';
                        newValidate = `이미 사용 중인 ${ label }입니다`;
                    } else {
                        newSuccess = `멋진 ${ label }이네요!`;
                        newValidate = true;
                    }
                }
            } else if ( type === 'nickname' ) {
                if ( ( parseInt( min ) > 0 && parseInt( min ) > value.length ) || ( parseInt( max ) > 0 && parseInt( max ) < value.length ) ) {
                    newSuccess = '';
                    newValidate = `${ Josa( label, '은', true ) } ${ min }~${ max }자로 입력해주세요`;
                } else if ( ( banList.find( item => value.indexOf( item ) >= 0 ) || '' ).length > 0 ) {
                    const banItem = banList.find( item => value.indexOf( item ) >= 0 ) || '';
                    newSuccess = '';
                    newValidate = `'${ banItem }'${ Josa( banItem, '은', false ) } ${ Josa( label, '으로', true ) } 사용할 수 없습니다`;
                } else if ( ! /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-z|A-Z|0-9|]+$/.test( value ) ) {
                    newSuccess = '';
                    newValidate = `${ Josa( label, '은', true ) } 공백을 제외한 한글, 영문, 숫자만 가능합니다`;
                } else {
                    const response = await fetch( `${ WPURL }/member/unique`, {
                        method: 'POST',
                        body: objectToFormData( { type: 'nickname', value: value } ),
                        signal: signal,
                    } ).then( res => res.json() );

                    if ( response === false ) {
                        newSuccess = '';
                        newValidate = `이미 사용 중인 ${ label }입니다`;
                    } else {
                        newSuccess = `멋진 ${ label }이네요!`;
                        newValidate = true;
                    }
                }
            }

            if ( ! props?.hideError ) {
                setValidate( newValidate );
                setSuccess( newSuccess );
            }

            return newValidate;
        } )();

        return newValid;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Member',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Member',
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
                        id={ compId }
                        className={ style.input }
                        value={ value }
                        onChange={ handleValue }
                        onBlur={ () => validateAction() }
                        placeholder={ props?.placeholder }
                        autoComplete="false"
                        disabled={ props?.disabled }
                        readOnly={ readOnly }
                        { ...( parseInt( props?.max ) > 0 ? { maxLength: parseInt( props.max ) } : {} ) }
                    />

                    { ( ! props?.hideClear && value.length > 0 && ! props?.disabled && ! readOnly ) && (
                        <Remove onClick={ clearValue } sreenReader={ `${ props?.label } 삭제` } />
                    ) }
                </div>
            </div>

            {  ( success !== '' && submitted === 'true' && validate === true ) ? (
                <span className="validation_completed">{ success }</span>
            ) : (
                <Error show={ submitted === 'true' && ! props?.hideError } text={ validate } />
            ) }
        </div>
    );
} );

export default Member;