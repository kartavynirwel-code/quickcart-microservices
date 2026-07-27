pipeline{
    agent any

    environment {
        API_BASE_URL = 'http://localhost:30081'
    }

    stages{
        stage('Git Checkout'){
            steps{
                git branch: 'main', url: 'https://github.com/kartavynirwel-code/quickcart-microservices.git'
            }
        }
        stage('Docker Build'){
            steps{
                dir('product-order-service'){
                    sh 'docker build -t quickcart-product-order-service:${BUILD_NUMBER} .'
                }
                dir('payment-service'){
                    sh 'docker build -t quickcart-payment-service:${BUILD_NUMBER} .'
                }
                dir('frontend'){
                    sh 'docker build --build-arg REACT_APP_API_BASE_URL=${API_BASE_URL} -t quickcart-frontend:${BUILD_NUMBER} .'
                }
            }
        }
        stage('Deploy to Kubernetes'){
            steps{
                sh'sed -i "s/quickcart-product-order-service:.*/quickcart-product-order-service:${BUILD_NUMBER}/" k8s/manifests/product-order-deployment.yaml'
                sh'sed -i "s/quickcart-payment-service:.*/quickcart-payment-service:${BUILD_NUMBER}/" k8s/manifests/payment-deployment.yaml'
                sh'sed -i "s/quickcart-frontend:.*/quickcart-frontend:${BUILD_NUMBER}/" k8s/manifests/frontend-deployment.yaml'
                sh 'kubectl apply -f k8s/manifests/'
            }
        }
    }

    post{
        success{
            echo 'Pipeline completed successfully!'
        }
        failure{
            echo 'Pipeline failed!'
        }
        always{
            sh 'docker logout'
        }
    }
}