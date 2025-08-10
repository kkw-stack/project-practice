import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const CheckList = React.forwardRef( ( props, ref ) => {

    const childRef = React.useRef( ref );
    const compId = `checklist-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( [] );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );
    const [ isAllCheck, setIsAllCheck ] = React.useState( false );

    const items = ( Array.isArray( props?.children ) ? props?.children.filter( item => item?.props.value ).map( item => item.props ) : [] );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && value.length === 0 ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( parseInt( props?.min ) > 0 && parseInt( props?.min ) > value.length ) {
                return `${ Josa( label, '을', true ) } 최소 ${ props?.min }개 이상 선택해주세요`;
            } else if ( parseInt( props?.max ) > 0 && value.length > parseInt( props?.max ) ) {
                return `${ Josa( label, '을', true ) } 최대 ${ props?.max }개 이하 선택해주세요`;
            }

            for ( let val of value ) {
                if ( ! ( items.map( item => item?.value.toString() ).indexOf( val.toString() ) >= 0 ) ) {
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
            setValue( value.filter( item => item !== event.target.value ).concat( [ event.target.value ] ) || [] );
        } else {
            setValue( value.filter( item => item !== event.target.value ) || [] );
        }
    }

    const handleAllChange = () => {
        if( !isAllCheck ){
            let values = items.map((item, idx) => {
                return item.value.toString();
            });

            setValue( values );
        } else {
            setValue( [] );
        }
    }

    React.useEffect( validateAction, [ value, props?.submitted ] );

    React.useEffect( () => {
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'CheckList',
                name: props?.name,
                value: value,
                validate: validate,
            } );
        }
        
        if(!!value.length){
            if( value.length === items.length ){
                setIsAllCheck( true );
            } else {
                setIsAllCheck( false );
            }
        } else {
            setIsAllCheck( false );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'CheckList',
        name: props?.name,
        value: value,
        validate: validate,
        focus: () => childRef.current.scrollIntoView( { block: 'center' } ),
    } ), [ value, validate ] );

    React.useEffect( () => {
        setIsInited( true );
    }, [] );

    return (
        <div ref={ childRef }>
            { ( props?.label && ! props?.hideLabel ) && (
                <Label text={ props?.labelText ? props.labelText : props.label } required={ props?.required } explain={ props?.explain } />
            ) }

            {
                props?.allcheck &&
                <div className={ `${style.all_check} ${isAllCheck ? style.checked : ''}` }>
                    <label>
                        <input type="checkbox" onChange={handleAllChange}/>
                        <span>
                            {!isAllCheck ? '전체 선택' : '선택 해제'}
                        </span>
                    </label>
                </div>
            }

            <div className={ style.group_item } >
                { ( props?.appendError ) && (
                    <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
                ) }

                <ul className={ `${ ( props?.className ? props.className : '' ) }` }>
                    { items.map( ( item, idx ) => (
                        <li key={ idx + value.indexOf( item.value.toString() ).toString() } className={ `${ item?.className ? item.className : '' }` }>
                            <label htmlFor={ `${ compId }-${ idx }` } className={ `${ style.container } ${ ( props?.round ? style.round : '' ) }` }>
                                { ( item?.append ) && (
                                    <>
                                        { ( ! item?.hideLabel ) && (
                                            <span className={ style.label }>
                                                { item?.label ? item.label : item.value }
                                                { ( item?.desc ) && ( <p className="desc">{ item.desc }</p> ) }
                                            </span>
                                        ) }

                                        { (  item?.image ) && (
                                            <figure className="">
                                                <p><img src={ item.image } alt={ ( item?.label ? item.label : item?.value ) } /></p>
                                            </figure>
                                        ) }

                                        { ( item?.children ) && ( item.children ) }
                                    </>
                                ) }

                                <input
                                    id={ `${ compId }-${ idx }` }
                                    type="checkbox"
                                    checked={ value.indexOf( item.value.toString() ) >= 0 }
                                    onChange={ handleChange }
                                    onBlur={ () => validateAction() }
                                    { ...( Object.keys( item ).filter( key => key !== 'children' ).reduce( ( obj, key ) => { obj[ key ] = item[ key ]; return obj; }, {} ) ) }
                                />

                                { ( ! item?.append ) && (
                                    <>
                                        { ( ! item?.hideLabel ) && (
                                            <span className={ style.label }>
                                                { item?.label ? item.label : item.value }
                                                { ( item?.desc ) && ( <p className="desc">{ item.desc }</p> ) }
                                            </span>
                                        ) }

                                        { (  item?.image ) && (
                                            <figure className="">
                                                <p><img src={ item.image } alt={ ( item?.label ? item.label : item?.value ) } /></p>
                                            </figure>
                                        ) }

                                        { ( item?.children ) && ( item.children ) }
                                    </>
                                ) }
                            </label>
                        </li>
                    ) ) }
                </ul>
            </div>

            { ( ! props?.appendError ) && (
                <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
            ) }
        </div>
    );
} );

export default CheckList;