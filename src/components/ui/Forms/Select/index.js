import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const Select = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `select-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.value || '' );
    const items = ( Array.isArray( props?.children ) ? props?.children.map( item => item.props ) : [] );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );
    const [ active, setActive ] = React.useState(false);

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( items.map( item => item?.value ? item.value.toString() : item ).indexOf( value ) < 0 ) {
                return `올바른 ${ Josa( label, '을', true ) } 선택해주세요`;
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
                type: 'Select',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Select',
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

            <div className={ `${style.selectbox} ${active ? style.active : ''}` }>
                <select id={ compId }
                        value={ value }
                        disabled={ props?.disabled }
                        onChange={ (e) => {setValue( e.target.value )}}
                        onClick={ () => { setActive(!active); console.log('focus')}  }
                        onBlur={ () => {validateAction(); setActive(false); console.log('blur')}  }
                >
                    { ( props?.hideGuide !== true ) && (
                        <option disabled hidden className="select_guide" value="">{ props?.guide ? props.guide : '선택해주세요' }</option>
                    ) }

                    { items.map( ( item, idx ) => (
                        <option key={ idx } { ...item }>{ item?.label ? item.label : item.value }</option>
                    ) ) }
                </select>
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Select;