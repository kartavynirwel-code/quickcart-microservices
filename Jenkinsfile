pipeline{
    agent any

    environment{
        DOCKER_CREDENTIALS = credentials('dockerhub')

    }

    stages{
        stage('Git Checkout'){
            steps{
                git branch: 'main', url: 'https://github.com/kartavynirwel-code/quickcart-microservices.git'
            }
        }
        stage('Docker Build'){
            steps{
                sh 'docker build -t quickcart-microservices /product-order-service'
                sh 'docker build -t quickcart-microservices /payment-service'
                sh 'docker build -t quickcart-microservices /frontend'
            }
        }
        stage('Docker Push'){
            steps{
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh 'docker push kartavynirwel/product-order-service'
                    sh 'docker push kartavynirwel/payment-service'
                    sh 'docker push kartavynirwel/frontend'
                }
    }
        }
    stage('Deploy to Kubernetes'){
        steps{
            sh 'kubectl apply -f k8s/manifests/*.yaml'
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