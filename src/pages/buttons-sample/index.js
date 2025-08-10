import React from 'react';

import { cookies } from 'lib/utils';

import Header from 'components/ui/Header/Header';
import ButtonCta from 'components/ui/ButtonCta/ButtonCta';
import Button from 'components/ui/Button/Button';
import Tooltip from 'components/ui/Tooltip/Tooltip';

export default function ButtonsSample( ) {

    const closeTooltip = () => {
        cookies.set('hide_info_tooltip','1',{ 'max-age': 2147483647 })
    }
    const showTooltip = (parseInt(cookies.get('hide_info_tooltip'))) ?  false : true;

    return (
        <>
        <Header useHome title="BUTTONS SAMPLE" />
        <div className="article sub_privacy view">
            <div className="article_body">
                <div className="privacy_box_wrap">
                    <div className="inner_wrap">
                        <h1 className="h1">BUTTON</h1>
                        <br />
                        <Button>후기를 남겨주세요</Button>
                        &lt;Button&gt;
                        <br />
                        <br />
                        <Button disabled>후기를 남겨주세요 (비활성화)</Button>
                        &lt;Button disabled&gt;
                        <br />
                        <br />
                        <Button outline>복사</Button>
                        &lt;Button outline&gt;
                        <br />
                        <br />
                        <Button seamless>로그인</Button>
                        &lt;Button seamless&gt;
                        <br />
                        <br />
                        <Button kakao>뭉치고 사장님 고객센터</Button>
                        &lt;Button kakao icon="kakao_channel"&gt;
                        <br />
                        <br />
                        <Button kakao outline>카카오로 쉬운 시작</Button>
                        &lt;Button kakao outline&gt;
                        <br />
                        <br />
                        <Button secondary size="medium">정보 수정요청</Button>
                        &lt;Button secondary size="medium"&gt;
                        <br />
                        <br />
                        <Button secondary outline size="medium">목록으로 돌아가기</Button>
                        &lt;Button secondary outline size="medium"&gt;
                        <br />
                        <br />
                        <Button inline>뭉치고 홈으로</Button><br />
                        &lt;Button inline&gt;
                        <br />
                        <br />
                        <Button secondary inline size="mini">주소찾기</Button><br />
                        &lt;Button secondary inline size="mini"&gt;
                        <br />
                        <br />
                        <br />
                        <br />
                        <h1 className="h1">CTA BUTTON</h1>
                        <br />
                        <ButtonCta>완료</ButtonCta>
                        &lt;ButtonCta&gt;
                        <br />
                        <br />
                        <ButtonCta disabled>완료 (비활성화)</ButtonCta>
                        &lt;ButtonCta disabled&gt;
                        <br />
                        <br />
                        <ButtonCta kakao>뭉치고 사장님 고객센터</ButtonCta>
                        &lt;ButtonCta kakao&gt;
                        <br />
                        <br />

                        <Tooltip arrowPos="bottom" show={showTooltip} onClose={closeTooltip}>슈퍼리스트 광고는 빅히트콜 영역에 한번 더 노출됩니다</Tooltip>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export const getServerSideProps = async () => {
    return {
        props: {},
    }
}
