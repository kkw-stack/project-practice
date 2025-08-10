import React from 'react';

import Accordion from 'components/ui/Accordion/Accordion';
import Button from 'components/ui/Button/Button';

import style from './FaqSection.module.css';

export default function FaqSection( props ) {

    const { posts } = props;

    const [ page, setPage ] = React.useState( 1 );
    const [ datas, setDatas ] = React.useState( posts.filter( (item, idx) => ( idx < (5*page) ) ) || [] );

    const handleLoadMore = () => {
        setPage( page+1 );
    }

    React.useEffect(() => {
        if( JSON.stringify(datas) !== JSON.stringify(posts.filter( (item, idx) => ( idx < (5*page)) ) ) ){
            setDatas([ ...datas ].concat(
                posts.filter( (item, idx) => ( (idx >= (5*(page-1))) && (idx < (5*page)) ) )
            ));
        }
    }, [ page ]);

    return (
        <div className={ style.container }>
            <h2 className={ style.subtitle }>자주 묻는 질문 답변</h2>
            { (datas.length > 0) && (
                <div className={ style.accordion }>
                    { datas.map( ( item, idx ) => (
                        <Accordion key={ idx } closed>
                            <Accordion.Item type="title">
                                <h3>{ item.question }</h3>
                            </Accordion.Item>
                            <Accordion.Item type="content">
                                <div dangerouslySetInnerHTML={ { __html: item.answer } }></div>
                            </Accordion.Item>
                        </Accordion>
                    ) )}
                    { ((posts.length > 0) && (posts.length > datas.length )) && (
                        <div className={ style.more }><Button more size="medium" onClick={handleLoadMore}>더보기</Button></div>
                    ) }
                </div>
            ) }
        </div>
    )
}