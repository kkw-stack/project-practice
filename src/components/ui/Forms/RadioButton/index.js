import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const RadioButton = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `radiobutton-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.value ? props.value : '' );
    const items = ( Array.isArray( props?.children ) ? props?.children.map( item => item.props ) : [] );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( ! ( items.map( item => item?.value ).indexOf( value ) >= 0 || value === '' ) ) {
                return `유효한 ${ Josa( label, '을', true ) } 선택해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'RadioButton',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'RadioButton',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef }>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div className="jt_form_field_wrap">
                <ul className={ style.radio_btn }>
                { items.map( ( item, idx ) => (
                    <li key={ idx } className={ item?.disabled ? style.disabled : '' }>
                        <label>
                            { ( item?.image ) && (
                                <figure className="">
                                    <p><img src={ item.image } alt={ ( item?.label ? item.label : item?.value ) } /></p>
                                </figure>
                            ) }

                            <input
                                type="radio"
                                checked={ value === item?.value }
                                onChange={ e => setValue( e.target.value ) }
                                onBlur={ () => validateAction() }
                                { ...item }
                            />
                            <p>{ item?.label ? item.label : item.value }</p>

                            { ( item?.desc ) && ( <span>{ item.desc }</span> ) }
                        </label>
                    </li>
                ) ) }
                </ul>
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default RadioButton;