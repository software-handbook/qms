<%@ include file="/WEB-INF/jsp/include.jsp" %>

Code templates:
A. How to send the request to server by render action (event)
1) Hyperlink to rise event "add"
<a href='<portlet:renderURL><portlet:param name="action" value="add"/></portlet:renderURL>'>Demo event Add</a>

2) Hyperlink to rise event "view" with parameters "contactId"
<a href='<portlet:renderURL>
            <portlet:param name="action" value="view"/>
            <portlet:param name="contactId">
                <jsp:attribute name="value">
                    <c:out value="${contact.contactId}"/>
                </jsp:attribute>
            </portlet:param>    
        </portlet:renderURL>
        '>Demo event "view" with parameter "contactId"</a>
3) Button of the form to rise event
<script type="text/javascript" src='/<AppContext>/scripts/common.js'></script>

<portlet:renderURL var="goScreenAUrl">
  <portlet:param name="action" value="goScreenA" />
</portlet:renderURL>

<form:form name="formA" commandName="Form Bean" method="post" action="#">
  <form:input path="contactId"/>
  <input type="button" name="goScreenA" value="Go to ScreenA" onclick='submitAction("${portletNamespace}formA", "${goScreenAUrl}")' />
</form:form>

B. How to send the data request to server by Action
3) Submit form
3.1) Build actionURL for the form
<portlet:actionURL var="formAction">
  <portlet:param name="action" value="add" />
</portlet:actionURL>

3.2) Create form with bean "contact"
<form:form commandName="contact" method="post" action="${formAction}">
  <form:input path="contactId"/>
  <input type="submit" name="_add" value="Add" />
</form:form>