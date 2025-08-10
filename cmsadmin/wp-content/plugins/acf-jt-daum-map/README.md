# Advanced Custom Field :: JT Daum Map

다음맵을 통해 주소와 위경도 값을 입력받는 커스텀 필드 입니다.


## API KEY 세팅

* [카카오 개발자 센터](https://developer.kakao.com/) 웹플랫폼 등록 후 플러그인 설치 도메인을 사이트 도메인으로 등록
* 'acf_jt_daum_api_key' 필터를 사용하여 API KEY 세팅
> add_filter( 'acf_jt_daum_api_key', function () { return 'YOUR-API-KEY'; } );


## 참고

* Advanced Custom Field 5 버전에서만 사용가능합니다.
* Google Map, JT Naver Map 과 데이터 구조가 같아서 Field Type 변경시 해당 Field Type 에 맞게끔 노출 됩니다.
* 도로명 주소가 있는 경우에는 도로명 주소를 기본으로 세팅합니다. 도로명 주소가 없는 경우 지번주소가 노출됩니다.
* 현재 studio-jt.co.kr 서브도메인에 대한 API KEY 가 제대로 동작하지 않습니다. 아마도 기존에 등록한 다른 서브도메인으로 인해 키충돌이 일어나는 듯 합니다.
* 카카오에선 서브도메인 마다 개별 등록해야 된다고는 하는데 서브도메인이 인증 실패가 뜨고 있습니다.


## 추가 개발 해야 할 것들

* 주소검색시 결과 리스트 처리 ( 현재는 가장 첫 주소데이터만 가져옵니다. )


## 참고 사이트

* [플러그인 개발 문서](https://www.advancedcustomfields.com/resources/creating-a-new-field-type/)
* [다음 지도 API](http://apis.map.daum.net/web/)
* [카카오 개발자 센터](https://developer.kakao.com/)