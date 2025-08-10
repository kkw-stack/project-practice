import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';
import { jtAlert } from 'lib/utils';

import style from '../Form.module.css';

const TextList = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `textlist-${ Math.random().toString().split('.').pop() }`;
    const { max = 0, min = 0 } = props;
    const [ value, setValue ] = React.useState( ( props?.value && Array.isArray( props?.value ) ? props.value : ( props?.value && typeof props?.value === 'string' ? [ props.value ] : [ '' ] ) ) );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && value.filter( item => item ).length === 0 ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( parseInt( max ) > 0 && value.filter( item => item ).length > parseInt( max ) ) {
                return `최대 ${ Josa( label, '은', true ) } ${ props.min }${ props?.countStr || '개' }까지 등록 가능합니다`;
            } else if ( parseInt( min ) > 0 && value.filter( item => item ).length < parseInt( min ) ) {
                return `최소 ${ Josa( label, '을', true ) } ${ props.min }${ props?.countStr || '개' } 이상 등록해주세요`;
            }

            if ( parseInt( props?.itemMax ) > 0 || parseInt( props?.itemMin ) > 0 ) {
                for ( const item of value ) {
                    if ( parseInt( props?.itemMax ) > 0 && item.length > parseInt( props?.itemMax ) ) {
                        return `${ Josa( label, '은', true ) } 최대 ${ props.itemMax }자 이하 작성해주세요`;
                    } else if ( parseInt( props?.itemMin ) > 0 && item.length > parseInt( props?.itemMin ) ) {
                        return `${ Josa( label, '은', true ) } 최소 ${ props.itemMin }자 이상 작성해주세요`;
                    }
                }
            }

            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const handleText = ( input, idx ) => {
        setValue( value.map( ( item, index ) => ( index === idx ? ( parseInt( props?.itemMax ) > 0 ? input.substr( 0, props.itemMax ) : input ) : item ) ) );
    }
    const addItem = () => {
        if ( parseInt( max ) > 0 && value.length < parseInt( max ) ) {
            setValue( value.concat( '' ) );
        } else if ( parseInt( max ) > 0 ) {
            jtAlert( `최대 ${ max }${ props?.countStr || '개' }까지 등록 가능합니다` );
        }
    };
    const delItem = ( idx ) => setValue( value.filter( ( item, index ) => index !== idx ) );

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'TextList',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'TextList',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ) );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef } className={ style.textfield_list_wrap }>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label text={ props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            <div className={style.group_item}>
                { ( value.length > 0 ) && (
                    value.map( ( item, idx ) => (
                        <div key={ idx } className={`${ style.textfield } ${style.textfield_list_item}`}>
                            <input
                                type="text"
                                className={ style.input }
                                value={ item }
                                onChange={ e => handleText( e.target.value, idx ) }
                                onBlur={ () => validateAction() }
                                placeholder={ props?.placeholder }
                                autoComplete="false"
                                disabled={ props?.disabled }
                                readOnly={ props?.readOnly }
                                { ...( parseInt( props?.itemMax ) > 0 ? { maxLength: parseInt( props.itemMax ) } : {} ) }
                            />

                            { ( idx > 0 ) && (
                                <button type="button" className={ style.textfield_list_del_btn } onClick={ () => delItem( idx ) }>
                                    <span className="sr_only">삭제</span>
                                </button>
                            ) }
                        </div>
                    ) )
                ) }

                <button type="button" className={ style.textfield_list_add_btn } onClick={ () => addItem() }>
                    <span>{ ( props?.addText ? props.addText : '추가' ) }</span>
                </button>
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default TextList;