import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa, getDaumPostCode } from '../utils';
import { jtAlert } from 'lib/utils';

import style from '../Form.module.css';

const Address = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const focusRef = React.useRef( null );
    const compId = `address-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( { zipcode: '', address: '', sub: '' } );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = ( newValue = value ) => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( ( props?.required && ( ! newValue?.zipcode || ! newValue?.address ) ) || ( props?.subRequired && ( ! newValue?.sub ) ) ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const searchAddress = ( event ) => {
        event.preventDefault();

        try {
            getDaumPostCode( () => {
                new window.daum.Postcode( {
                    popupName: `${ compId }-search`,
                    oncomplete: ( data ) => {
                        setValue( {
                            ...value,
                            zipcode: data.zonecode,
                            address: `${ data.address }${ ( data?.buildingName ? ` (${ data.buildingName })` : '' ) }`,
                        } );

                        validateAction( {
                            ...value,
                            zipcode: data.zonecode,
                            address: `${ data.address }${ ( data?.buildingName ? ` (${ data.buildingName })` : '' ) }`,
                        } );

                        focusRef?.current?.focus();
                    }
                } ).open();
            } );
        } catch ( e ) {
            jtAlert( '주소찾기를 이용할 수 없다면 새로고침해주세요' );
        }

        return false;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && props?.name && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Address',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Address',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={`${style.group_item} ${props.noMarginBottom ? style.group_item_no_margin_bottom : ''}`} >
            { ( props?.label && ! props?.hideLabel ) && (
                <Label for={ compId } text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div className={style.address}>
                <div className={`${style.zipcode} ${style.textfield}`}>
                    <label htmlFor={ compId + '-address' }>
                        <span className="sr_only">우편번호</span>
                        <input
                            type="text"
                            id={ compId + '-zipcode' }
                            value={ value.zipcode }
                            onClick={ searchAddress }
                            onBlur={ () => validateAction() }
                            placeholder="주소찾기를 이용해 입력해주세요"
                            autoComplete="false"
                            readOnly={ true }
                            disabled={ props?.disabled }
                        />
                    </label>
                </div>

                <button type="button" className={ style.address_button } onClick={ searchAddress }>
                    <span>주소찾기</span>
                </button>

                <div className={style.textfield}>
                    <label htmlFor={ compId + '-address' } className="address_label">
                        <span className="sr_only">동(읍/면) 까지의 주소</span>
                        <input
                            type="text"
                            id={ compId + '-address' }
                            value={ value.address }
                            onClick={ searchAddress }
                            onBlur={ () => validateAction() }
                            placeholder=""
                            autoComplete="false"
                            readOnly={ true }
                            disabled={ props?.disabled }
                        />
                    </label>
                </div>

                <div className={style.textfield}>
                    <label htmlFor={ compId + '-sub' } className="address_label">
                        <span className="sr_only">동(읍/면) 이후의 주소</span>
                        <input
                            ref={ focusRef }
                            type="text"
                            id={ compId + '-sub' }
                            value={ value.sub }
                            onChange={ ( e ) => setValue( { ...value, sub: e.target.value } ) }
                            onBlur={ () => validateAction() }
                            placeholder="나머지 주소를 입력해주세요"
                            autoComplete="false"
                            readOnly={ props?.readOnly }
                            disabled={ props?.disabled }
                        />
                    </label>
                </div>
            </div>

            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Address;