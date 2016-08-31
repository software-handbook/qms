<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ page session="false" %>
<html>
<head>
	<title>Uploaded Video</title>
</head>
<body>

<H1>Information of the uploaded video</H1>
VideoTitle: ${videoTitle}
<br/>
Size (bytes): ${videoSize}
<br/>
Original file name: ${originalFileName}
<br/>
<a href="/">Go back</a>
</body>
</html>
