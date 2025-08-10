import React from 'react';

export default function AmpPost( props ) {
    const data  = props.data;
    const headerTitle  = props.headerTitle;
    const backUrl  = props.headerBackUrl;
    const startTime = props.useEvent ? props.useEvent[0] : '';
    const endTime = props.useEvent ? props.useEvent[1] : '';

    return (
        <>
            <style jsx global>{`
                 html { overscroll-behavior: none; overflow-y: scroll; }
                 body { font-family: sans-serif;}
                 html, body, a:focus {  -webkit-tap-highlight-color: rgba(0,0,0,0);}
                .home_button { display: block; width: 35px; height: 35px; line-height: 35px; text-align: center; position: absolute; top: 15.5px; left: 9px; z-index: 550; cursor: pointer; text-decoration:none }
                .sr_only { position: absolute; height: 1px; width: 1px;  overflow: hidden; clip: rect(1px, 1px, 1px, 1px); }
                .article_content  { letter-spacing: -0.025em; padding-bottom: 40px }
                .article_content h1,
                .article_content h2 { margin-bottom: 8px }
                .article_content h1 {  font-size: 24px }
                .article_content h2 {  font-size: 20px }
                .article_content h3 {  font-size: 18px;}
                .article_content h4,
                .article_content h5 { font-size: 16px; margin-bottom: 8px; }
                .article_content h6 { font-size: 15px; margin-bottom: 8px; }
                .article_content p { margin-top: 11px; margin-bottom: 24px; font-size: 15px; color: #666; line-height: 1.7; }
                .article_content b { font-weight: 700 }
                .article_content a {  word-break: break-all; }
                .article_content a:not(.jt_btn_basic) { color: #3cc1bd; border-bottom: 1px solid #3cc1bd; transition: all 300ms; text-decoration: none; }
                .article_content ul:not(.jt_gallery) {  margin-bottom: 20px; padding-left: 0; list-style: none; }
                .article_content ul:not(.jt_gallery) li { position: relative; margin-bottom: 3px; font-size: 15px; line-height: 1.6; letter-spacing: -0.025em; color: #666; }
                .article_content ul:not(.jt_gallery) li:last-child { margin-bottom: 0 }
                .article_content ul:not(.jt_gallery) li { padding-left: 10px }
                .article_content ul:not(.jt_gallery) li:before { content: ""; display: block; width: 4px; height: 4px; position: absolute; top: 9px; left: 0; background: #666; border-radius: 50% }
                .article_content > *:first-child { margin-top: 19px }
                .article_content > *:last-child { margin-bottom: 0 }
                .article_content figure { margin-left: auto; margin-right: auto; display: block; text-align: center;}
                .article_content figcaption {font-size: 14px; color: #666;}
                .article_content img {  width:100%; max-width: 100%;  height: auto; border-radius:8px;}
                .article_content strong {background: rgba(42,193,188,.2); font-weight:normal;}
                .article_content em {font-style:normal;}
                .article_attachments {padding-bottom: 40px; font-size: 15px;}
                .article_attachments a {color: #666; margin-left: 10px;text-decoration: none; letter-spacing: -0.025em;}

                .article_content .amp-carousel-button {width:40px; height:40px; margin: 0; background: rgba(255,255,255,0.9); background-position:center center; background-repeat:no-repeat; background-size: 7px 9px;}
                .article_content .amp-carousel-button-next {border-radius: 30px 0 0 30px; background-image:url(/images/amp/icon-direct-right.svg);}
                .article_content .amp-carousel-button-prev {border-radius: 0 30px 30px 0; background-image:url(/images/amp/icon-direct-left.svg);}
                
            `}</style>

            <style jsx>{`
                .wrap { background : #e5e5e5;}
                .container{ margin:0 auto;min-height:100vh; max-width:500px;background:#fff}
                .header{ width: 100%; background: #fff; height: 62px; box-shadow: 0px 2px 3px 0px rgb(0, 0, 0, 0.05); overflow: hidden; position: fixed;  z-index: 999;  max-width: 500px;}
                .header_title { color: #222; font-size: 16px; font-weight: 700; letter-spacing: -0.025em; text-align: center; line-height: 1; padding: 24px 20px 20px 18px; text-overflow: ellipsis; white-space: nowrap; word-wrap: normal; width: calc(100% - 100px); margin: 0 auto; overflow: hidden;}

                .event_period {margin:0; padding-top: 6px; font-size: 13px; line-height: 1; color: #aaa; }
                .event_period b { padding-right: 7px; margin-right: 6px; font-size: 13px; font-weight:700 letter-spacing: -0.025em; color: #2AC1BC; display: inline-block; position: relative}
                .event_period b:before { width: 1px; height: 7px; background: #ddd; content: ""; display: block; position: absolute; right: 0; top: 50%; margin-top: -4px}
                .button { text-align:center; margin: 0 0 50px; background: transparent; color: #999; border: 1px solid #ddd; font-weight: 400; width: 100%; border-radius: 8px; text-decoration: none; box-sizing: border-box; display: block; padding: 11px 16px 12px; font-size: 16px; letter-spacing:-0.025em; }
                .button:first-child {margin-top:34px;}
                .article{padding-left:16px; padding-right:16px; padding-top: 62px;}
                .article_body:after { clear:both; display:table; content:""}
                .article_header{ padding-top: 24px; padding-bottom: 21px; border-bottom: 1px solid #ddd;  }
                .article_header_title{margin:0; font-size: 18px; font-weight: 700; line-height: 1.5; letter-spacing: -0.025em; color: #222;}
                .article_header_date{  font-size: 13px;  color: #aaa; padding-top:3px; display:block;}
                .article_content{  padding-bottom: 34px;}
            `}</style>
            <div className="wrap">
                <div className="container">
                    <header className="header">
                        <a class="home_button" href="/">
                            <span class="sr_only">홈으로 이동</span>
                            <svg width="20" height="18" viewBox="0 0 20 18" fill="#222">
                                <path d="M18.9988 7.5L10.6988 0.5C10.2988 0.2 9.69878 0.2 9.39878 0.5L1.09878 7.5C0.69878 7.9 0.59878 8.5 0.99878 8.9C1.39878 9.3 1.99878 9.4 2.39878 9L3.09878 8.5V16.7C3.09878 17.3 3.49878 17.7 4.09878 17.7H16.0988C16.6988 17.7 17.0988 17.3 17.0988 16.7V8.4L17.6988 9C17.8988 9.2 18.0988 9.2 18.2988 9.2C18.5988 9.2 18.8988 9.1 19.0988 8.8C19.4988 8.5 19.3988 7.8 18.9988 7.5ZM14.9988 15.7H4.99878V6.8L9.99878 2.6L14.9988 6.8V15.7Z" fill="#222222"/>
                            </svg>
                        </a>
                        <div className="header_title">{headerTitle}</div>
                    </header>
                    <div className="article">
                        <div className="article_header">
                            <div className="article_header_inner">
                                <h1 className="article_header_title">{data.title || '제목이 없습니다'}</h1>
                                { props.useEvent ? (
                                    <p className="event_period">
                                        <b>이벤트 기간</b>
                                        <span>
                                            {startTime}
                                            {endTime && ` ~ ${endTime}`}
                                        </span>
                                    </p>
                                ) : (
                                    <time className="article_header_date">{ props.pubtime }</time>
                                ) }

                            </div>
                        </div>
                        <div className="article_body">
                            { ( data.content.length > 0 ) && (
                                <div className="article_content" dangerouslySetInnerHTML={ { __html: data.content[0] } }></div>
                            )}
                            { ( data.attachment.length > 0 ) && (
                                <div className="article_attachments">
                                    <div className="download_list">
                                        <b>첨부파일</b>
                                        { data.attachment.map( ( item, idx ) => {
                                            return (
                                                <a key={ idx } href={ item.file_url } download={ item.file_name }>{ item.file_name }</a>
                                            );
                                        } ) }
                                    </div>
                                </div>
                            ) }
                            { backUrl && (
                            <a href={backUrl} className="button">
                                <span className="button_inner">
                                    <span className="button_text">목록으로 돌아가기</span>
                                </span>
                            </a>
                            ) }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}