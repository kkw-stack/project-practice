<<<<<<< HEAD
This is a starter template for [Learn Next.js](https://nextjs.org/learn).

# 프로젝트 세팅 가이드
## git 프로젝트 클론
- private 프로젝트 초대 요청 필요
```
git clone https://github.com/studio-jt/client-moongchigo-next.git
```
## node modules 설치
```
npm install 또는 yarn
```
## hosts 설정 추가
- 관리자 권한으로 실행 필요
- 경로 : C:\Windows\System32\drivers\etc\hosts
- 추가 : 127.0.0.1 moongchigo.localhost
## ftp에서 워드프레스 소스파일 다운로드 ( 오픈서버 )
- 프로토콜 : SFTP
- 로그온 유형 : key file
- key file
- 워드프레스 경로 : /home/moongchigo/www/cmsadmin
- 클론 받은 디렉터리의 cmsadmin 폴더에 워드프레스 소스 다운로드(수 시간 소요)
- cmsadmin 디렉터리의 .htaccess 파일에서 아래 코드 확인
```
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /cmsadmin/
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /cmsadmin/index.php [L]
</IfModule>
```
## Apache 서버 설정
- wampserver 설치 : https://sourceforge.net/projects/wampserver/files/
- wampserver 실행
- 작업표시줄 wamp icon 좌클릭
- Apache > proxy 모듈 활성화 ( httpd.conf 파일 또는 Apache settings 탭에서 활성화 가능 )
```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```
- Apache > httpd-vhosts.conf : proxy 설정
  - ServerName : hosts로 설정한 moongchigo.localhost
  - {프로젝트 경로} : 클론받은 프로젝트 경로
  - 기존 파일 백업 권장
  ```
  <VirtualHost *:80>
      ServerName moongchigo.localhost
      
      ProxyPreserveHost on
      ProxyPass /cmsadmin !
      ProxyPass / http://localhost:3000/
      ProxyPassReverse / http://localhost:3000/
      
      alias /cmsadmin {프로젝트 경로}\cmsadmin
      
      DocumentRoot "{프로젝트 경로}"
      Options -Indexes
      ErrorLog "logs/laravel.localhost-error.log"
      CustomLog "logs/laravel.localhost-access.log" common
      
      <Directory "{프로젝트 경로}">
          AllowOverride All
          Require all granted
      </Directory>
  </VirtualHost>
  ```
## DB 설정
- DBMS 설치 : https://www.heidisql.com/download.php
- 백엔드 팀에게 뭉치고 dump 요청 ( 위에서 hosts 설정한 moongchigo.localhost로 dump 만들어달라고 요청 )
- 작업표시줄 wamp icon 좌클릭
- mariaDB > my.ini
  - port = 3306으로 변경 (여러개이니 일괄 수정 권장)
  - max_allowed_packet = 16M으로 변경
- HeidiSQL 접속
  - 네트워크 유형 : MariaDB or MySQL (TCP/IP)
  - Library: libmariadb.dll
  - 호스트명 : 127.0.0.1
  - 사용자/암호 : root/없음
  - 포트 : 3306
- 데이터베이스 생성
  - 이름 : jt_moongchigo
  - 조합 : utf8mb4_unicode_ci
  - 생성한 데이터 베이스 클릭
  - 파일 > SQL 파일 실행 (백엔드 팀에게 전달 받은 dump 파일)
  - 마지막 100% 쯤 나오는 에러창은 무시
- 프로젝트 파일 수정
  - .env
    - 없으면 생성
    ```
    NODE_ENV = development
    DOMAIN = http://moongchigo.localhost
    PORT = 3000
    ```
  - cmsadmin/wp-config.php
    ```
    DB_NAME : jt_moongchigo
    DB_USER : root
    DB_PASSWORD : (없음)
    DB_HOST : localhost
    DB_CHARSET : utf8mb4
    WP_HOME : http://moongchigo.localhost/cmsadmin
    WP_SITEURL : http://moongchigo.localhost/cmsadmin
    ```
## 프로젝트 실행
 - 프로젝트 디렉터리에서 npm run dev 또는 yarn dev
 - wampserver start/restart
 - front : http://moongchigo.localhost
 - admin : http://moongchigo.localhost/cmsadmin/wp-admin
## 유의사항
 - apache, db 설정 변경 후엔 wampserver restart
 - 프로젝트 세팅 후 변경사항 커밋리스트 전부 버리기

# 2022-07-13 이전
## Env Variable
### .env
```
NODE_ENV="{ development || production }"
DOMAIN="{ YOUR DEV DOMAIN }"
PORT="{ YOUR PORT }"
```

## Apache Conf

### httpd.conf
```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

### httpd-vhosts.conf
```
<VirtualHost *:80>
    ServerName moongchigo-next.localhost

    ProxyPreserveHost on
    ProxyPass /cmsadmin !
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    alias /cmsadmin D:\home\apm\moongchigo-next\cmsadmin

    DocumentRoot "D:\home\apm\moongchigo-next"
    Options -Indexes
    ErrorLog "logs/laravel.localhost-error.log"
    CustomLog "logs/laravel.localhost-access.log" common

    <Directory "D:\home\apm\moongchigo-next">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### .htaccess
```
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /cmsadmin/
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /cmsadmin/index.php [L]
</IfModule>
```

## 오픈 서버 배포
```
ec2-user > git pull // GIT 최근 소스 받기

root > npm install // 패키지 설치(필요시)

ec2-user > npm run build // 최근 소스 빌드

root > pm2 restart moongchigo // 서비스 재시작
```

## pm2 명령어
```
pm2 start ecosystem.config.js // node 서버 시작 :: 기존 세팅된 pm2 config 으로 실행

pm2 stop ecosystem.config.js // node 서버 중지 :: ecosystem.config.js 의 name 속성인 'moongchigo' 사용 가능

pm2 delete ecosystem.config.js // node 서버 삭제 :: ecosystem.config.js 의 name 속성인 'moongchigo' 사용 가능

pm2 restart ecosystem.config.js || pm2 reload ecosystem.config.js // node 서버 재실행 :: ecosystem.config.js 의 name 속성 'moongchigo' 사용가능

pm2 monit // 서버 모니터링

pm2 log moongchigo // 서버 로그 확인
```
=======
# project-practice
>>>>>>> fdacb9057941b1f379cb39c641677c6bd5d7ede7
