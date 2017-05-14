How is this sample created?
-------------------------------------------------------
1) Install the project "https://github.com/thachln/sakai-spring-tiles-maven-archetype"
2) Execute the script
mvn archetype:generate -DarchetypeGroupId=org.sakaiproject.maven-archetype -DarchetypeArtifactId=sakai-spring-tiles-maven-archetype -DarchetypeVersion=1.3

Fill following configuration:
- Define value for property 'groupId': m.k.s.sakaiapp.upload
- Define value for property 'artifactId': SakaiUpload
- Define value for property 'version' 1.0-SNAPSHOT: : <Press Enter>
- Define value for property 'package' m.k.s.sakaiapp.upload: :<Press Enter>
...
-  Y: : <Press Enter>

3) cd SakaiUpload


4) Create script deploy.bat with following content:
@ECHO OFF

REM Fill your Tomcat Home of Sakai
SET TOMCAT_HOME=C:\jPackages\sakai11.3-tomcat-8.5.12
call mvn -Dmaven.tomcat.home=%TOMCAT_HOME% clean install sakai:deploy

ECHO Please copy manually these files...
ECHO %USERPROFILE%\.m2\repository\org\projectlombok\lombok\1.16.14\lombok-1.16.14.jar into %TOMCAT_HOME%\lib
ECHO Copy .\api\target\...api-x.y.jar into %TOMCAT_HOME%\lib

copy %USERPROFILE%\.m2\repository\org\projectlombok\lombok\1.16.14\lombok-1.16.14.jar  %TOMCAT_HOME%\lib\
copy .\api\target\*.jar %TOMCAT_HOME%\lib

5) Start the Tomcat of Sakai

6) Add the tool "SakaiUpload-tool" into your site to explore it.

Now, you have developed the first version of Upload application (it is called "tool" in Sakai) for Sakai 11.3.

Contact: 
Thach N. Le
Email: ThachLN@mks.com.vn