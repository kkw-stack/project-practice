import React from 'react';
import { useRouter } from 'next/router';

import fetch from 'node-fetch';

import { WPURL } from 'lib/utils';
import { useTerms } from 'lib/swr';

import Header from "components/ui/Header/Header";
import Form from 'components/ui/Forms';

export default function TermsPage( props ) {
    const { data: { location: data } } = useTerms( props?.data );
    const router = useRouter();
    const isPopup = decodeURI( router.asPath ) === '/위치기반서비스-이용약관/seamless';

    const [currentUrl, hash = ''] = decodeURI(router.asPath).split('#');
    const [current, setCurrent] = React.useState(
        data.findIndex(item => item.title === hash) > 0 ?
        data.findIndex(item => item.title === hash) :
        0
    );

    const [content, setContent] = React.useState(data[0]?.content || '');

    const handleChangeSelect = ({ value }) => {
        router.push({ pathname: router.route, query: router.query }, `${currentUrl}#${data[value].title}`);
    }

    React.useEffect(() => {
        const findIdx = data.findIndex(item => item.title === hash);

        setCurrent(findIdx > 0 ? findIdx : 0);
    }, [hash]);

    React.useEffect(() => {
        setContent(
            data?.[current]?.content ?
            data[current].content :
            (data[0]?.content || '')
        );
    }, [data, current]);

    return (
        <>
        <Header useHome={ ! isPopup } title="위치기반서비스 이용약관" />
        <div className="article sub_privacy view">
            <div className="article_body">
                <div className="privacy_box_wrap">
                    <div className="inner_wrap">
                        <div className="privacy_select">
                            <Form.Select value={ current } onChange={handleChangeSelect} hideGuide>
                                { data.map( ( item, idx ) => (
                                    <Form.Item key={ idx } value={ idx } label={ `${ idx === 0 ? '[현행] ' : '' }${ item.title }` } />
                                ) ) }
                            </Form.Select>
                        </div>

                        <div className="privacy_container" dangerouslySetInnerHTML={ { __html: content } }></div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export async function getServerSideProps({ req }) {
    const data = await fetch(`${WPURL}/components/terms`).then(res => res.json());

    if (req.originalUrl.indexOf('seamless') >= 0) {
        return {
            props: {
                data,
                seoData: {
                    title: '위치기반서비스 이용약관 | 회원가입 | 뭉치고',
                    description: '여기를 눌러 링크를 확인하세요.',
                },
            },
        };
    }

    return {
        props: {
            data,
        },
    };
}
