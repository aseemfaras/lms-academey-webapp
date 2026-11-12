pipeline {

    agent {
        label 'lms-build'
    }

    stages {

        stage('First Stage') {

            steps {

                echo 'Hello from Jenkins Pipeline'

            }

        }

        stage('Agent Information') {

            steps {

                sh 'hostname'

                sh 'whoami'

                sh 'java -version'

            }

        }

    }

}
