@echo off
echo Building Tailwind CSS...
tailwindcss.exe -i src/input.css -o assets/css/app.css --minify
echo Done! Build output saved to assets/css/app.css.
pause
