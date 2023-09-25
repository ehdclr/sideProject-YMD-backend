# YMD

## 1. 💪 프로젝트 개요

"구글 캘린더와 쓰레디를 모티브"로 만든 캘린더 기반 커뮤니티 플랫폼 API 프로젝트
- 기존에 사용하던 TODO LIST 어플 및 웹 앱은 친구들과 함께 일정을 공유하는 것이 아닌 자신의 일정 데이터만 공유가 가능했으며, 함께하기 기능 같은 기능이 없었음.
- 구글 캘린더는 일정 공유에 특화되어 있지만, 사용자들끼리 플랫폼 내에서 커뮤니케이션을 하기 어렵다고 생각


## 2. 🖥️ 기술 스택

- 프론트 : react,
- 백엔드 : nestjs, redis, postgresql, socket.io(추가예정), typeorm, elasticsearch(학습 중 | 추가 예정),docker, swagger
- 클라우드 및 인프라 :
  - dev 배포 환경 : aws apprunner, aws lightsail(redis upstash로 변경가능성 o), vpc , github, github actions, aws s3
  - prod 배포 환경 : aws ec2, aws rds, aws elasticache, aws opensearch(ELK 추가 후), aws vpc, aws codedeploy, github, github actions, aws s3
 
## 3. 👍 아키텍처


### prod 배포 설계
![image](https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/044cf370-2328-4a39-9078-10a2fb04443c)


### dev 배포 설계
![image](https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/77d1c759-f46e-44ba-aced-c6b4a28e0fb8)



## 4. 🔥 시퀀스 다이어 그램 (전체 흐름)
![image](https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/efed51fd-c3eb-4854-bac9-883ddb7431bd)


## 5. ➕ 시퀀스 다이어 그램 (디테일)
<details>
  <summary><h3>유저관련 API</h3></summary>
  <div markdown="1">
    <ul>
      <li>회원 가입</li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/08484d4d-c51b-4988-b98e-f16505860621" width=70%>
      <li> 이메일 및 전화번호 인증</li>
      <img src="(https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/44a841e0-2d33-4d5f-aa26-30cf355c32a8" width=70%>
      <li> 사용자 추가 회원가입 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/941299a0-9210-47aa-959f-dfd00509990b" width=70%>
      <li> 로그인</li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/fa3ecaea-5ee9-489e-8da3-bcab84722e44" width=70%>
      <li> oauth 로그인 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/1b963ef9-2759-4025-bda9-a25ffda52dfb" width=70%>
      <li> 로그아웃 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/921e78d0-11da-4ea2-a1fd-14aca5b15c0f" width=70%>
      <li> 팔로우 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/151226db-fcde-4513-b29d-2983df221b40" width=70%>
      <li> 팔로우 취소 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/1accc536-5415-4e2b-8661-8f8e2a3d897e" width=70%>
     </ul>
  </div>
</details>

<details>
  <summary><h3>게시물 API</h3></summary>
  <div markdown="1">
    <ul>
      <li> 게시물 생성</li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/a2efea6b-2caa-45a5-86d6-0d1bef07db09" width=70%>
      <li> 전체 게시물 가져오기 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/b1669834-4ba3-4164-844b-fb4b93cbe409" width=70%>
      <li> 게시물 디테일 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/a9553098-1d1e-4973-bfeb-5c41aff723b6" width=70%>
      <li> 게시물 수정하기</li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/6d61de94-de48-4ebf-b832-7fb76d7a4b39" width=70%>
      <li> 게시물 삭제하기 </li>
      <img src="https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/82fa4fe8-b9db-4e21-b745-26470ca64145" width=70%>
     </ul>
  </div>
</details>

## 6. 📒 프로젝트 고찰 및 문제점 해결방안

- Node.js 프레임워크인 DI 프레임워크인 Nest.js를 사용하여 확장이 쉬운 아키텍처로 구성
  - REST API
  - 협업을 위한 api문서 swagger
  - 데이터베이스 추상화 및 트랜잭션 일관성(typeorm queryRunner)을 위해 typeorm을 사용, postgresql과 연결

- aws S3 public에 대한 ddos 공격의 문제점 대두
  - 해결방안 : cloud front를 이용하여, ddos 공격에 대비 (추후 추가)


- dev 배포환경에서의 rds, ec2, elasticache를 통한 배포는 사이드 프로젝트의 과도한 비용
  - 해결방안 : aws apprunner를 통한 nestjs 서버 배포와 lightsail의 docker를 통하여 postgresql, redis 배포
  - 추가 문제점 : lightsail은 오토스케일링을 지원하지 않기 때문에 사용량이 많아지면, redis와 postgresql의 문제점 발생, apprunner 서울 리전 미지원
    - 이후 해결 방안 : prod 배포시 배포 환경 변화를 통한 확장이 가능한 aws 서비스 사용

- JWT accessToken과 refreshToken을 활용한 인증/인가 처리
  - 로그아웃 시 refreshToken을 redis에 버림으로써 악의적인 사용자가 사용못하도록 처리

- oauth 사용자와 local 사용자의 테이블 분리로 인한 트랜잭션 추가 발생 여부
  - 테이블을 통합, oauth와 local 사용자 구분을 위한 별도의 컬럼 추가
  - 1:1 관계의 사용자 정보 테이블 : 사용자 추가 정보를 위한 user_info 테이블을 도입하고, user 테이블과 1:1 관계를 구축. 이를 통해 데이터의 정확성과 쿼리의 효율성을 동시에 달성

- ci/cd
  - github과 github actions를 통해 aws ecr에 컨테이너 배포
  - jenkins와 k8s 추가 학습 예정

## 7. 📗 swagger https://app.swaggerhub.com/apis/ehdclr/ymd_api/1.0.0

### 7-1 api 명세서 
![image](https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/a174c434-5e31-46c5-a3de-ba46398fe02a)



## 8. 📃 ERD (추가 가능)
![image](https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/75599fb2-e3b0-4f04-be73-cab0494f246c)

## 9. 🟨 git commit convention
![image](https://github.com/ehdclr/sideProject-YMD-backend/assets/80464000/b747a83e-3333-403b-b0a5-8179b616b26b)
- gitmoji를 통한 commit 메시지 이모지 통합
