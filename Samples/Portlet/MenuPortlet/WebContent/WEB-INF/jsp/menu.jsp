<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet_2_0" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<portlet:defineObjects />

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="ctl00_Head1">
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<title>
	Demo Menu - version 0.2.x
</title>
<link href="/MenuPortlet/resource_files/Advanced.css" type="text/css" rel="stylesheet">
<link href="/MenuPortlet/resource_files/Ajax.css" type="text/css" rel="stylesheet">
<link href="/MenuPortlet/resource_files/AjaxJQuery.css" type="text/css" rel="stylesheet">
<link href="/MenuPortlet/resource_files/GridView.css" type="text/css" rel="stylesheet">
<link href="/MenuPortlet/resource_files/menustyles.css" type="text/css" rel="stylesheet">
<style type="text/css">
	.ctl00_MainMenu_0 { background-color:white;visibility:hidden;display:none;position:absolute;left:0px;top:0px; }
	.ctl00_MainMenu_1 { text-decoration:none; }
	.ctl00_MainMenu_2 {  }
	.ctl00_MainMenu_3 { border-style:none; }
	.ctl00_MainMenu_4 {  }
	.ctl00_MainMenu_5 {  }
	.ctl00_MainMenu_6 { border-style:none; }
	.ctl00_MainMenu_7 { padding:2px 0px 2px 0px; }
	.ctl00_MainMenu_8 {  }
	.ctl00_MainMenu_9 { border-style:none; }
	.ctl00_MainMenu_10 {  }
	.ctl00_MainMenu_11 { border-style:none; }
	.ctl00_MainMenu_12 {  }

</style></head>
<body style="padding-bottom: 29px;">

<script src="/MenuPortlet/resource_files/WebResource.js" type="text/javascript"></script>


<script src="/MenuPortlet/resource_files/ScriptResource_004.js" type="text/javascript"></script>
<script src="/MenuPortlet/resource_files/ScriptResource_002.js" type="text/javascript"></script>


<script src="/MenuPortlet/resource_files/ScriptResource_003.js" type="text/javascript"></script>

<script src="/MenuPortlet/resource_files/ScriptResource.js" type="text/javascript"></script>

<script language="javascript" src="/MenuPortlet/resource_files/dropdown_menu_hack.js" type="text/javascript"></script>

<script type="text/javascript" src='/MenuPortlet/scripts/common.js'></script>
<script type="text/javascript">
//<![CDATA[
var ctl00_MainMenu_Data = new Object();
ctl00_MainMenu_Data.disappearAfter = 100;
ctl00_MainMenu_Data.horizontalOffset = 0;
ctl00_MainMenu_Data.verticalOffset = 0;

//]]>
</script>
<form name="Menu" method="post" action="#">
    <div id="SMASMainPage">
        <div class="GridFull">

            <div class="MenuNav">
                <div class="GridFix">
                    <div class="bgMenu">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tbody><tr>
                                <td align="left" valign="middle">
                                    <div class="navigationArea">
   
   <%-- Menu Level1.START --%>
   <table id="ctl00_MainMenu" class="dmRootmenu ctl00_MainMenu_5 ctl00_MainMenu_2" border="0" cellpadding="0" cellspacing="0">
	<tbody>
   <tr>
     <c:forEach var="subMenu" items="${subMenuList}">
		<td onmouseover="Menu_HoverStatic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="${subMenu.id}">
          <table class="dmRootItem ctl00_MainMenu_4" border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody>
              <tr>
				<td style="white-space: nowrap;">
                 <a class="ctl00_MainMenu_1 dmRootItem ctl00_MainMenu_3" href='<portlet:renderURL><portlet:param name="action" value="${subMenu.actionId}"/></portlet:renderURL>' style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/${subMenu.iconPath}" alt="" style="border-style: none; vertical-align: middle;">&nbsp; ${subMenu.name}</a>
                </td>
			 </tr>
            </tbody>
          </table>
        </td>
        <td style="width: 3px;"></td>
      </c:forEach>
      <%-- 
        <td onmouseover="Menu_HoverStatic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun1">
          <table class="dmRootItem ctl00_MainMenu_4" border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody>
             <tr>
				<td style="white-space: nowrap;">
                 <a class="ctl00_MainMenu_1 dmRootItem ctl00_MainMenu_3" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/admin.png" alt="" style="border-style: none; vertical-align: middle;">&nbsp;${menu1}</a>
                </td>
			</tr>
		   </tbody>
         </table>
       </td>
       <td style="width: 3px;"></td>
       --%>
       <td onmouseover="Menu_HoverStatic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun2">
         <table class="dmRootItem ctl00_MainMenu_4" border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody><tr>
				<td style="white-space: nowrap;"><a class="ctl00_MainMenu_1 dmRootItem ctl00_MainMenu_3" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/pupil.png" alt="" style="border-style: none; vertical-align: middle;">&nbsp;${menu2}</a></td>
			</tr>
		  </tbody></table>
         </td>
         <td style="width: 3px;"></td><td onmouseover="Menu_HoverStatic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun3"><table class="dmRootItem ctl00_MainMenu_4" border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody><tr>
				<td style="white-space: nowrap;"><a class="ctl00_MainMenu_1 dmRootItem ctl00_MainMenu_3" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/teacher.png" alt="" style="border-style: none; vertical-align: middle;">&nbsp;Quản lý cán bộ</a></td>
			</tr>
		</tbody></table></td><td style="width: 3px;"></td><td onmouseover="Menu_HoverStatic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun4"><table class="dmRootItem ctl00_MainMenu_4" border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody><tr>
				<td style="white-space: nowrap;"><a class="ctl00_MainMenu_1 dmRootItem ctl00_MainMenu_3" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/until.png" alt="" style="border-style: none; vertical-align: middle;">&nbsp;Tiện ích</a></td>
			</tr>
		</tbody></table></td><td style="width: 3px;"></td><td onmouseover="Menu_HoverStatic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun5"><table class="dmRootItem ctl00_MainMenu_4" border="0" cellpadding="0" cellspacing="0" width="100%">
			<tbody><tr>
				<td style="white-space: nowrap;"><a class="ctl00_MainMenu_1 dmRootItem ctl00_MainMenu_3" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/list.png" alt="" style="border-style: none; vertical-align: middle;">&nbsp;Danh mục</a></td>
			</tr>
		</tbody></table></td>
	</tr>
</tbody>
   </table>
   <%-- Menu Level1.END --%>
  <div id="ctl00_MainMenun1Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody>
         <tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun6">
			<td>
              <table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody>
                  <tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href='<portlet:renderURL><portlet:param name="action" value="initPersonalInfo"/></portlet:renderURL>' style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thông tin cá nhân</a></td>
				  </tr>
			    </tbody>
              </table>
            </td>
		</tr>
        <tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun7">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Khởi tạo dữ liệu đầu năm</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Khởi tạo dữ liệu đầu năm" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody>
  </table>
  <div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun1ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
  </div>
  <div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun1ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
  </div>
</div><div id="ctl00_MainMenun7Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun8">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Cập nhật thời khóa biểu</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun7ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun7ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun2Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun9">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Quản lý học tập</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Quản lý học tập" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun10">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Quản lý rèn luyện</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Quản lý rèn luyện" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun11">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thống kê báo cáo</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Thống kê báo cáo" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun2ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun2ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun9Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun12">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Sổ điểm môn tính điểm.</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun13">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Sổ điểm môn nhận xét.</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun14">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Xếp loại hạnh kiểm</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun15">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Xếp loại học sinh</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun16">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Xếp loại tập thể lớp</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun17">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Đăng kí môn thi lại</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun18">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Cập nhật điểm thi lại</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun9ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun9ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun10Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun19">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Điểm danh</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun20">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Khen thưởng - Kỷ luật</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun10ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun10ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun11Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun21">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;In học bạ học sinh theo mẫu</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun22">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Bảng điểm của lớp</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun23">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thống kê kết quả học tập</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun24">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thống kê tình hình lưu chuyển học sinh</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun11ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun11ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun3Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun25">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Quản lý khen thưởng, kỷ luật</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Quản lý khen thưởng, kỷ luật" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun3ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun3ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun25Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun26">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Đánh giá xếp loại giáo viên</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun27">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Danh hiệu thi đua cán bộ</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun28">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Danh hiệu thi đua tập thể</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun25ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun25ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun4Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun29">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Quản lý thông báo</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun30">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Gửi tin nhắn SMS</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Gửi tin nhắn SMS" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun4ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun4ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun30Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun31">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Lịch sử gửi  tin nhắn SMS</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun32">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Tin nhắn cho Giáo viên</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Tin nhắn cho Giáo viên" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun33">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em; cursor: text;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Tin nhắn cho phụ huynh</a></td><td style="width: 0px;"><img src="/MenuPortlet/resource_files/arrow1.gif" alt="Expand &amp;nbsp;&amp;nbsp;Tin nhắn cho phụ huynh" style="border-style: none; vertical-align: middle;"></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun30ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun30ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun32Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun34">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thông báo đột xuất đến giáo viên</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun32ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun32ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun33Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun35">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thông báo kết quả học tập</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun36">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Thông báo đột xuất đến học sinh, phụ huynh</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun33ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun33ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div><div id="ctl00_MainMenun5Items" class="ctl00_MainMenu_0 dmSubmenu ctl00_MainMenu_8">
	<table class="vingdlumenutable" border="0" cellpadding="0" cellspacing="0">
		<tbody><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun37">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Loại công việc</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun38">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Hình thức xử lý VPQC thi</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun39">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Sáng kiến kinh nghiệm</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun40">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Công việc kiêm nhiệm</a></td>
				</tr>
			</tbody></table></td>
		</tr><tr onmouseover="Menu_HoverDynamic(this)" onmouseout="Menu_Unhover(this)" onkeyup="Menu_Key(event)" id="ctl00_MainMenun41">
			<td><table class="dmItem1 ctl00_MainMenu_7" border="0" cellpadding="0" cellspacing="0" width="100%">
				<tbody><tr>
					<td style="white-space: nowrap; width: 100%;"><a class="ctl00_MainMenu_1 dmItem1 ctl00_MainMenu_6" href="#" style="border-style: none; font-size: 1em;"><img src="/MenuPortlet/resource_files/misamples2.gif" alt="" style="border-style: none; vertical-align: middle;">&nbsp;&nbsp;Hình thức khen thưởng - kỷ luật</a></td>
				</tr>
			</tbody></table></td>
		</tr>
	</tbody></table><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun5ItemsUp" onmouseover="PopOut_Up(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource.gif" alt="Scroll up">
	</div><div class="dmItem1 ctl00_MainMenu_7 ctl00_MainMenu_0" id="ctl00_MainMenun5ItemsDn" onmouseover="PopOut_Down(this)" onmouseout="PopOut_Stop(this)" style="text-align:center;">
		<img src="/MenuPortlet/resource_files/WebResource_002.gif" alt="Scroll down">
	</div>
</div>
                                    </div>
                                </td>
                                <td style="padding-right: 5px;" align="right" valign="middle">
                                    
                                    &nbsp;

                                </td>
                            </tr>
                        </tbody></table>
                    </div>
                </div>
            </div>
        </div>
        <%--Content --%>



    </div>
</form>


</body></html>