import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const CompanyCode = React.forwardRef( ( props, ref ) => {

    const childRef = React.useRef( ref );
    const compId = `companycode-${ Math.random().toString().split('.').pop() }`;
    const reg = new RegExp( /^([0-9]{3})-?([0-9]{2})-?([0-9]{5})$/ );
    const [ value, setValue ] = React.useState( props?.value || '' );
    const [ sepValue, setSepValue ] = React.useState( ( props?.value ? props.value.split( '-' ) : [ '', '', '' ] ) );
    const checkValue = ( props?.split ? sepValue.filter( item => item ).join( '-' ) : value.replace( reg, '$1-$2-$3' ) );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const handlePhone = ( e, index ) => setSepValue( sepValue.map( ( item, idx ) => ( idx === index ? e.target.value.replace( /\D/g, '' ).substr( 0, index === 0 ? 3 : ( index === 1 ? 2 : 5 ) ) : item ) ) );
    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! checkValue ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( checkValue.length > 0 && ! reg.test( checkValue ) ) {
                return `유효한 ${ Josa( label, '을', true ) } 입력해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        setValue( sepValue.filter( item => item ).join( '-' ) );
    }, [ sepValue ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'CompanyCode',
                name: props?.name,
                value: checkValue,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'CompanyCode',
        name: props?.name,
        value: checkValue,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={style.groupe_item}>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label for={ compId } text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div>
                { ( props?.split ) ? (
                    <div className={ `${ style.phone } ${ style.textfield }` }>
                        <div className={ style.item }>
                            <div className={ style.textfield }>
                                <span className="sr_only">{ props?.label } 처음자리를 입력해주세요</span>
                                <input
                                    type="text"
                                    id={ compId }
                                    className="jt_form_field field_tel"
                                    inputMode="numeric"
                                    maxLength="3"
                                    value={ sepValue[0] }
                                    onChange={ e => handlePhone( e, 0 ) }
                                    onBlur={ () => validateAction() }
                                    readOnly={ props?.readOnly }
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
                                    className="jt_form_field field_tel"
                                    inputMode="numeric"
                                    maxLength="2"
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
                                    className="jt_form_field field_tel"
                                    inputMode="numeric"
                                    maxLength="5"
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
                    <div className={ style.container }>
                        <div className={ style.textfield }>
                            <input
                                type="text"
                                id={ compId }
                                className="jt_form_field"
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
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default CompanyCode;