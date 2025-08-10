import React from 'react';

import Label from '../Label';
import Remove from '../Remove';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const Text = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const inputRef = React.useRef( null );
    const compId = `text-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.value || '' );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( parseInt( props?.max ) > 0 && value.trim().length > parseInt( props?.max ) ) {
                return `${ Josa( label, '은', true ) } 최대 ${ props.max }자 이하 작성해주세요`;
            } else if ( parseInt( props?.min ) > 0 && value.trim().length < parseInt( props?.min ) ) {
                return `${ Josa( label, '은', true ) } 최소 ${ props.min }자 이상 작성해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const clearValue = event => {
        event.preventDefault();

        setValue( '' );

        if ( inputRef.current ) {
            inputRef.current.focus();
        }

        return false;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Text',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        ref,
        type: 'Text',
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

            <div className={ style.textfield }>
                <input
                    ref={ inputRef }
                    type="text"
                    id={ compId }
                    className={ style.input }
                    value={ value }
                    onChange={ ( e ) => setValue( parseInt( props?.max ) > 0 ? e.target.value.substr( 0, props.max ) : e.target.value ) }
                    onBlur={ () => validateAction() }
                    placeholder={ props?.placeholder }
                    autoComplete="false"
                    disabled={ props?.disabled }
                    readOnly={ props?.readOnly }
                    { ...( parseInt( props?.max ) > 0 ? { maxLength: parseInt( props.max ) } : {} ) }
                />

                { ( ! props?.hideClear && value.length > 0 && ! props?.disabled && ! props?.readOnly ) && (
                    <Remove onClick={ clearValue } sreenReader="내용 삭제" />
                ) }
            </div>

            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Text;