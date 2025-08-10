import React,{ Component } from 'react';

import Link from 'next/link';

import style from './SearchSection.module.css';

export default class SearchSection extends Component {

    render = () => {
        return (
            <div className={ style.container }>
                <div className={ style.inner }>
                    <Link href="/search" as="/검색/">
                        <a>
                            <span>찾고 싶은 코스, 샵 검색</span>
                            <i className={ style.submit } type="submit"></i>
                        </a>
                    </Link>
                </div>
            </div>
        );
    }

}