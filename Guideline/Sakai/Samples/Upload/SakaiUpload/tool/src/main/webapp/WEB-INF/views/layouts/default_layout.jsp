<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles"%>
<%@ taglib prefix="r" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ page session="false"%>
<!DOCTYPE html>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Default Home screen</title>

<tiles:insertAttribute name="css" flush="true"></tiles:insertAttribute>
<tiles:insertAttribute name="js" flush="true"></tiles:insertAttribute>
</head>
<body>
  

Hello World SpringMVC Homepage </br>
Current Site ID : ${currentSiteId} </br>
User Display Name : ${userDisplayName}



</body>
    <!-- /#wrapper -->
    <!-- jQuery -->

</html>


