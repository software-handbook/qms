<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jstl/fmt" prefix="fmt"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Account List</title>
</head>
<body>
<h3>Add account</h3>
<form action="controller.do">
  Id*: <input name="id"/><br/>
  Name: <input name="name"/><br/>
  Email: <input name="email"/><br/>
  Birthday (dd/mm/yy): <input name="birthday"/><br/>
  <input type="submit" name="btnAdd" value="Add" />
</form>
<h3>List of account</h3>
<table cellpadding="0" cellspacing="0" border="1">
  <tr>
    <td>Id</td>
    <td>Name</td>
    <td>Email</td>
    <td>Birthday</td>
  </tr>
 
  <c:forEach var="account" items="${accountList}">
 <tr>
      <td>${account.id}</td>
      <td>${account.name}</td>
      <td>${account.email}</td>
      <td>${account.birthday}</td>
  </tr>    
  </c:forEach>
  
</table>
</body>
</html>