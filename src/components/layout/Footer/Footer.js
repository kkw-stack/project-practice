import React from 'react';

import { allCategory } from 'lib/ethan';

import { useRouter } from 'next/router';
import Link from 'next/link';

import Logo from 'components/ui/Logo/Logo';

import style from './Footer.module.css';

export default function Footer( props ) {

    const [ toggle, setToggle ] = React.useState( false );

    return (
        <div>
            <footer className={ style.footer }>
                <div className={ style.footer_inner }>
                    <div className={ `inner_wrap ${style.footer_top}` }>
                        <div>
                            <ul className={ style.footer_menu }>
                                <li>
                                    <Link href={`${ process.env.DOMAIN }/`}>
                                        <a>홈으로</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                    <Link href="/company" as="/회사소개">
                                        <a>회사소개</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                <Link href="/notice" as="/공지사항">
                                        <a>공지사항</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                    <Link href="/event" as="/이벤트">
                                        <a>이벤트</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                    <Link href="/blog" as="/뭉치고-블로그">
                                        <a>뭉치고 블로그</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                    <Link href="/terms/usage" as="/이용약관">
                                        <a className={ style.btn_terms }>이용약관</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li className={ style.menu_location }>
                                    <Link href="/terms/location" as="/위치기반서비스-이용약관">
                                        <a className={ style.btn_location_service }>위치기반서비스 이용약관</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li className={ style.menu_privacy }>
                                    <Link href="/terms/privacy" as="/개인정보처리방침">
                                        <a className={ style.btn_privacy_policy }>개인정보처리방침</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li className="inquiry">
                                    <Link href="/inquiry/form" as="/문의하기">
                                        <a className={ style.jt_login } rel="nofollow">1:1문의</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                    <Link href="/partnership" as="/제휴문의">
                                        <a className={ style.jt_login } rel="nofollow">제휴문의</a>
                                    </Link>
                                </li>
                                <li className={ style.menu_divider }>&nbsp;</li>
                                <li>
                                    <Link href={`/sitemap/area/${allCategory[0]}`}>
                                        <a>사이트맵</a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={ `inner_wrap ${style.footer_bottom}`}>
                        <button type="button" className={ `${style.footer_business_info_controler} ${toggle === true ? style.open : '' }` } onClick={ e => setToggle( ! toggle ) }>
                            <div className={ style.footer_logo }>
                                <Logo gray />
                            </div>
                            <span>자세히보기</span>
                        </button>

                        { ( toggle === true ) && (
                            <div className={ `${ style.footer_business_info } ${ style.samll_accodion_info }` }>
                                <ul>
                                    <li>사업자등록번호 : <span>783-51-00617</span></li>
                                    <li>메일 : <span><a href="mailto:joseph15370@gmail.com">joseph15370@gmail.com</a></span></li>
                                </ul>
                            </div>
                        ) }

                        <p className={ style.footer_message }>
                            뭉치고는 건전한 샵을 통해 누구나 마음 편한 힐링문화를 만들어나갑니다.<br/>
                            뭉치고는 서비스정보중개자이며 서비스제공의 당사자가 아닙니다. <br/>
                            따라서 뭉치고는 서비스정보 및 이용에 대한 책임을 지지 않습니다.
                        </p>
                        <p className={ style.copyright }>Moongchigo © { new Date().getFullYear() }</p>

                        <div className={ style.footer_sns }>
                            <ul>
                                <li className={ style.sns_instagram }><a href="https://www.instagram.com/moongchigo.official/" target="_blank" rel="noopener noreferrer">인스타그램 새창열기<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M8.49836 6.28076C7.23024 6.28076 6.15234 7.35866 6.15234 8.62678C6.15234 9.89489 7.23024 10.9728 8.49836 10.9728C9.76647 10.9728 10.8444 9.89489 10.8444 8.62678C10.8444 7.35866 9.76647 6.28076 8.49836 6.28076Z" fill="#999999"/> <path d="M11.4801 1.52539H5.58336C3.30075 1.52539 1.52539 3.30075 1.52539 5.51996V11.4167C1.52539 13.6993 3.30075 15.4747 5.58336 15.4747H11.4801C13.6993 15.4747 15.4747 13.6993 15.4747 11.4167V5.51996C15.4747 3.30075 13.6993 1.52539 11.4801 1.52539ZM8.50003 12.1776C6.47104 12.1776 4.8859 10.529 4.8859 8.56343C4.8859 6.59785 6.47104 4.8859 8.50003 4.8859C10.529 4.8859 12.1142 6.53445 12.1142 8.50003C12.1142 10.4656 10.529 12.1776 8.50003 12.1776ZM12.241 5.64677C11.7971 5.64677 11.4167 5.26633 11.4167 4.82249C11.4167 4.37865 11.7971 3.99822 12.241 3.99822C12.6848 3.99822 13.0652 4.37865 13.0652 4.82249C13.0652 5.26633 12.6848 5.64677 12.241 5.64677Z" fill="#999999"/> </svg> </a></li>
                                <li className={ style.sns_twitter }><a href="https://twitter.com/moongchigo_team" target="_blank" rel="noopener noreferrer">트위터 새창열기<svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M4.52081 10.826C9.46646 10.826 12.2056 6.71731 12.2056 3.14122C12.2056 2.98905 12.2056 2.91296 12.2056 2.76078C12.7382 2.38035 13.1947 1.92383 13.5752 1.39122C13.1186 1.61948 12.586 1.77165 12.0534 1.84774C12.586 1.54339 13.0425 1.01078 13.2708 0.326002C12.7382 0.63035 12.2056 0.858611 11.5969 1.01078C10.9882 0.478176 10.2273 0.173828 9.46646 0.173828C7.94472 0.173828 6.80341 1.39122 6.80341 2.83687C6.80341 3.06513 6.80341 3.21731 6.8795 3.44557C4.59689 3.36948 2.61863 2.30426 1.32515 0.63035C1.09689 1.08687 0.944718 1.54339 0.944718 1.99992C0.944718 2.91296 1.40124 3.74991 2.16211 4.20644C1.70559 4.20644 1.32515 4.05426 0.944718 3.90209C0.944718 5.19557 1.85776 6.26078 3.07515 6.56513C2.84689 6.64122 2.61863 6.71731 2.39037 6.71731C2.2382 6.71731 2.08602 6.71731 1.85776 6.64122C2.16211 7.70644 3.22733 8.46731 4.36863 8.54339C3.45559 9.22818 2.31428 9.6847 1.02081 9.6847C0.792544 9.6847 0.564283 9.6847 0.412109 9.6847C1.6295 10.3695 2.99907 10.826 4.52081 10.826Z" fill="#999999"/> </svg> </a></li>
                                <li className={ style.sns_facebook }><a href="https://www.facebook.com/moongchigo.official" target="_blank" rel="noopener noreferrer">페이스북 새창열기<svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fillRule="evenodd" clipRule="evenodd" d="M1.80969 7.10874V12.587H4.36471V7.18482H6.0931L6.54399 4.90222H4.36471C4.36471 4.90222 4.36471 3.837 4.36471 3.2283C4.36471 3.00004 4.43985 2.69569 4.81559 2.69569C5.34162 2.69569 6.01795 2.69569 6.01795 2.69569V0.413086C6.01795 0.413086 4.89074 0.413086 3.68838 0.413086C2.9369 0.413086 1.80969 1.40222 1.80969 2.54352C1.80969 3.68482 1.80969 4.90222 1.80969 4.90222H0.457031V7.18482L1.80969 7.10874Z" fill="#999999"/></svg></a></li>
                                <li className={ style.sns_youtube }><a href="https://www.youtube.com/channel/UCPs0YlhvdD0dbuvXESkguEA" target="_blank" rel="noopener noreferrer">유튜브 새창열기<svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clipPath="url(#clip0_5320_32868)"> <path d="M15.7913 2.1025C15.6168 1.44216 15.1014 0.924089 14.4464 0.749608C13.2573 0.42749 8.50066 0.42749 8.50066 0.42749C8.50066 0.42749 3.74137 0.42749 2.5549 0.746924C1.89993 0.924089 1.38454 1.44216 1.21006 2.09982C0.890625 3.29702 0.890625 5.78807 0.890625 5.78807C0.890625 5.78807 0.890625 8.27912 1.20737 9.47364C1.38185 10.134 1.89724 10.6521 2.55222 10.8265C3.73869 11.146 8.49798 11.146 8.49798 11.146C8.49798 11.146 13.2573 11.146 14.4437 10.8265C15.0987 10.6494 15.6141 10.1313 15.7886 9.47364C16.1053 8.27912 16.1053 5.78807 16.1053 5.78807C16.1053 5.78807 16.108 3.29702 15.7913 2.1025Z" fill="#999999"/><path d="M6.94336 8.0509V3.52515L10.9215 5.78803L6.94336 8.0509Z" fill="#DCDCDC"/></g><defs><clipPath id="clip0_5320_32868"><rect width="15.2174" height="10.7212" fill="white" transform="translate(0.890625 0.42749)"/></clipPath></defs></svg></a></li>
                                <li className={ style.sns_linkedin }><a href="https://www.linkedin.com/company/moongchigo" target="_blank" rel="noopener noreferrer">링크드인 새창열기<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.6826 3.99927H0.179688V11.9999H2.6826V3.99927Z" fill="#999999"/><path d="M11.7008 7.71037V12H9.19786V8.00062C9.19786 6.94894 9.07159 6.09705 7.84652 6.09705C6.62145 6.09705 6.49705 6.95083 6.49705 8.00062V12H3.99414V3.99935H6.49705V5.14338C6.874 4.31222 7.58643 3.78638 8.90385 3.78638C9.00562 3.78638 9.10363 3.79015 9.19786 3.7958C11.4576 3.92962 11.7008 5.62964 11.7008 7.71037Z" fill="#999999"/><path d="M2.86667 1.43239C2.86667 0.640806 2.22397 0 1.43239 0C0.640806 0 0 0.640806 0 1.43239C0 2.22397 0.640806 2.86478 1.43239 2.86478C2.22397 2.86478 2.86478 2.22397 2.86478 1.43239H2.86667Z" fill="#999999"/></svg></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
