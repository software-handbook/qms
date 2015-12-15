This text notes how to build this folder.

Copy OpenCV-2.4.6.0\opencv\build\include to Libraries\opencv\include
Copy OpenCV-2.4.6.0\opencv\build\x86\vc10\bin\*d.dll to ..\Libraries\opencv\Debug\Win32
Copye OpenCV-2.4.6.0\opencv\build\x86\vc10\lib\*d.lib to ..\Libraries\opencv\Debug\Win32

Setting Project (All Configuration):
+ Post-Build Event
copy /Y "$(SolutionDir)\Libraries\opencv\$(Configuration)\$(Platform)\*.dll" "$(SolutionDir)$(Configuration)\$(Platform)\"
