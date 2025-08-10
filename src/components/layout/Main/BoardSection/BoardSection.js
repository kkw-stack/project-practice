import React,{ Component } from 'react';
import Link from 'next/link';

import style from './BoardSection.module.css';

export default class BoardSection extends Component {

    render = () => {
        const { notice, event, announce } = this.props.posts;

        return (
            <div className={ style.container }>
                { ( notice ) && (
                    <div key={ notice.id }>
                        <p>공지</p>
                        <Link href={ { pathname: '/notice/[slug]', query: { slug: notice.slug } } } as={ `/공지사항/${ notice.slug }` }>
                            <a>{ notice.title }</a>
                        </Link>
                    </div>
                ) }
                { ( event ) && (
                    <div key={ event.id }>
                        <p>이벤트</p>
                        <Link href={ { pathname: '/event/[slug]', query: { slug: event.slug } } } as={ `/이벤트/${ event.slug }` }>{ event.title }</Link>
                    </div>
                ) }
                { ( announce ) && (
                    <div key={ announce.id }>
                        <p>발표</p>
                        <Link href={ { pathname: '/notice/[slug]', query: { slug: announce.slug } } } as={ `/공지사항/${ announce.slug }` }>
                            <a>{ announce.title }</a>
                        </Link>
                    </div>
                ) }
            </div>
        )
    }

}