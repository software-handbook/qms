<%@ page import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%
    BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
%>


<html>
    <head>
        <title>Upload image by GAE + Spring framework</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    
    <body>
    <H1>Upload image with GAE. Version 2: Using Spring Framework</H1>
        <form action="<%= blobstoreService.createUploadUrl("/upload.do") %>" method="post" enctype="multipart/form-data">
        Name: <input type="text" name="name"><br/>
        Picture:            
            <input type="file" name="myPicture"><br/>
            <input type="submit" value="Submit">
        </form>
    </body>
</html>