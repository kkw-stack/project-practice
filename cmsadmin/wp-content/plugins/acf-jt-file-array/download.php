<?php
try {
    $root = (isset( $_SERVER['CONTEXT_DOCUMENT_ROOT'] ) && ! empty( $_SERVER['CONTEXT_DOCUMENT_ROOT'] ) ? $_SERVER['CONTEXT_DOCUMENT_ROOT'] : $_SERVER['DOCUMENT_ROOT'] );

    if ( ! empty( $root ) && file_exists( $root . '/cmsadmin/wp-load.php' ) ) {

        require_once $root . '/cmsadmin/wp-load.php';

        if (
            isset( $_REQUEST['post_id'] ) && intVal( $_REQUEST['post_id'] ) > 0 &&
            isset( $_REQUEST['label'] ) && ! empty( $_REQUEST['label'] ) &&
            isset( $_REQUEST['values'] ) && ! empty( $_REQUEST['values'] ) && ! empty( explode( '||', $_REQUEST['values'] ) )
        ) {
            require_once __DIR__ . '/classes/class-pclzip.php';

            ini_set( 'memory_limit', '2048M' );
            set_time_limit( 0 );

            $post_id = intVal( $_REQUEST['post_id'] );
            $label = $_REQUEST['label'];
            $tmp_dir = sys_get_temp_dir();
            $file_list = array();

            // tmp 로 파일 명 변경및 복사
            foreach ( explode( '||', $_REQUEST['values'] ) as $idx => $tmp_item ) {
                $new_file = sprintf( '%s/%s_%s.%s', $tmp_dir, $label, $idx, pathinfo( $tmp_item )['extension'] );
                if ( copy( $root . $tmp_item, $new_file ) ) {
                    $file_list[] = $new_file;
                }
            }

            $zip_path = sprintf( '%s/%s_%s.zip', $tmp_dir, $post_id, $label );

            $zipfile = new PclZip( $zip_path );

            // 압축파일 생성
            $zipfile->create($file_list, PCLZIP_OPT_REMOVE_ALL_PATH);

            if ( $zipfile->errorCode() == '0' ) {
                // 파일 정보
                $path_parts = pathinfo( $zip_path );
                $filename = $path_parts['basename'];

                if ( class_exists( 'Normalizer' ) ) {
                    if ( Normalizer::isNormalized( $filename, Normalizer::FORM_D ) ) {
                        $filename = Normalizer::normalize( $filename, Normalizer::FORM_C );
                    }
                }

                // 파일 내려받기
                header( 'Content-Type: application/zip' );
                header( 'Content-Disposition: attachment; filename=' . urlencode( pathinfo( $zip_path )['basename'] ) );
                header( 'Content-Transfer-Encoding: binary' );
                header( 'Content-Length: ' . filesize( $zip_path ) );
                header( 'Pragma: public' );
                header( 'Expires: 0' );

                ob_clean();
                flush();
                readfile( $zip_path );

                // tmp 폴더내의 생성한 파일들 삭제
                foreach ( $file_list as $file_item ) unlink( $file_item );
                unlink( $zip_path );
            }
        }
    }
} catch ( Exception $e ) {
    echo '파일 다운로드 중 오류가 발생했습니다';
}
