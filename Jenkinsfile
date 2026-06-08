pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
        MONGO_URI = credentials('mongodb-atlas-uri')
        PORT = '5000'
    }

    stages {
        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Quality') {
            parallel {
                stage('Lint') {
                    steps {
                        bat 'npm run lint'
                    }
                }
                stage('Test') {
                    steps {
                        bat 'npm test'
                    }
                }
                stage('Build') {
                    steps {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('API Smoke Test') {
            steps {
                bat '''
                    start /B npm run start --workspace backend > backend-smoke.log 2>&1
                    powershell -NoProfile -Command "$ready = $false; for ($i = 0; $i -lt 30; $i++) { try { $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/health'; if ($response.status -eq 'ok') { $ready = $true; break } } catch {}; Start-Sleep -Seconds 2 }; if (-not $ready) { Get-Content backend-smoke.log; exit 1 }"
                '''
            }
        }
    }

    post {
        always {
            bat 'powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"'
            deleteDir()
        }
        success {
            echo 'Pipeline passed: install, lint, tests, build, and API smoke test.'
        }
    }
}
