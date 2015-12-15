<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet" %>
<%-- 
Code templates:
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

3) Submit form
3.1) Build actionURL for the form
<portlet:actionURL var="formAction">
  <portlet:param name="action" value="add" />
</portlet:actionURL>

3.2) Create form with bean "contact"
<form:form commandName="contact" method="post" action="${formAction}">
  <form:input path="contactId"/>
  <input type="submit" name="_add" value="Add" />

--%>