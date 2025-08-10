import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const Phone = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `phone-${ Math.random().toString().split('.').pop() }`;
    const regPhone = new RegExp( /^(010)-?[0-9]{4}-?[0-9]{4}$/ );
    const reg = new RegExp( /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/ );
    const [ value, setValue ] = React.useState( props?.value || '' );
    const [ sepValue, setSepValue ] = React.useState( ( props?.value ? props.value.split( '-' ) : [ '010', '', '' ] ) );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );


    const handlePhone = ( e, index ) => {
        const newSepValue = sepValue.map( ( item, idx ) => ( idx === index ? e.target.value.replace( /\D/g, '' ).substr( 0, index === 0 ? 3 : 4 ) : item ) );
        setSepValue( newSepValue );
    };
    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );

            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( ! props?.onlyPhone && ! reg.test( value ) ) {
                return `${ Josa( label, '을', true ) } 확인 후 입력해주세요`;
            } else if ( props?.onlyPhone && ! regPhone.test( value ) ) {
                return `${ Josa( label, '을', true ) } 확인 후 입력해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited === true ) {
            setValue( sepValue.filter( item => item ).join( '-' ) );
        }
    }, [ sepValue ] );

    React.useEffect( () => {
        if ( isInited && props?.name && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Phone',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        ref,
        type: 'Phone',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );


    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={`${style.group_item} ${props.noMarginBottom ? style.group_item_no_margin_bottom : ''}`}>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label for={ compId } text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            { ( props?.children && props?.appendChild ) && ( <>{ props.children }</>) }

            { ( props?.split ) ? (
                <div className={style.phone }>
                    <div className={ style.item }>
                        <div className={ style.textfield }>
                            <span className="sr_only">{ props?.label } 처음자리를 입력해주세요</span>
                            <input
                                type="text"
                                id={ compId }
                                className={ style.field }
                                maxLength="3"
                                inputMode="tel"
                                value={ sepValue[0] }
                                onChange={ e => handlePhone( e, 0 ) }
                                onBlur={ () => validateAction() }
                                readOnly={ props?.readOnly || props?.onlyPhone }
                                disabled={ props?.disabled }
                            />
                        </div>
                    </div>
                    <div className={ style.item }>
                        <span className={ style.separator } />
                        <div className={ style.textfield }>
                            <span className="sr_only">{ props?.label } 중간자리를 입력해주세요</span>
                            <input
                                type="text"
                                className={ style.field }
                                maxLength="4"
                                inputMode="tel"
                                value={ sepValue[1] }
                                onChange={ e => handlePhone( e, 1 ) }
                                onBlur={ () => validateAction() }
                                readOnly={ props?.readOnly }
                                disabled={ props?.disabled }
                            />
                        </div>
                    </div>
                    <div className={ style.item }>
                        <span className={ style.separator } />
                        <div className={ style.textfield }>
                            <span className="sr_only">{ props?.label } 마지막자리를 입력해주세요</span>
                            <input
                                type="text"
                                className={ style.field }
                                maxLength="4"
                                inputMode="tel"
                                value={ sepValue[2] }
                                onChange={ e => handlePhone( e, 2 ) }
                                onBlur={ () => validateAction() }
                                readOnly={ props?.readOnly }
                                disabled={ props?.disabled }
                            />
                        </div>
                    </div>

                    { ( props?.placeholder ) && (
                        <span>{ props.placeholder }</span>
                    ) }
                </div>
            ) : (
                <div className={ style.phone }>
                    <div className={ style.textfield }>
                        <input
                            type="text"
                            id={ compId }
                            inputMode="tel"
                            className={ style.input }
                            value={ value }
                            onChange={ e => setValue( e.target.value.replace( /\D/g, '' ) ) }
                            onBlur={ () => validateAction() }
                            placeholder={ props?.placeholder }
                            autoComplete="false"
                            readOnly={ props?.readOnly }
                            disabled={ props?.disabled }
                        />
                    </div>
                </div>
            ) }

            { ( props?.children && ! props?.appendChild ) && ( <>{ props.children }</>) }

            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Phone;