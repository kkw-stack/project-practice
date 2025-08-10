import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';

import style from '../Form.module.css';

const Rating = React.forwardRef( ( props, ref ) => {
    if ( ! parseInt( props?.max ) ) throw new Error( '최대 값을 지정해주세요' );

    const childRef = React.useRef( ref );

    const compId = `rating-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.value ? props.value : '' );
    const [ hover, setHover ] = React.useState( 0 );
    const items = Array.from( { length: parseInt( props.max ) }, ( x, i ) => i + 1 );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
            if ( props?.required && ! value ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( ! ( items.map( item => ( item || '' ).toString() ).indexOf( ( value || '' ).toString() ) >= 0 || value === '' ) ) {
                return `유효한 ${ Josa( label, '을', true ) } 선택해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        validateAction();
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'Rating',
                name: props?.name,
                value: ( parseInt( value ) ? parseInt( value ) : 0 ),
                validate: validate,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'Rating',
        name: props?.name,
        value: ( parseInt( value ) ? parseInt( value ) : 0 ),
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

            <div className={style.group_item}>
                <ul className={ style.rating }>
                    { items.map( ( item, idx ) => (
                        <li
                            key={ idx }
                            className={ `${ ( parseInt( value ) >= parseInt( item ) ? style.active : '' ) } ${ ( parseInt( item ) <= parseInt( hover ) ? style.hover : '' ) }` }
                            onMouseEnter={ () => setHover( parseInt( item ) ) }
                            onMouseLeave={ () => setHover( '' ) }
                        >
                            <input
                                type="radio"
                                id={ `${ compId }-${ item }` }
                                value={ item }
                                checked={ parseInt( value ) === parseInt( item ) }
                                onChange={ e => setValue( parseInt( e.target.value ) ) }
                            />
                            <label htmlFor={ `${ compId }-${ item }` }><span className="sr_only">{ item }점</span></label>
                        </li>
                    ) ) }
                </ul>
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default Rating;