@echo off
REM Run Auth Service
start "Auth Service" cmd /k "cd /d %~dp0auth-service && npm start"

REM Run Customer Service
start "Customer Service" cmd /k "cd /d %~dp0customer-service && npm start"

REM Run Order Service
start "Order Service" cmd /k "cd /d %~dp0order-service && npm start"

REM Run Tailor Dashboard Service
start "Tailor Dashboard Service" cmd /k "cd /d %~dp0tailor-dashboard-service && npm start"

REM Run Review Service
start "Review Service" cmd /k "cd /d %~dp0review-service && npm start"

REM Run Notification Service
start "Notification Service" cmd /k "cd /d %~dp0NotificationService && npm start"

REM Run Chat Service
start "Chat Service" cmd /k "cd /d %~dp0chat-service && npm start"

REM Run API Gateway
start "API Gateway" cmd /k "cd /d %~dp0api-gateway && npm start"

echo All backend services are starting in separate windows.