A. Create sakai module with spring mvc
1. Create the folder to contain the sakai module.
Ex: D:\SakaiApp\

2. Change the working folder to D:\SakaiApp

3. Execute this command to generate source code for application
mvn archetype:generate -DarchetypeGroupId=org.sakaiproject.maven-archetype -DarchetypeArtifactId=sakai-spring-maven-archetype -DarchetypeVersion=1.2 -DarchetypeRepository=https://source.sakaiproject.org/maven2/

Then, answeer below questions:
Define value for property 'groupId': : m.k.s.sakaiapp
Define value for property 'artifactId': : HelloWorld
Define value for property 'version':  1.0-SNAPSHOT: : {Press Enter to accept the default value "1.0-SNAPSHOT"}
Define value for property 'package':  m.k.s.sakaiapp: : m.k.s.sakaiapp.helloworld

Confirm properties configuration:
groupId: m.k.s.sakaiapp
artifactId: HelloWorld
version: 1.0-SNAPSHOT
package: m.k.s.sakaiapp.helloworld
 Y: :  {Press Enter to confirm}
 
Now, the skeleton of the source code HelloWorld is generated at "D:\SakaiApp\HelloWorld".