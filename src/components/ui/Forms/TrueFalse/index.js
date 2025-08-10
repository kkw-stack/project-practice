import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const TrueFalse = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `truefalse-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.checked === true ? true : false );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = ( newValue = value ) => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && newValue === false ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            }

            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const handleChange = ( event ) => {
        if ( value !== event.target.checked ) {
            setValue( event.target.checked );
        }
    }

    const handleClick = event => {
        if ( typeof props?.onClick === 'function' ) {
            return props.onClick( event );
        }
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( typeof props?.checked !== 'undefined' && props.checked !== value ) {
            setValue( props.checked );
            validateAction( props.checked );
        }
    }, [ props.checked ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'TrueFalse',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'TrueFalse',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={`${props.type === 'toggle' ? style.toggle_container : '' } ${props.toggleSize === 'xl' ? style.toggle_xl : '' }  ${props.seamless ? style.checkbox_seamless : '' }`}>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div className={`${style.group_item} ${props.noMarginBottom ? style.group_item_no_margin_bottom : '' }`}>
                <label htmlFor={ `${ compId }` } className={ `${ style.checkbox } ${ ( props.right ? style.checkbox_right : '' ) } ${ ( props?.round ? style.round : '' ) }` }>
                    { ( props?.append ) && (
                        <>
                            <span className={ style.checkbox_label }>
                                { props?.label ? props.label : props.value }
                                { ( props?.desc ) && ( <p className="desc">{ props.desc }</p> ) }
                            </span>

                            { (  props?.image ) && (
                                <figure className="">
                                    <p><img src={ props.image } alt={ ( props?.label ? props.label : props?.value ) } /></p>
                                </figure>
                            ) }
                        </>
                    ) }

                    {props.type === 'toggle' ? (
                        <div className={style.toggle}>
                            <input
                                id={ `${ compId }` }
                                type="checkbox"
                                checked={ value }
                                onChange={ handleChange }
                                onClick={ handleClick }
                                onBlur={ () => validateAction() }
                            />
                            <label  htmlFor={compId}><span className="sr_only">동의/비동의</span></label>
                        </div>
                    ) : (
                        <input
                            id={ `${ compId }` }
                            type="checkbox"
                            checked={ value }
                            onChange={ handleChange }
                            onClick={ handleClick }
                            onBlur={ () => validateAction() }
                        />
                    )}

                    { ( ! props?.append ) && (
                        <>
                            <span className={ style.checkbox_label }>
                                { props?.label ? props.label : props.value }
                                { ( props?.desc ) && ( <p className="desc">{ props.desc }</p> ) }
                            </span>

                            { (  props?.image ) && (
                                <figure className="">
                                    <p><img src={ props.image } alt={ ( props?.label ? props.label : props?.value ) } /></p>
                                </figure>
                            ) }
                        </>
                    ) }
                </label>
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default TrueFalse;