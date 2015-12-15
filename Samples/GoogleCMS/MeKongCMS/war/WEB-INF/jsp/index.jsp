<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ include file="/WEB-INF/jsp/include.jsp"%>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<title><s:message code="app.title"/></title>
<meta name="description" content='<s:message code="meta.description"/>' />
<meta name="keywords" content='<s:message code="meta.keywords"/>' />
<meta name="language" content='<s:message code="meta.language"/>' />
<meta name="subject" content='<s:message code="meta.subject"/>' />
<meta name="robots" content='<s:message code="meta.robots"/>' />
<link id="theme" rel="stylesheet" type="text/css" href="css/style.css" title="theme" />
<script type="text/javascript" src="script/common.js"></script>
<%@ include file="/WEB-INF/jsp/analytics.jsp"%>

</head>
<body>
  <div id="wrapper">
  <div id="header">
    <a href="#"><img src="image/mks-header.png" alt="Công cụ quản trị dự án phần mềm, quản lý dự án CMMi level 3, CMMi level 4, CMMi level 5"></img></a>
  </div>
    <form:form name="frmNav" action="" commandName="homeForm">
      <form:hidden path="eventId"/>
            <div id="nav1">
            <%-- Selected tab: id="current" style="border:none" --%> 
              <ul>
                <c:forEach var="tab" items="${homeForm.tabList}">
                  <c:choose>
                    <c:when test="${homeForm.selectedId == tab.id}">
                      <li id="current" style="border:none">
                       <a href="${tab.link}" shape="rect" title="${tab.tooltip}">${tab.name}</a>
                      </li>
                    </c:when>
                    <c:otherwise>
                      <li>
                       <a href="${tab.link}" shape="rect" title="${tab.tooltip}" onclick='submitToDoc("frmNav","${tab.id}", "${tab.link}"); return false;'>${tab.name}</a>
                      </li>
                    </c:otherwise>
                  </c:choose>
                  
                </c:forEach>
              </ul> 
            </div>
     </form:form>
            <div id="main">
               <c:choose>
                 <c:when test="${not empty mainContent}">
                   ${mainContent}
                 </c:when>
                 <c:otherwise>
                   <s:message code="error.notContent"/>
                 </c:otherwise>
               </c:choose>
               
            </div>
            <div id="right">
              <%@ include file="/WEB-INF/jsp/right.jsp"%>
            </div>
    <div id="footer">
    
    </div>
  </div>
</body>
</html>