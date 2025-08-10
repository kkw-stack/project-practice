import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const CheckBox = React.forwardRef( ( props, ref ) => {

    const childRef = React.useRef( ref );
    const compId = `checkbox-${ Math.random().toString().split('.').pop() }`;
    const [ etcText, setEtcText ] = React.useState( '' );
    const [ value, setValue ] = React.useState( [] );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const items = (
        Array.isArray( props?.children ) ?
        props?.children.filter( item => item.props?.value ).map( item => item.props ) :
        (
            typeof props?.children === 'object' && props.children?.props ?
            [ props.children.props ] :
            []
        )
    );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && value.length === 0 ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( parseInt( props?.min ) > 0 && parseInt( props?.min ) > value.length ) {
                return `${ Josa( label, '을', true ) } 최소 ${ props?.min }개 이상 선택해주세요`;
            } else if ( parseInt( props?.max ) > 0 && value.length > parseInt( props?.max ) ) {
                return `${ Josa( label, '을', true ) } 최대 ${ props?.max }개 이하 선택해주세요`;
            } else if ( props?.requiredEtc && value.indexOf( 'etc' ) >= 0 && ! etcText ) {
                return `기타항목을 작성해주세요`;
            }

            for ( let val of value ) {
                if ( ! ( items.map( item => item?.value ).indexOf( val ) >= 0 || val === 'etc' ) ) {
                    return `유효한 ${ Josa( label, '을', true ) } 선택해주세요`;
                }
            }

            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const handleChange = ( event ) => {
        if ( event.target.checked ) {
            setValue( value.filter( item => item !== event.target.value ).concat( event.target.value ) );
        } else {
            setValue( value.filter( item => item !== event.target.value ) );
        }
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'CheckBox',
                name: props?.name,
                value: value,
                etc: ( value.indexOf( 'etc' ) >= 0 ? etcText : '' ),
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'CheckBox',
        name: props?.name,
        value: value,
        etc: ( value.indexOf( 'etc' ) >= 0 ? etcText : '' ),
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

            <div className={`${style.group_item} ${props.noMarginBottom ? style.group_item_no_margin_bottom : '' }`}>
                { items.map( ( item, idx ) => (
                    <label key={ idx } htmlFor={ `${ compId }-${ idx }` } className={ `${ style.checkbox } ${ ( props.right ? style.checkbox_right : '' ) } ${ ( props?.round ? style.round : '' ) } ${props.seamless ? style.checkbox_seamless : ''}` }>
                        { ( props?.append ) && (
                            <>
                                { ( ! props?.hideLabel ) && (
                                    <span className={ style.checkbox_label }>
                                        { item?.label ? item.label : item.value }
                                        { ( item?.desc ) && ( <i className={style.desc}>{ item.desc }</i> ) }
                                    </span>
                                ) }

                                { (  item?.image ) && (
                                    <figure className="">
                                        <p><img src={ item.image } alt={ ( item?.label ? item.label : item?.value ) } /></p>
                                    </figure>
                                ) }
                            </>
                        ) }

                        <input
                            id={ `${ compId }-${ idx }` }
                            type="checkbox"
                            checked={ value.indexOf( item.value ) >= 0 }
                            onChange={ handleChange }
                            onBlur={ () => validateAction() }
                            { ...item }
                        />

                        { ( ! props?.append ) && (
                            <>
                                { ( ! props?.hideLabel ) && (
                                    <span className={ style.checkbox_label }>
                                        { item?.label ? item.label : item.value }
                                        { ( item?.desc ) && ( <i className={style.desc}>{ item.desc }</i> ) }
                                    </span>
                                ) }

                                { (  item?.image ) && (
                                    <figure className="">
                                        <p><img src={ item.image } alt={ ( item?.label ? item.label : item?.value ) } /></p>
                                    </figure>
                                ) }
                            </>
                        ) }
                    </label>
                ) ) }

                { ( props?.useEtc ) && (
                    <>
                        <label className={ `${ style.checkbox } ${ ( props.right ? style.checkbox_right : '' ) } ${ ( props?.round ? style.round : '' ) }` }>
                            <input
                                type="checkbox"
                                value="etc"
                                checked={ value.indexOf( 'etc' ) >= 0 }
                                onChange={ handleChange }
                                onBlur={ () => validateAction() }
                            />
                            <span className={ style.checkbox_label }>{ ( props?.etcText ? props?.etcText : '기타' ) }</span>
                        </label>

                        { ( value.indexOf( 'etc' ) >= 0  ) && (
                            <input type="text" value={ etcText } onChange={ e => setEtcText( e.target.value ) } onBlur={ () => validateAction() } />
                        ) }
                    </>
                ) }
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default CheckBox;