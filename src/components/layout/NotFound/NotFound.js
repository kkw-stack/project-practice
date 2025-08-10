import React, { Component } from 'react';
import Link from 'next/link';

import Character from 'components/ui/Character/Character';
import Vh from 'components/ui/Vh/Vh';
import Button from 'components/ui/Button/Button';

import style from './NotFound.module.css';

export default class NotFound extends Component {

    render = () => {
        return (
            <div className={`view ${style.container}`}>
                <Character useMarginTop type="no_result_06" text="페이지가 존재하지 않아요" />
                <div className={ style.button }>
                    <Link href="/">
                        <Button>뭉치고 홈으로</Button>
                    </Link>
                </div>
            </div>
        );
    }

}