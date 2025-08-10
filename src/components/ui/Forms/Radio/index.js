import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const Radio = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `radio-${ Math.random().toString().split('.').pop() }`;
    const [ etcText, setEtcText ] = React.useState( '' );
    const [ value, setValue ] = React.useState( props?.value ? props.value : '' );
    const items = ( Array.isArray( props?.children ) ? props?.children.filter( item => item?.props.value ).map( item => item.props ) : [] );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( ! ( items.map( item => item?.value ).indexOf( value ) >= 0 || value === 'etc' || value === '' ) ) {
                return `유효한 ${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( props?.requiredEtc && value === 'etc' && ! etcText ) {
                return `기타항목을 작성해주세요`;
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
                type: 'Radio',
                name: props?.name,
                value: value,
                etc: ( value === 'etc' ? etcText : '' ),
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Radio',
        name: props?.name,
        value: value,
        etc: ( value === 'etc' ? etcText : '' ),
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={style.group_item}>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div className={style.radio}>
                { items.map( ( item, idx ) => (
                    <label key={ idx }>
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

                        <span>{ item?.label ? item.label : item.value }</span>
                    </label>
                ) ) }

                { ( props?.useEtc ) && (
                    <>
                        <label>
                            { ( props?.etcImage ) && (
                                <figure className="">
                                    <p><img src={ props?.etcImage } alt={ ( props?.etcText ? props?.etcText : '기타' ) } /></p>
                                </figure>
                            ) }

                            <input
                                type="radio"
                                value="etc"
                                checked={ value === 'etc' }
                                onChange={ e => setValue( e.target.value ) }
                                onBlur={ () => validateAction() }
                            />
                            <span>{ ( props?.etcText ? props?.etcText : '기타' ) }</span>
                        </label>

                        { ( value === 'etc' ) && (
                            <input type="text" value={ etcText } onChange={ e => setEtcText( e.target.value ) } onBlur={ () => validateAction() } />
                        ) }
                    </>
                ) }
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Radio;