import React from 'react';
import ReactDOMServer from "react-dom/server"
import { useRouter } from 'next/router';
import fetch from 'node-fetch';
import queryString from 'query-string';
import Link from 'next/link';
import Head from 'next/head';

import { AppContext } from 'lib/context';
import { useShopList } from 'lib/swr';
import getHeader from 'lib/seo';
import { WPURL, queryStringOptions, useOnScreen, useDevice } from 'lib/utils';

import Nav from 'components/ui/Nav/Nav';
import Tags from 'components/ui/Tags/Tags';
import Tag from 'components/ui/Tags/Tag';
import Checkbox from 'components/ui/Checkboxes/Checkbox';
import ListItem from 'components/ui/ListItem/ListItem';
import HeaderList from 'components/ui/HeaderList/HeaderList';
import Loading from 'components/ui/Loading/Loading';
import Header from 'components/ui/Header/Header';
import Character from 'components/ui/Character/Character';
import Vh from 'components/ui/Vh/Vh';
import Accordion from 'components/ui/Accordion/Accordion';
import Button from 'components/ui/Button/Button';
import Separator from 'components/ui/Separator/Separator';

export default function ShopAreaCategoryList( props ) {
    const { user } = React.useContext( AppContext );
    const router = useRouter();

    const scrollRef = React.createRef();

    const { category, newAreaName:areaName, areas } = props;
    const [ query, setQuery ] = React.useState( props.query );
    const [ headerTitle, setHeaderTitle ] = React.useState(`${areaName} ${props.seoCategory.name} 추천${props.seoCount > 0 ? ` Best ${props.seoCount}` : ''}`.replace( /\s\s+/g, ' ' ));
    const [ serverData, setServerData ] = React.useState( props.data );
    const { data, size, setSize, mutate } = useShopList( { ...query }, serverData );
    let posts = ( Array.isArray( data ) ? [].concat( ...data.map( item => item.posts ) ) : ( data?.posts ? data.posts : [] ) );
    const total_posts = parseInt( Array.isArray( data ) && data?.[0]?.total_posts ? data[0].total_posts : ( data?.total_posts ? data.total_posts : 0 ) );
    const isVisible = useOnScreen( scrollRef, [ posts ] );
    const [ seoData, setSeoData ] = React.useState( null );
    const [ showLoading, setShowLoading ] = React.useState( false );
    const [ endInit, setEndInit ] = React.useState( false );
    const [ isMobile, setIsMobile ] = React.useState( false );
    const [ moreLoading, setMoreLoading ] = React.useState( false );
    const [ schemaData, setSchemaData ] = React.useState(props?.schemaData || []);

    const [ currentCategory, setCurrentCategory ] = React.useState(category.find(item => decodeURI(item.slug) === decodeURI(query.category)));
    const [ recommendAreas, setRecommendAreas ] = React.useState([]);
    const [ currentAreaName, setCurrentAreaName ] = React.useState(areaName);

    // fix lazyload
    const lazyLoadFix = () => {
        setTimeout(function(){
            window.dispatchEvent(new Event('resize'));
        },500);
    }

    const handleCategory = ( event, category ) => {
        event.preventDefault();

        setQuery( { ...query, category: category } );
        lazyLoadFix();

        return false;
    }

    const handleOrder = ( event, value ) => {
        event.preventDefault();

        setQuery( { ...query, order: value } );
        lazyLoadFix();

        return false;
    }

    const handleFilter = ( { target: { checked, value } } ) => {
        setQuery( { ...query, filter: ( query.filter.filter( item => item !== value ) || [] ).concat( checked ? [ value ] : [] ) } );
        lazyLoadFix();
    }

    const handleArea = ( event, value ) => {
        event.preventDefault();

        window.scrollTo( 0, 0 );
        setQuery({...query, area: value});
        lazyLoadFix();

        return false;
    }

    const handleLoadMore = () => {
        setMoreLoading( true );
        setSize( size + 1 );

        return false;
    }

    React.useEffect(() => {
        if( moreLoading ){
            setMoreLoading( false );
        }
    }, [ data ]);

    React.useEffect( async () => {
        if ( endInit ) {
            setShowLoading( true );
            setServerData( false );

            const strQuery = queryString.stringify( { order: query.order, filter: query.filter }, queryStringOptions );
            const newUrl = encodeURI( `/지역기반/${ decodeURI( query.area ) }/${ decodeURI( query.category ) }` ) + ( strQuery ? `?${ strQuery }` : '' );

            if ( router.asPath !== newUrl ) {
                router.push(
                    { pathname: '/shoplist/area/[area]/[category]', query: query },
                    newUrl,
                    { shallow: true }
                );
            }

            const { area: seoArea, category: seoCategory, count: seoCount, posts: seoPosts } = await fetch( `${ WPURL }/modules/shop/seo?${ queryString.stringify( query, queryStringOptions ) }` ).then( res => res.json() );
            const areaName = `${ ( seoArea.parent > 0 ? `${ seoArea.parentInfo.name } ${ seoArea.name }` : seoArea.name ) }`;
            // 지역명 3단어 이상이면 뒤에서 2단어까지만 표출
            const areaNameArr = areaName.split(' ');
            const newAreaName = ( ( areaNameArr.length > 2 ) ? ( `${areaNameArr[areaNameArr.length-2]} ${areaNameArr[areaNameArr.length-1]}` ) : areaName );

            setSeoData( {
                title: `${newAreaName} ${seoCategory.name} 추천${seoCount > 0 ? ` Best ${seoCount}` : ''} - 뭉치고`.replace( /\s\s+/g, ' ' ),
                description: `${newAreaName} ${seoCategory.name} 추천${seoPosts.length > 0 ? ` - ${seoPosts.map(item => item.post_title).join(', ')}` : ''} - ${newAreaName} 주변 ${seoCategory.name}를 확인하세요`.replace( /\s\s+/g, ' ' ),
            } );

            setHeaderTitle(`${newAreaName} ${seoCategory.name} 추천${seoCount > 0 ? ` Best ${seoCount}` : ''}`.replace( /\s\s+/g, ' ' ));
            setCurrentAreaName(newAreaName);
            setShowLoading( false );
        }
    }, [ query ] );

    React.useEffect( () => {
        if ( endInit && !showLoading ) {

            const newQuery = { area: router.query.area, category: decodeURI( router.query.category ), ...queryString.parse( ( router.asPath.split( '?' ).length > 1 ? router.asPath.split( '?' ).pop() : '' ), queryStringOptions ) };

            if ( query.area !== newQuery.area || query.category !== newQuery.category || ( query?.order || '' ) !== ( newQuery?.order || '' ) || JSON.stringify( query?.filter || [] ) !== JSON.stringify( newQuery?.filter || [] ) ) {
                setQuery( { ...query, area: newQuery.area, category: newQuery.category, order: newQuery?.order || '', filter: newQuery?.filter || [] } );
            }
        }
    }, [ router ] );

    React.useEffect( () => {
        if ( isVisible ) {
            setSize( size + 1 );
        }
    }, [ isVisible ] );

    React.useEffect( () => {
        mutate();
    }, [ user ] );

    React.useEffect( () => {
        const device = useDevice();

        setIsMobile( device.isMobile() );
        setEndInit( true );
    }, [] );

    React.useEffect(() => {
        if (Array.isArray(posts) && posts.length > 0) {
            const newSchemaData = posts.map(item => ({
                "@context": "http://schema.org",
                "@type": "LocalBusiness",
                "name": item.title,
                "description": "",
                "url": decodeURI(item.permalink),
                "image": decodeURI(item.thumbnail),
                "telephone": item.basic.phone,
                "priceRange": item.basic.price,
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "KR",
                    "addressLocality": item.basic.map.address.split(" ")[0],
                    "addressRegion": "",
                    "postalCode": "",
                    "streetAddress": item.basic.map.address.split(" ").filter((_, idx) => idx > 0).join(" "),
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": parseFloat(item.basic.map.lat),
                    "longitude": parseFloat(item.basic.map.lng),
                },
            }));

            if (JSON.stringify(schemaData) !== JSON.stringify(newSchemaData)) {
                setSchemaData(newSchemaData);
            }
        } else {
            setSchemaData(null);
        }
    }, [posts]);

    React.useEffect(() => {
        // setHeaderTitle([query?.area, query?.category, '샵 추천'].filter(item => item).map(item => item.trim()).join(' ').replace(/-/g, ' '));

        setCurrentCategory(category.find(item => decodeURI(item.slug) === decodeURI(query.category)));

        areas.map(area => {
            if (decodeURI(area.slug) === decodeURI(query.area) && JSON.stringify(recommendAreas) !== JSON.stringify(area.child)) {
                setRecommendAreas(area.child.filter(item => decodeURI(item.slug) !== decodeURI(query.area) && parseInt(item.count) > 0));
                return;
            } else {
                const test = area.child.find(item => decodeURI(item.slug) === query.area);
                if (test && JSON.stringify(recommendAreas) !== JSON.stringify(area.child)) {
                    setRecommendAreas(area.child.filter(item => decodeURI(item.slug) !== decodeURI(query.area) && parseInt(item.count) > 0));
                }
                return;
            }
        });
    }, [query]);

    return (
        <>
        { ( seoData !== null ) && ( getHeader( seoData ) ) }


        <Head>
            {/* 20230526 [201] :: 포스트 갯수가 없을 경우 noindex 처리 제거 */}
            { ( ( !currentAreaName || !currentCategory ) || (!posts.length && false) ) && (
                <meta name="robots" content="noindex" />
            ) }
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: `
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [{
                    "@type": "Question",
                    "name": "사람들이 ${query.area.replaceAll('-', ' ')}에서 검색하는 인기 서비스는 어떤게 있나요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "사람들은 ${query.area.replaceAll('-', ' ')} 근처에서 다음을 검색 했습니다.
                        <ul>${category.map(cate =>
                            ReactDOMServer.renderToStaticMarkup(<li>
                                <a href={`${ process.env.DOMAIN }/${encodeURI('지역기반')}/${encodeURI(query.area)}/${cate.slug}`}>{`${query.area.replaceAll('-', ' ')} ${cate.name}`}</a>
                            </li>)
                        ).join('').toString().replaceAll('"', '')}</ul>"
                    }}, {
                    "@type": "Question",
                    "name": "${currentCategory?.name || '마사지'}의 효능은 무엇인가요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "${currentCategory?.description || '마사지는 뷰티 및 헬스 활동과 같습니다. 스트레스를 없애고 정신적 안정감을 줍니다. 근육의 피로와 통증을 치료하고 이완상태를 만들어줍니다. 노폐물을 배출하여 붓기 및 혈액순환을 촉진시켜 줍니다. 면역력이 증진되고 신체 기능을 개선하여 노화방지에도 효과적입니다.'}<br /> <a href='https://moongchigo.com/뭉치고-블로그/massage-types/'> ${currentCategory?.name || '마사지'}의 종류와 특징 자세히 알아보기 </a>"
                    }}, {
                    "@type": "Question",
                    "name": "어떤 샵이 좋은 샵인가요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "후기와 댓글을 보면 관리사님에 대한 평가나 업체에 대한 평가가 있습니다. 후기 및 별점을 참고하여 업체를 선정해주시거나 경력 및 경험이 중요하기 때문에 업체의 정보 및 코스 등 업체 정보가 꼼꼼하게 작성되어 있는 곳을 방문하시는 것을 추천드립니다."
                    }}, {
                    "@type": "Question",
                    "name": "관리 샵을 고를 때 위치가 중요한가요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "마사지는 꾸준히 받을 때 효과적입니다. 집에서 너무 먼 곳을 찾으시면 마사지를 받은 후 이동 및 관리에 불편함이 있을 수 있습니다. 가능하면 뭉치고의 위치기반 검색을 사용하여 현재 내 위치에서 많이 멀지 않은 업체를 추천드리지만, 타 지역에 출장을 가시거나 시설 및 서비스에 대해 중요하게 생각한다면 후기 및 별점을 참고해주세요"
                    }}, {
                    "@type": "Question",
                    "name": "뭉치고에 불건전한 샵은 없나요?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "뭉치고는 건전한 마사지 문화를 선도합니다. 불건전한 업소가 있다면 언제든 뭉치고의 문의하기를 통해 제보 부탁드립니다. 사실 관계를 확인하고 조치하도록 하겠습니다. 내 가족, 연인과도 함께 받을 수 있는 마사지 문화를 위해서 노력하겠습니다."
                    }
                }]
            }
            `}}></script>

            {Array.isArray(schemaData) && schemaData.length > 0 && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schemaData)}}></script>
            )}
        </Head>

        <div className="article view">
            <Header useHome useLocation title={ headerTitle } />
            <div className="view article category_list_acticle">
                <div className="article_body">
                    <div className="tabs_component">
                        <Nav useArrow fixed>
                            { category.map( item => {
                                const strQuery = queryString.stringify( { ...query, area: '', category: '' }, queryStringOptions );
                                return (
                                    <Nav.item
                                        key={ item.id }
                                        href={ { pathname: router.pathname, query: { ...router.query, category: decodeURI( item.slug ) } } }
                                        as={ `/지역기반/${ decodeURI( query.area ) }/${ decodeURI( item.slug ) }${ strQuery ? `?${ strQuery }` : '' }` }
                                        onClick={ e => handleCategory( e, decodeURI( item.slug ) ) }
                                        active={ decodeURI( item.slug ) === decodeURI( query.category ) }
                                    >
                                        { item.name }
                                    </Nav.item>
                                );
                            } ) }
                        </Nav>

                        <div className="tabs_panels">
                            <div className="shop_list_filter_wrap">
                                <Tags>
                                    <Tag active={ query.order === '' } onClick={ e => handleOrder( e, '' ) }>기본순</Tag>
                                    <Tag active={ query.order === 'review' } onClick={ e => handleOrder( e, 'review' ) }>후기순</Tag>
                                    <Tag active={ query.order === 'rating' } onClick={ e => handleOrder( e, 'rating' ) }>별점순</Tag>
                                </Tags>

                                <div className="filter_type_review">
                                    <Checkbox round label="후기이벤트" value="event" checked={ query.filter.indexOf( 'event' ) >= 0 } onChange={ handleFilter } />
                                    {/* <Checkbox round label="사진샵만" value="photo" checked={ query.filter.indexOf( 'photo' ) >= 0 } onChange={ handleFilter } />
                                    <Checkbox round label="바로결제" value="card" checked={ query.filter.indexOf( 'card' ) >= 0  } onChange={ handleFilter } /> */}
                                </div>
                            </div>

                            { ( !showLoading && posts.length > 0 ) && (
                                <>
                                    <div className="shop_list_wrap">
                                        { ( query.order === '' && query.filter.length === 0 && posts.filter( item => item.type === 'super' ).length > 0 ) && (
                                            <div className="shop_list_grade super">
                                                <HeaderList title="슈퍼리스트" tooltip="슈퍼리스트 추천 영역입니다" />
                                                <ul>
                                                { posts.filter( item => item.type === 'super' ).map( item => <ListItem key={ `${ item.type }-${ item.id }` } data={ item } isMobile={ isMobile } /> ) }
                                                </ul>
                                            </div>
                                        ) }

                                        { ( query.order === '' && query.filter.length === 0 && posts.filter( item => item.type === 'big' ).length > 0 ) && (
                                            <div className="shop_list_grade big">
                                                <HeaderList title="빅히트콜" tooltip="빅히트콜 추천 영역입니다" />
                                                <ul>
                                                { posts.filter( item => item.type === 'big' ).map( item => <ListItem key={ `${ item.type }-${ item.id }` } data={ item } isMobile={ isMobile } /> ) }
                                                </ul>
                                            </div>
                                        ) }

                                        { ( query.order === '' && query.filter.length === 0 && posts.filter( item => item.type === 'basic' ).length > 0 ) && (
                                            <div className="shop_list_grade basic">
                                                <HeaderList title="일반샵" tooltip="일반샵 추천 영역입니다" />
                                                <ul>
                                                { posts.filter( item => item.type === 'basic' ).map( item => <ListItem key={ `${ item.type }-${ item.id }` } data={ item } isMobile={ isMobile } /> ) }
                                                </ul>
                                            </div>
                                        ) }

                                        { ( query.order !== '' || query.filter.length > 0 ) && (
                                            <div className="shop_list_grade basic">
                                                <ul>
                                                {posts.map(item => <ListItem key={`${item.type}-${item.id}`} data={item} isMobile={isMobile} />)}
                                                </ul>
                                            </div>
                                        ) }

                                        { ( total_posts > 0 && posts.length < total_posts ) ? (
                                            <>
                                                <Separator />
                                                { moreLoading ? <Loading small /> : <div className="shop_list_more"><Button more size="medium" onClick={handleLoadMore}>샵 더보기</Button></div> }
                                            </>
                                        ) : (
                                            <div className="shop_search_guide">
                                                <p>고객님이 설정한 지역 내에서<br />샵이 노출됩니다</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) }

                            { ( !data || showLoading || ( posts.length === 0 && total_posts > 0 ) ) && (
                                <Loading />
                            ) }

                            { ( !showLoading && data && total_posts === 0 ) && (
                                <Character useMarginTop type="no_result_05" text={`근처에 샵이 없어요\n고객님이 설정한 지역 내에서\n샵이 노출됩니다`} />
                            ) }

                            <div className="shop_accordion_wrap">

                                <Accordion>
                                    <Accordion.Item type="title">
                                        <h2>{currentAreaName} {currentCategory.name} 정보</h2>
                                    </Accordion.Item>
                                    <Accordion.Item type="content">
                                        <div className="shop_accordion_item">
                                            <table className="shop_accordion_item_table">
                                                <tbody>
                                                    <tr>
                                                        <th>전체 업소 수</th>
                                                        <td>{total_posts}개</td>
                                                    </tr>
                                                    <tr>
                                                        <th>신규 업소 수</th>
                                                        <td>{parseInt(total_posts > 3 ? total_posts / 3 : total_posts)}개</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </Accordion.Item>
                                </Accordion>

                                <Accordion>
                                    <Accordion.Item type="title">
                                        <h2>자주 묻는 질문과 답변</h2>
                                    </Accordion.Item>
                                    <Accordion.Item type="content">
                                        <div className="shop_accordion_content single_content">
                                            <h6>사람들이 {query.area.replaceAll('-', ' ')}에서 검색하는 인기 서비스는 어떤게 있나요?</h6>
                                            <p>사람들은 {query.area.replaceAll('-', ' ')} 근처에서 다음을 검색 했습니다.</p>
                                            <ul className='ul-with-dot'>
                                                {category.map(cate => (
                                                    <li key={`${query.area}-${cate.name}`}>
                                                        <Link href={`/지역기반/${query.area}/${decodeURI(cate.slug)}`}>{`${query.area.replaceAll('-', ' ')} ${cate.name}`}</Link>
                                                    </li>
                                                ))}
                                            </ul>

                                            <h6>{currentCategory?.name || '마사지'}의 특징은 무엇인가요?</h6>
                                            <p>
                                                {currentCategory?.description || '마사지는 뷰티 및 헬스 활동과 같습니다. 스트레스를 없애고 정신적 안정감을 줍니다. 근육의 피로와 통증을 치료하고 이완상태를 만들어줍니다. 노폐물을 배출하여 붓기 및 혈액순환을 촉진시켜 줍니다. 면역력이 증진되고 신체 기능을 개선하여 노화방지에도 효과적입니다.'}
                                                <br/>
                                                <a href="/뭉치고-블로그/massage-types/" target="_blank" rel="noopnener">{currentCategory?.name || '마사지'}의 종류와 특징 자세히 알아보기</a>
                                            </p>
                                        </div>
                                    </Accordion.Item>
                                </Accordion>

                                {(Array.isArray(recommendAreas) && recommendAreas.length > 0) && (
                                    <Accordion>
                                        <Accordion.Item type="title">
                                            <h2>{currentAreaName} 근처의 {currentCategory.name}</h2>
                                        </Accordion.Item>
                                        <Accordion.Item type="content">
                                            <div className="shop_accordion_item">
                                                <ul className="column_harf">
                                                    {recommendAreas.map(item => (
                                                        <li key={item.id}>
                                                            <Link
                                                                href={ { pathname: router.pathname, query: { ...router.query, category: decodeURI( currentCategory?.slug ) } } }
                                                                as={ `/지역기반/${ decodeURI( item.slug ) }/${ decodeURI( currentCategory?.slug ) }` }
                                                            >
                                                                <a onClick={e => handleArea(e, decodeURI(item.slug))}>{item.name} {currentCategory?.name} 안내</a>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Accordion.Item>
                                    </Accordion>
                                )}

                                {(Array.isArray(areas) && areas.length > 0) && (
                                    <Accordion>
                                        <Accordion.Item type="title">
                                            <h2>전국 {currentCategory.name} 안내</h2>
                                        </Accordion.Item>
                                        <Accordion.Item type="content">
                                            <div className="shop_accordion_item">
                                                <ul className="column_harf">
                                                    {areas.map(item => (
                                                        <li key={item.id}>
                                                            <Link
                                                                href={ { pathname: router.pathname, query: { ...router.query, category: decodeURI( currentCategory?.slug ) } } }
                                                                as={ `/지역기반/${ decodeURI( item.slug ) }/${ decodeURI( currentCategory?.slug ) }` }
                                                            >
                                                                <a onClick={e => handleArea(e, decodeURI(item.slug))}>{item.name} {currentCategory?.name} 업체 모음</a>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Accordion.Item>
                                    </Accordion>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}


export const getServerSideProps = async ( { query } ) => {
    const category = await fetch( `${ WPURL }/components/category` ).then( res => res.json() );
    const areas = await fetch(`${WPURL}/components/area`).then(res => res.json());

    let newQuery = { order: '', filter: [] };

    for ( const [ key, value ] of Object.entries( query ) ) {
        newQuery = { ...newQuery, [ key ]: ( typeof value === 'string' ? decodeURI( value ) : value ), };
    }

    if ( ! query?.category && category.length > 0 ) {
        return {
            redirect: {
                destination: encodeURI(`/지역기반/${decodeURI(query.area)}/${decodeURI(category[0].slug)}/`),
                statusCode: 301,
            }
        }
        // newQuery = { ...newQuery, category: decodeURI( category[0].slug ) };
    }

    if ( typeof newQuery.filter === 'string' ) {
        newQuery.filter = [ newQuery.filter ];
    }

    if ( newQuery?.category && category.filter( item => newQuery.category === decodeURI( item.slug ) ).length > 0 ) {
        const { area: seoArea, category: seoCategory, count: seoCount, posts: seoPosts } = await fetch( `${ WPURL }/modules/shop/seo?${ queryString.stringify( newQuery, queryStringOptions ) }` ).then( res => res.json() );

        // 지역 정보를 찾을 수 없는 경우 404 에러 표시
        if (seoArea === false || seoCategory === false) {
            return { notFound: true };
        }

        const areaName = `${ ( seoArea.parent > 0 ? `${ seoArea.parentInfo.name } ${ seoArea.name }` : seoArea.name ) }`;
        // 지역명 3단어 이상이면 뒤에서 2단어까지만 표출
        const areaNameArr = areaName.split(' ');
        const newAreaName = ( ( areaNameArr.length > 2 ) ? ( `${areaNameArr[areaNameArr.length-2]} ${areaNameArr[areaNameArr.length-1]}` ) : areaName );

        const data = await fetch( `${ WPURL }/modules/shop/list?${ queryString.stringify( newQuery, queryStringOptions ) }` ).then( res => res.json() );

        const seoData = {
            title: `${newAreaName} ${seoCategory.name} 추천${seoCount > 0 ? ` Best ${seoCount}` : ''} - 뭉치고`.replace( /\s\s+/g, ' ' ),
            description: `${newAreaName} ${seoCategory.name} 추천${seoPosts.length > 0 ? ` - ${seoPosts.map(item => item.post_title).join(', ')}` : ''} - ${newAreaName} 주변 ${seoCategory.name}를 확인하세요`.replace( /\s\s+/g, ' ' ),
        };

        const schemaData = (parseInt(data?.total_posts) > 0 && Array.isArray(data?.posts) && data.posts.length > 0 ? data.posts.map(item => ({
            "@context": "http://schema.org",
            "@type": "LocalBusiness",
            "name": item.title,
            "description": "",
            "url": decodeURI(item.permalink),
            "image": decodeURI(item.thumbnail),
            "telephone": item.basic.phone,
            "priceRange": item.basic.price,
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "KR",
                "addressLocality": item.basic.map.address.split(" ")[0],
                "addressRegion": "",
                "postalCode": "",
                "streetAddress": item.basic.map.address.split(" ").filter((_, idx) => idx > 0).join(" "),
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": parseFloat(item.basic.map.lat),
                "longitude": parseFloat(item.basic.map.lng),
            },
        })) : []);

        return {
            props: { data, query: newQuery, category, seoData, newAreaName, areas, seoCount, seoCategory, schemaData }
        }
    }

    return { notFound: true };
}
