pipeline {
    agent any
    environment {
        FIREBASE_TYPE = credentials('FIREBASE_TYPE')
        FIREBASE_PROJECT_ID = credentials('FIREBASE_PROJECT_ID')
        FIREBASE_PRIVATE_KEY_ID = credentials('FIREBASE_PRIVATE_KEY_ID')
        FIREBASE_PRIVATE_KEY = credentials('FIREBASE_PRIVATE_KEY')
        FIREBASE_CLIENT_EMAIL = credentials('FIREBASE_CLIENT_EMAIL')
        FIREBASE_CLIENT_ID = credentials('FIREBASE_CLIENT_ID')
        FIREBASE_AUTH_URI = credentials('FIREBASE_AUTH_URI')
        FIREBASE_TOKEN_URI = credentials('FIREBASE_TOKEN_URI')
        FIREBASE_AUTH_PROVIDER_X509_CERT_URL = credentials('FIREBASE_AUTH_PROVIDER_X509_CERT_URL')
        FIREBASE_CLIENT_X509_CERT_URL = credentials('FIREBASE_CLIENT_X509_CERT_URL')
    }
    stages {
         stage('Print Workspace') {
                steps {
                    script {
                        echo "Workspace: ${env.WORKSPACE}"
                    }
                }
            }
        stage('Checkout') {
            steps {
                // Git에서 소스 코드 체크아웃
                checkout scm
            }
        }
        stage('Build and Deploy') {
            steps {
                script {
                        // Docker Compose를 사용하여 이미지 빌드 및 서비스 배포
                        withEnv([
                            "FIREBASE_TYPE=${env.FIREBASE_TYPE}",
                            "FIREBASE_PROJECT_ID=${env.FIREBASE_PROJECT_ID}",
                            "FIREBASE_PRIVATE_KEY_ID=${env.FIREBASE_PRIVATE_KEY_ID}",
                            "FIREBASE_PRIVATE_KEY=${env.FIREBASE_PRIVATE_KEY}",
                            "FIREBASE_CLIENT_EMAIL=${env.FIREBASE_CLIENT_EMAIL}",
                            "FIREBASE_CLIENT_ID=${env.FIREBASE_CLIENT_ID}",
                            "FIREBASE_AUTH_URI=${env.FIREBASE_AUTH_URI}",
                            "FIREBASE_TOKEN_URI=${env.FIREBASE_TOKEN_URI}",
                            "FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL}",
                            "FIREBASE_CLIENT_X509_CERT_URL=${env.FIREBASE_CLIENT_X509_CERT_URL}"
                        ]) {
                            sh 'docker compose up --build -d'
                        }
                    
                }
            }
        }
    }
// post {
//     always {
//         // 파이프라인의 모든 단계가 완료된 후 실행, Docker Compose를 사용하여 생성된 서비스 정리
//         script {
//             sh 'docker-compose down'
//         }
//     }
// }
}
