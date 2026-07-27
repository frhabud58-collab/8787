@echo off
cd /d "%~dp0"
echo ============================================
echo  نشر قواعد Firebase Firestore
echo ============================================
echo.
echo سيتم فتح المتصفح لتسجيل الدخول إلى Google...
echo بعد تسجيل الدخول، سيتم نشر القواعد تلقائياً.
echo.
npx firebase login --no-localhost
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo فشل تسجيل الدخول. حاول مرة أخرى.
    pause
    exit /b 1
)
echo.
echo تم تسجيل الدخول بنجاح. جاري نشر القواعد...
npx firebase deploy --only firestore:rules
if %ERRORLEVEL% EQU 0 (
    echo.
echo ✅ تم نشر قواعد Firestore بنجاح!
) else (
    echo.
    echo ❌ فشل النشر. تأكد من اتصال الإنترنت وحاول مرة أخرى.
)
pause
