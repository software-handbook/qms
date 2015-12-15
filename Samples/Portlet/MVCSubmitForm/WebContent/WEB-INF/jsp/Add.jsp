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
<portlet:defineObjects/>

<script type="text/javascript" src='/${requestScope.contextPath}/scripts/common.js' ></script>

<H1>Add screen</H1>

<form name="<portlet:namespace/>Add" action="<portlet:actionURL/>" method="POST">
  <input type="hidden" name="screenId" value="Add"/>
  <input type="hidden" name="eventId" value=""/>
  
  <%-- Search result --%>
  Account: <input name="account" value="${requestScope.accountBean.account}"/><br/>
  First name: <input name="firstName" value="${requestScope.accountBean.firstName}"/><br/>
  Last name: <input name="lastName" value="${requestScope.accountBean.lastName}"/><br/>
  Birthday: <input name="birthDay" value="${requestScope.accountBean.birthDay}"/><br/>
  
  <input type="button" name="save" value="Save" onclick='submitAction("<portlet:namespace/>Add","save");'/>
  <input type="button" name="goBack" value="Go Back" onclick='submitAction("<portlet:namespace/>Add","goBack");'/>
</form>