
pipeline {

    agent {
        label 'lms-build'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    environment {
        // Backend URL used during the Vite production build
        VITE_BACKEND_URL = 'http://43.205.127.39:5000'

        // Nexus server IP
        NEXUS_HOST = '18.61.1.156'

        // Nexus Raw hosted repository
        NEXUS_REPOSITORY = 'lms-webapp-artifacts'
    }

    stages {

        // ==========================================
        // STAGE 1: CHECKOUT
        // ==========================================

        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm

                echo 'GitHub source code checkout completed.'

                sh '''
                    echo "Repository details"
                    git branch --show-current
                    git rev-parse --short=12 HEAD

                    echo ""
                    echo "Repository files"
                    ls -la
                '''
            }
        }

        // ==========================================
        // STAGE 2: VERIFY AGENT
        // ==========================================

        stage('Verify Agent') {
            steps {
                echo 'Checking the Jenkins execution agent.'

                sh '''
                    set -eu

                    echo "Hostname:"
                    hostname

                    echo ""
                    echo "Execution user:"
                    whoami

                    echo ""
                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Java:"
                    java -version

                    echo ""
                    echo "Git:"
                    git --version

                    echo ""
                    echo "CURL:"
                    curl --version | head -1

                    echo ""
                    echo "TAR:"
                    tar --version | head -1

                    echo ""
                    echo "Agent verification completed."
                '''
            }
        }

        // ==========================================
        // STAGE 3: INSTALL DEPENDENCIES AND BUILD
        // ==========================================

        stage('Install Dependencies and Build') {
            steps {
                nodejs(nodeJSInstallationName: 'Node-LMS') {

                    // IMPORTANT:
                    // Groovy assignments must be inside script {}

                    script {
                        env.NODE_VERSION = sh(
                            script: 'node --version',
                            returnStdout: true
                        ).trim()

                        env.NPM_VERSION = sh(
                            script: 'npm --version',
                            returnStdout: true
                        ).trim()
                    }

                    sh '''
                        set -eu

                        echo "===== NODE.JS ====="
                        node --version

                        echo ""
                        echo "===== NPM ====="
                        npm --version

                        echo ""
                        echo "===== VERIFY PROJECT ====="

                        test -f package.json
                        test -f package-lock.json
                        test -d src
                        test -d public

                        echo "Project structure verified."

                        echo ""
                        echo "===== INSTALL DEPENDENCIES ====="

                        npm ci --no-audit --no-fund

                        echo ""
                        echo "===== BUILD APPLICATION ====="

                        npm run build

                        echo ""
                        echo "===== VERIFY BUILD OUTPUT ====="

                        test -d dist
                        test -s dist/index.html

                        ls -lah dist

                        echo ""
                        echo "LMS APPLICATION BUILD COMPLETED."
                    '''
                }
            }
        }

        // ==========================================
        // STAGE 4: PACKAGE ARTIFACT
        // ==========================================

        stage('Package Artifact') {
            steps {
                script {
                    env.GIT_SHA = sh(
                        script: 'git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()

                    env.ARTIFACT_NAME =
                        "lms-academy-webapp-dev-b${BUILD_NUMBER}-${env.GIT_SHA}.tar.gz"
                }

                sh '''
                    set -eu

                    echo "===== PREPARE ARTIFACT ====="

                    rm -rf artifact-staging
                    mkdir -p artifact-staging

                    cp -a dist artifact-staging/

                    cat > artifact-staging/artifact-info.txt <<EOF
Application: LMS Academy WebApp
Repository: https://github.com/aseemfaras/lms-academey-webapp.git
Branch: dev
Build Number: ${BUILD_NUMBER}
Commit: ${GIT_SHA}
Job: ${JOB_NAME}
Build URL: ${BUILD_URL}
Node Version: ${NODE_VERSION}
NPM Version: ${NPM_VERSION}
Build Date UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

                    echo ""
                    echo "===== CREATE ARTIFACT ====="

                    tar -czf "$ARTIFACT_NAME" -C artifact-staging .

                    test -s "$ARTIFACT_NAME"

                    echo ""
                    echo "===== GENERATE SHA256 ====="

                    sha256sum "$ARTIFACT_NAME" > "$ARTIFACT_NAME.sha256"

                    echo ""
                    echo "===== ARTIFACT DETAILS ====="

                    ls -lh "$ARTIFACT_NAME"
                    cat "$ARTIFACT_NAME.sha256"

                    echo ""
                    echo "ARTIFACT PACKAGING COMPLETED."
                '''
            }
        }

        // ==========================================
        // STAGE 5: ARCHIVE IN JENKINS
        // ==========================================

        stage('Archive Artifact') {
            steps {
                archiveArtifacts(
                    artifacts: "${env.ARTIFACT_NAME},${env.ARTIFACT_NAME}.sha256,artifact-staging/artifact-info.txt",
                    fingerprint: true
                )

                echo 'Artifacts archived in Jenkins.'
            }
        }

        // ==========================================
        // STAGE 6: PUBLISH TO NEXUS
        // ==========================================

        stage('Publish to Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-lms-uploader',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )
                ]) {

                    sh '''
                        set +x
                        set -eu

                        echo "======================================"
                        echo "       NEXUS ARTIFACT PUBLISHING"
                        echo "======================================"

                        # Verify credentials
                        : "${NEXUS_USER:?Nexus username missing}"
                        : "${NEXUS_PASSWORD:?Nexus password missing}"

                        # Verify artifact files
                        test -s "$ARTIFACT_NAME"
                        test -s "$ARTIFACT_NAME.sha256"

                        # Nexus configuration
                        NEXUS_BASE_URL="http://${NEXUS_HOST}:8081/repository/${NEXUS_REPOSITORY}"

                        NEXUS_PATH="dev/build-${BUILD_NUMBER}"

                        DESTINATION="${NEXUS_BASE_URL}/${NEXUS_PATH}"

                        echo "Repository: ${NEXUS_REPOSITORY}"
                        echo "Destination: ${NEXUS_PATH}"
                        echo "Artifact: ${ARTIFACT_NAME}"

                        # Create temporary credentials file
                        umask 077

                        NETRC_FILE=$(mktemp)

                        trap 'rm -f "$NETRC_FILE"' EXIT

                        printf 'machine %s login %s password %s\\n' "$NEXUS_HOST" "$NEXUS_USER" "$NEXUS_PASSWORD" > "$NETRC_FILE"

                        echo ""
                        echo "===== UPLOAD APPLICATION ARTIFACT ====="

                        curl --fail --show-error --silent \
                            --netrc-file "$NETRC_FILE" \
                            --upload-file "$ARTIFACT_NAME" \
                            --write-out '\\nArtifact HTTP status: %{http_code}\\n' \
                            "${DESTINATION}/${ARTIFACT_NAME}"

                        echo ""
                        echo "Application artifact uploaded."

                        echo ""
                        echo "===== UPLOAD CHECKSUM ====="

                        curl --fail --show-error --silent \
                            --netrc-file "$NETRC_FILE" \
                            --upload-file "$ARTIFACT_NAME.sha256" \
                            --write-out '\\nChecksum HTTP status: %{http_code}\\n' \
                            "${DESTINATION}/${ARTIFACT_NAME}.sha256"

                        echo ""
                        echo "Checksum uploaded."

                        echo ""
                        echo "======================================"
                        echo " NEXUS PUBLISHING COMPLETED SUCCESSFULLY"
                        echo "======================================"
                    '''
                }
            }
        }
    }

    // ==========================================
    // POST BUILD ACTIONS
    // ==========================================

    post {

        success {
            echo 'LMS CI/CD Pipeline completed successfully.'
        }

        failure {
            echo 'LMS CI/CD Pipeline failed. Check the failed stage and console output.'
        }

        always {
            echo "Pipeline execution finished. Build number: ${BUILD_NUMBER}"
        }
    }
}
