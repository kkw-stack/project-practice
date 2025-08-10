<?php
function jt_send_kakao( $post_id, $template, $is_scheduled = false ) {
    global $wpdb;

    $post = get_post( $post_id );
    $interval = 3;

    $template_code = array(
        'START'         => 'SJT_065406',
        'END'           => 'SJT_065409',
        'DDAY'          => 'SJT_065407',
        'PARTNERSHIP'   => 'SJT_074987',
    );

    if ( $post && isset( $template_code[ $template ] ) && ! empty( $template_code[ $template ] ) ) {
        $msg = '';
        $target = '';

        if ( in_array( $template, array( 'START', 'END', 'DDAY' ) ) ) { // 광고 처리
            if ( get_field( 'shop_user', $post_id ) ) {
                $target = get_field( 'shop_ad_user_phone', $post_id );
                $period = get_field( 'shop_ad_period', $post_id );
                $now = strtotime( date_i18n( 'Y-m-d H:i:s' ) );

                if ( $template == 'START' ) {  // 광고 시작
                    $msg = implode( PHP_EOL, array(
                        '사장님, 광고가 시작되었습니다 ',
                        '광고를 꼭 확인해주세요!',
                        '',
                        sprintf( '광고기간 : %s ~ %s. 11am', date( 'm.d', strtotime( $period['start'] ) ), date( 'm.d', strtotime( $period['end'] ) ) ),
                    ) );
                } elseif ( $template == 'END' ) { // 광고 종료
                    $msg = implode( PHP_EOL, array(
                        '사장님, 광고가 종료되었습니다',
                        '광고연장 시, 꼭 연락주세요!',
                        '',
                        sprintf( '종료일 : %s. 11am', date_i18n( 'Y.m.d' ) ),
                    ) );
                } elseif ( $template == 'DDAY' ) { // 광고 종료 D-3 ( 슈퍼리스트, 빅히트콜 )
                    $msg = implode( PHP_EOL, array(
                        sprintf( '사장님, 광고 종료일이 %d일 남았습니다', $interval ),
                        '광고연장 시, 꼭 연락주세요!',
                        '',
                        sprintf( '종료일 : %s. 11am', date( 'Y.m.d', strtotime( date_i18n( 'Y-m-d' ) . ' +' . $interval . ' days' ) ) ),
                    ) );
                }
            }
        } elseif ( $template == 'PARTNERSHIP' ) { // 제휴문의
            $config = get_field( 'partnership_config', 'option' );
            $partnership_data = get_field( 'partnership_data', $post_id );

            if ( $partnership_data['ad']['type'] != '일반샵' || 1) {
                $target = $partnership_data['ceo']['phone'];

                $msg = implode( PHP_EOL, array(
                    '사장님, 제휴신청이 완료되었습니다',
                    '관리자 확인 후, 샵이 등록되오니 입금 후 아래 정보를 꼭 알려주세요!',
                    '',
                    sprintf( '(%s)', $partnership_data['ad']['type'] ),
                    '샵 이름, 닉네임, 입금일, 입금자명, 입금액',
                    '',
                    '(입금안내)',
                    sprintf( '● 입금액 : %s원', $partnership_data['ad']['price']['result'] ),
                    sprintf( '● %s %s', $config['bank']['bank'], $config['bank']['account'] ),
                    sprintf( '● 예금주 : %s', $config['bank']['name'] ),
                ) );
            }
        }

        if ( $msg && $target && preg_match( '/^(01[016789])-?[0-9]{3,4}-?[0-9]{4}$/', $target ) ) {
            $data = array(
                'msg_type'        => 6,
                'dstaddr'         => str_replace( '-', '', $target ),
                'callback'        => str_replace( '-', '', get_field( 'kakao_calling_number', 'option' ) ),
                'stat'            => 0,
                'subject'         => '뭉치고',
                'text'            => $msg,
                'text2'           => $msg,
                'request_time'    => date( 'Y-m-d H:i:s' ), // Server 시간 기준으로 발송되기 때문에 date_i18n 사용금지
                'k_template_code' => $template_code[ $template ],
                'k_next_type'     => 0,
                'sender_key'      => '4485e6556b69f4f61dcf2bb1ea7b7381a5656893',
                'k_attach'        => '{ "attachment":{ "button":[]} }',
            );

            $result = $wpdb->insert( 'msg_queue', $data );

            $wpdb->insert( 'jt_kakao_log', array(
                'post_id'       => $post_id,
                'target'        => str_replace( '-', '', $target ),
                'template'      => $template,
                'result'        => $result ? 'Y' : 'N',
                'is_scheduled'  => $is_scheduled ? 'Y' : 'N',
                'request'       => $data['request_time'],
            ) );

            return ( $result ? true : false );
        }
    }

    return false;
}
