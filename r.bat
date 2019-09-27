@echo off
setlocal enableextensions
set TERM=
cd F:
C:\cygwin64\bin\bash.exe --login -i -c "cd \"$0\" ; exec bash"