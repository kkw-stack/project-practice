import React,{ Component } from 'react';
import Link from 'next/link';

import style from './BannerSection.module.css';

export default class BannerSection extends Component {

    render = () => {
        return (
            <div className={ style.container }>
                <figure>
                    <Link href={ { pathname: '/inquiry/form', query: { term: '의견제안' } } } as="/문의하기?term=의견제안">
                        <a rel="nofollow">
                            <img src={ require( './images/main_banner@2x.jpg' ) } alt="함께 만드는 뭉치고 반짝이는 아이디어를 제안해주세요" />
                        </a>
                    </Link>
                </figure>
            </div>
        )
    }
}