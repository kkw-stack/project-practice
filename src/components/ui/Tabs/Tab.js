import React, { Component } from 'react';

import PropTypes from 'prop-types';

import style from './Tabs.module.css';

export default function Tab( props ) {
    return (
        <li className={ `${style.item} ${ props?.active ? style.active : '' }` } onClick={ () => props.onClick( props?.label ) } >
            { props?.title || props?.label }
        </li>
    );
}


Tab.propTypes = {
    active: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};
