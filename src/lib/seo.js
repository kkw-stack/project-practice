import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { decode } from 'html-entities';

const seoData = {
    '/': { title: '뭉치고: 내주변 스웨디시 1인샵 왁싱 로미로미 홈타이 마사지', description: '뭉치고에서 최고의 스웨디시, 1인샵, 왁싱, 로미로미, 홈타이, 타이마사지, 중국마사지, 스포츠마사지, 아로마 마사지, 에스테틱 등에 대한 사용자 후기 및 추천을 받아보세요.' },
    '/company': { title: '회사소개 | 뭉치고', description: '뭉치고 팀은 혁신을 지속합니다. 뭉치고는 우리동네 다양한 샵 정보를 쉽게 찾아주는 모바일 플랫폼입니다. 건전한 샵을 통해 누구나 마음 편한 힐링문화를 만들어나갑니다. 우리동네 소상공인과 이웃들을 연결하는 지역생활 커뮤니티 서비스로 성장하겠습니다. 이웃끼리 교류하고 소통하는 따뜻한 지역 생활정보 플랫폼으로 성장하는 게 목표입니다.' },
    '/terms/usage': { title: '이용약관 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/terms/location': { title: '위치기반서비스 이용약관 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/terms/privacy': { title: '개인정보처리방침 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/terms/personal': { title: '개인정보 수집 및 이용 | 회원가입 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/menu': { title: 'My 뭉치고 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/member/login': { title: '로그인 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/member/regist': { title: '회원가입 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/member/profile': { title: '내 정보 수정 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/member/withdraw': { title: '회원탈퇴 | 내 정보 수정 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/search': { title: '검색 | 뭉치고', description: '뭉치고 검색에서 다양한 샵 정보와 유용한 컨텐츠를 찾아보세요.' },
    '/review/[author]': { title: '사용자 후기 모아보기 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/zzimlist': { title: '찜한샵 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/review': { title: '후기관리 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/inquiry/form': { title: '1:1문의 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/inquiry/list': { title: '나의 문의내역 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/inquiry/[slug]': { title: '문의내역 상세 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/partnership': { title: '제휴문의 | 뭉치고', description: '사장님, 샵을 운영하고 계신가요? 동네 주민들에게 홍보해보세요. 무료광고도 가능합니다.' },
    '/partnership/calculator': { title: '계산기 | 제휴문의 | 뭉치고', description: '사장님, 샵을 운영하고 계신가요? 동네 주민들에게 홍보해보세요. 무료광고도 가능합니다.' },
    '/partnership/form': { title: '제휴신청하기 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/partnership/[slug]': { title: '입금안내 | 제휴신청하기 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/notice': { title: '공지사항 | 뭉치고', description: '뭉치고 공지사항을 알려드립니다.' },
    '/event': { title: '이벤트 | 뭉치고', description: '뭉치고 이벤트를 알려드립니다.' },
    '/blog': { title: '블로그 | 뭉치고', description: '뭉치고 블로그에서 우리동네의 다양한 샵을 소개해드립니다.' },
    '/location': { title: '위치설정 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
    '/404': { title: '오마이갓 | 뭉치고', description: '여기를 눌러 링크를 확인하세요.' },
};

export default function getHeader( passedData = {} ) {
    const router = useRouter();
    const data = {
        title: '뭉치고 | 1등 힐링정보 플랫폼',
        description: '뭉치고는 마사지, 왁싱, 피부관리 등 우리동네 다양한 샵 정보를 제공합니다. 뭉치고에서 동네 주민이 남긴 진짜 후기를 확인해보세요!',
        keywords: '뭉치고, 마사지, 타이마사지, 중국마사지, 프랜차이즈, 왁싱, 스포츠마사지, 아로마, 경락·딥티슈, 1인샵, 스웨디시, 수면가능, 스파·사우나, 피부관리, 24시간, 한국인 마사지, 단체·커플, 홈케어, 체형관리, 여성전용',
        image: process.env.DOMAIN + require( 'public/images/og/og-default.jpg' ),
    };

    const resData = { ...data, ...( seoData?.[ router.pathname ] ? seoData[ router.pathname ] : {} ), ...passedData };
    const excPaths = [
        '/shop/[slug]',
        '/sitemap/area/[category]',
        '/sitemap/metro/[category]'
    ]
    const canonical = (
        excPaths.includes( router.pathname ) ?
        `${process.env.DOMAIN}${router.asPath.split('?')[0]}` :
        `${process.env.DOMAIN}${router.asPath.split('#')[0].replace('amp', '').replace(/^\/|\/+$/g, '/')}`.replace(/\/+$/g, '/')
    );
    const decodeHTMLEntities = value => decode(value);

    return (
        <Head>
            <title>{ decodeHTMLEntities(resData.title) }</title>
            <meta name="description" content={ decodeHTMLEntities(resData.description) } />
            {/* <meta name="keywords" content={ decodeHTMLEntities(resData.keywords) } /> */}

            <meta property="og:site_name" content="뭉치고" />
            <meta property="og:url" content={ process.env.DOMAIN + router.asPath } />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={ decodeHTMLEntities(resData.title) } />
            <meta property="og:description" content={ decodeHTMLEntities(resData.description) } />
            <meta property="og:image" content={ resData.image } />

            <meta name="twitter:title" content={ decodeHTMLEntities(resData.title) } />
            <meta name="twitter:description" content={ decodeHTMLEntities(resData.description) } />
            <meta name="twitter:image" content={ resData.image } />

            <link rel="canonical" href={canonical} />
        </Head>
    );
}
