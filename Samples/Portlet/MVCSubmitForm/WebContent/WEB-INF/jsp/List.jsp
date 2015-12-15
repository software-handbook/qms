<%--
 * Licensed to Open-Ones Group under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Open-Ones Group licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
--%>

<%@page contentType="text/html" pageEncoding="UTF-8" import="javax.portlet.*"%>
<%@ taglib uri="http://java.sun.com/portlet" prefix="portlet"%>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<portlet:defineObjects/>

<script type="text/javascript" src='/${requestScope.contextPath}/scripts/common.js' ></script>

<H1>List screen</H1>

<form name="<portlet:namespace/>List" action="<portlet:actionURL/>" method="POST">
  <input type="hidden" name="screenId" value="List"/>
  <input type="hidden" name="eventId" value=""/>
  
  <%-- Search condition --%>
  <input type="text" name="account" value=""/><input type="button" name="search" value="Search" onclick='submitAction("<portlet:namespace/>List", "search");'/><br/>
  
  <%-- Search result --%>
  <table border="1" width="450px">
    <tr>
      <td width="5px">STT</td>
      <td width="55px">Tài khoản</td>
      <td width="90px">Họ</td>
      <td width="60px">Tên</td>
      <td width="60px">Ngày sinh</td>
    </tr>
    <c:forEach var="accountInfo" items="${requestScope.accountList}">
    <tr>
      <td></td>
      <td>${accountInfo.account}</td>
      <td>${accountInfo.firstName}</td>
      <td>${accountInfo.lastName}</td>
      <td>${accountInfo.birthDay}</td>
    </tr>
    </c:forEach>
    
  </table>
  
  <input type="button" name="add" value="Add" onclick='submitAction("<portlet:namespace/>List","add");'/>
</form>