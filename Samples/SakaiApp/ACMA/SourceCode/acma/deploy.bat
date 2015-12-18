# Change to value of environment variable "SAKAI_HOME" to match with your environment
SET SAKAI_HOME=D:/jPackages/sakai-base-demo-10.5
mvn -Dmaven.tomcat.home=%SAKAI_HOME% clean install sakai:deploy 
