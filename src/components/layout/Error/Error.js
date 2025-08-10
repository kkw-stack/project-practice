import React, { Component } from 'react';
import Link from 'next/link';

import Character from 'components/ui/Character/Character';
import Vh from 'components/ui/Vh/Vh';
import Button from 'components/ui/Button/Button';

import style from './Error.module.css';

export default class Error extends Component {

    render = () => {
        return (
            <div className={`view ${style.container}`}>
                <img src="/images/layout/error.png" alt='시스템 점검중 입니다. 서비스 이용에 불편을 드려서 대단히 죄송합니다.' />
            </div>
        );
    }

}