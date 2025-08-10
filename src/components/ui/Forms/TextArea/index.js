import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';
import { useDevice } from 'lib/utils';

import style from '../Form.module.css';

const TextArea = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `textarea-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.value || '' );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );
    const removeNewLines = text => {
        try {
            return text.replace( /(\r?\n)(\r?\n)/gm, '\n\n' ).replace( /\n\s*\n\s*\n/, '\n\n' ) || '';
        } catch ( e ) {
            return text || '';
        }
    }

    const removeNewLinesForCount = text => {
        try {
            return text.replace( /\s\s+/gm, ' ' ) || '';
        } catch ( e ) {
            return text || '';
        }
    }

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 입력해주세요`;
            } else if ( parseInt( props?.max ) > 0 && removeNewLinesForCount( value ).length > parseInt( props?.max ) ) {
                return `${ Josa( label, '은', true ) } 최대 ${ props.max }자 이하 작성해주세요`;
            } else if ( parseInt( props?.min ) > 0 && removeNewLinesForCount( value ).length < parseInt( props?.min ) ) {
                return `${ Josa( label, '은', true ) } 최소 ${ props.min }자 이상 작성해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const handleFocus = () => {
        const device = useDevice();

        // fix android textarea scroll issue
        if(device.isAndroid()){
            const el = childRef.current.querySelector('textarea');
            const target_pos = (el.getBoundingClientRect().top - el.offsetTop) + document.documentElement.scrollTop;
            const headerOffset = 60+54+50; // header + sticky + label (TODO : get value dynamically)
            const target_pos_y = target_pos - headerOffset;

            setTimeout(() => {
                window.scrollTo(0,target_pos_y);
            }, 200);

        }
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'TextArea',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'TextArea',
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
                <Label for={ compId } text={ props?.labelText ? props.labelText : props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            { ( ! props?.appendError ) && ( <Error prepend show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } /> ) }

            <div className={ style.textarea }>
                <div className={ style.inner }>
                    <textarea
                        id={ compId }
                        className = {`scroll_area ${props?.size === "large" ? style['size_large'] : ''}`}
                        value={ value }
                        onChange={ ( e ) => setValue( parseInt( props?.max ) > 0 ? removeNewLines( e.target.value ).substr( 0, props.max ) : removeNewLines( e.target.value ) ) }
                        onBlur={ () => validateAction() }
                        onFocus={ () => handleFocus() }
                        onClick={ () => handleFocus() }
                        placeholder={ props?.placeholder }
                        disabled={ props?.disabled }
                        readOnly={ props?.readOnly }
                        { ...( parseInt( props?.max ) > 0 ? { maxLength: parseInt( props.max ) } : {} ) }
                    />
                </div>

                { ( ! props?.hideCounter && parseInt( props?.max ) > 0 ) && (
                    <div className={ `${ style.counter } ${ ( removeNewLinesForCount( value ).length >= props.max ? style.error : '' ) }` }><span>{ removeNewLinesForCount( value ).length }</span> / { parseInt( props.max ) }</div>
                ) }
            </div>

            { ( props?.appendError ) && ( <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } /> ) }
        </div>
    );
} );

export default TextArea;