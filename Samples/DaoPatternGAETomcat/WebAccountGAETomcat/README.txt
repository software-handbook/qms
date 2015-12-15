This sample demonstrates a Google App Engine Application can run on Tomcat.

How to run the source code from the Eclipse
=========================================
Use Eclipse with GAE plugin to import and run the project

How to pack the project
=========================================
Execute command:
ant dist
to compile and make file .war with ./dist folder

Then, deploy the .war file into the Tomcat to run it.

How to pack the entities and dao interfaces
=========================================
ant dist-daomanager

_____________________
Open-Ones