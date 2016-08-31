<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ page session="false" %>
<html>
<head>
	<title>Home</title>
</head>
<body>
<h1>
	Upload file!  
</h1>

<P>  The time on the server is ${serverTime}. </P>

<H1>Demo uploading</H1>
<form:form action="upload" method="POST" enctype="multipart/form-data" modelAttribute="model">
  Video tile: <form:input path="videoTitle"/>
  <input type="file" name="videoFile"/>
  <br/>
  <input type="submit" name="Upload" value="Upload">
</form:form>
</body>
</html>
