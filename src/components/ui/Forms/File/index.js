import React from 'react';

import Label from '../Label';
import Error from '../Error';

import { Josa } from '../utils';
import { jtAlert } from 'lib/utils';

import style from '../Form.module.css';

const File = React.forwardRef( ( props, ref ) => {
    const childRef = React.useRef( ref );
    const compId = `file-${ Math.random().toString().split('.').pop() }`;
    const [ value, setValue ] = React.useState( props?.value ? props.value : [] );
    const [ validate, setValidate ] = React.useState( true );
    const [ isInited, setIsInited ] = React.useState( false );

    const maxCount = parseInt( parseInt( props?.max ) > 0 ? props.max : 0 );
    const isSingle = maxCount === 1;
    const extension = ( Array.isArray( props?.extension ) ? props.extension.map( item => item.replace( /(\.)/g, '' ).toLowerCase() ) : [] );

    const validateAction = () => {
        const newValid = ( () => {
            const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );

            if ( props?.required && value.length === 0 ) {
                return `${ Josa( label, '을', true ) } 선택해주세요`;
            } else if ( parseInt( props?.min ) > 0 && parseInt( props?.min ) > value.length ) {
                return `${ Josa( label, '을', true ) } 최소 ${ props?.min }장 이상 선택해주세요`;
            }
            return true;
        } )();

        setValidate( newValid );

        return newValid;
    }

    const addFiles = ( e ) => {
        e.preventDefault();

        const label = ( props?.validLabel ? props.validLabel : ( props?.label ? props.label : '항목' ) );
        const files = e?.target.files || [];
        const maxSize = parseInt( parseInt( props?.size ) > 0 ? props.size : 15 );

        const resFiles = [];
        const errFiles = [];

        if ( files.length > 0 ) {
            if ( maxCount > 0 && value.length >= maxCount ) {
                jtAlert( `${ Josa( label, '은', true ) } 최대 ${ maxCount }장까지 등록 가능합니다` );
            } else {
                if ( files.length === 1 ) {
                    const file = files[0];
                    if ( maxCount > 0 && value.length >= maxCount ) {
                        jtAlert( `${ Josa( label, '은', true ) } 최대 ${ maxCount }장까지 등록 가능합니다` );
                    } else if ( ( maxSize > 0 && file.size > maxSize * 1024 * 1024 ) || ( extension.length > 0 && extension.indexOf( file.name.split( '.' ).pop().toLowerCase() ) < 0 ) ) {
                        // jtAlert( `${ maxSize }MB 이하, ${ [].concat( extension.map( item => item.toUpperCase() ) ).join( ', ' ) } 형식의 파일만 등록 가능합니다` );
                        jtAlert( `${ maxSize }MB 이하, 사진 파일만 등록 가능합니다` );
                    } else {
                        resFiles.push( file );
                    }
                } else {
                    for ( let file of files ) {
                        if ( maxCount > 0 && value.length + resFiles.length >= maxCount ) {
                            jtAlert( `${ Josa( label, '은', true ) } 최대 ${ maxCount }장까지 등록 가능합니다` );
                            break;
                        } else if (
                            ( maxSize > 0 && file.size > maxSize * 1024 * 1024 ) ||
                            ( extension.length > 0 && extension.indexOf( file.name.split( '.' ).pop().toLowerCase() ) < 0 )
                        ) {
                            errFiles.push( file );
                        } else {
                            resFiles.push( file );
                        }
                    }

                    if ( errFiles.length > 0 ) {
                        jtAlert( `${ maxSize }MB 이하, 사진 파일만 등록 가능합니다` );
                    }
                }

                if ( resFiles.length > 0 ) {
                    setValue( value.concat( resFiles ) );
                }
            }
        }

        e.target.value = '';
        return false;
    }

    const removeFile = ( event, idx ) => {
        event.preventDefault();

        setValue( value.filter( ( item, index ) => index !== idx ) );

        return false;
    }

    React.useEffect( validateAction, [ props?.submitted ] );

    React.useEffect( () => {
        const newValid = validateAction();
        if ( isInited && typeof props?.onChange === 'function' ) {
            props.onChange( {
                type: 'File',
                name: props?.name,
                value: value,
                validate: newValid,
            } );
        }
    }, [ value ] );

    React.useImperativeHandle( ref, () => ( {
        type: 'File',
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
            <div className={ `${ style.file } ${ ! isSingle ? style.file_multiple : '' }` }>
                { ( props?.label && ! props?.hideLabel ) && (
                    <Label for={ compId } text={ props.label } required={ props?.required } explain={ props?.explain } />
                ) }

                { ( props?.appendChild && props?.children ) && ( props.children ) }

                { ( isSingle && value.length === 0 ) && (
                    <div className={ style.file_add_button }>
                        <label htmlFor={ compId } className={ style.file_label }>
                            <i className="sr_only">첨부파일</i>
                            <p className={ style.file_count }>사진 { value.length }/{ ( props?.max ? props?.max : 1 ) }</p>
                        </label>
                        <input
                            type="file"
                            id={ compId }
                            className="jt_form_field"
                            onChange={ addFiles }
                            accept={ ( extension.length > 0 ? `.${ extension.join( ',.' ) }` : '' ) }
                        />
                    </div>
                ) }

                { ( ! isSingle && ( maxCount === 0 || value.length < maxCount ) ) && (
                    <div className={ style.file_add_button }>
                        <label htmlFor={ compId } className={ style.file_label }>
                            <i className="sr_only">첨부파일</i>
                            <p className={ style.file_count }>사진 { value.length }/{ ( props?.max ? props?.max : 1 ) }</p>
                        </label>
                        <input
                            type="file"
                            id={ compId }
                            className="jt_form_field"
                            onChange={ addFiles }
                            multiple
                            accept={ ( extension.length > 0 ? `.${ extension.join( ',.' ) }` : '' ) }
                        />
                    </div>
                ) }

                { ( value.map( ( item, idx ) => (
                    <div key={ idx } className={ style.file_preview }>
                        { ( ( item?.type || [] ).indexOf( 'image' ) < 0 ) ? (
                            <span>{ item.name }</span>
                        ) : (
                            <img className="imageThumb" src={ item?.path ? item.path : URL.createObjectURL( item ) } alt={ item.name } />
                        ) }

                        <button type="button" className={ style.file_remove } onClick={ e => removeFile( e, idx ) }>
                            <span><i className="sr_only">파일삭제</i></span>
                        </button>
                    </div>
                ) ) ) }

                { ( ! props?.appendChild && props?.children ) && ( props.children ) }
            </div>
            <Error show={ props?.submitted === 'true' && ! props?.hideError } text={ validate } />
        </div>
    );
} );

export default File;