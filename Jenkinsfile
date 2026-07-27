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
                    sh 'docker build -t quickcart-product-order-service:latest .'
                }
                dir('payment-service'){
                    sh 'docker build -t quickcart-payment-service:latest .'
                }
                dir('frontend'){
                    sh 'docker build --build-arg REACT_APP_API_BASE_URL=${API_BASE_URL} -t quickcart-frontend:latest .'
                }
            }
        }
        stage('Deploy to Kubernetes'){
            steps{
                sh 'minikube image load quickcart-product-order-service:latest'
                sh 'minikube image load quickcart-payment-service:latest'
                sh 'minikube image load quickcart-frontend:latest'
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