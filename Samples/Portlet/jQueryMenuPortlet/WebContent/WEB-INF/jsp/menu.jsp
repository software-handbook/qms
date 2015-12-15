<link rel="stylesheet" type="text/css" href="/jQueryMenuPortlet/resource-menu/jquerycssmenu.css" />

<script type="text/javascript" src="/jQueryMenuPortlet/resource-menu/jquery-1.6.1.min.js"></script>
<script type="text/javascript" src="/jQueryMenuPortlet/resource-menu/jquerycssmenu.js"></script>


<!--[if lte IE 7]>
<style type="text/css">
html .jquerycssmenu{height: 1%;} /*Holly Hack for IE7 and below*/
</style>
<![endif]-->



<body>
<div id="myjquerymenu" class="jquerycssmenu">
<ul>
<li><a href='<portlet:renderURL><portlet:param name="action" value="item1"/></portlet:renderURL>'>Item 1</a></li>
<li><a href="#">Item 2</a></li>
<li><a href="#">Folder 1</a>
  <ul>
  <li><a href='<portlet:renderURL><portlet:param name="action" value="subItem1.2"/></portlet:renderURL>'>Sub Item 1.1</a></li>
  <li><a href="#">Sub Item 1.2</a></li>
  <li><a href="#">Sub Item 1.3</a></li>
  <li><a href="#">Sub Item 1.4</a></li>
  </ul>
</li>
<li><a href="#">Item 3</a></li>
<li><a href="#">Folder 2</a>
  <ul>
  <li><a href="#">Sub Item 2.1</a></li>
  <li><a href="#">Folder 2.1</a>
    <ul>
    <li><a href="#">Sub Item 2.1.1</a></li>
    <li><a href="#">Sub Item 2.1.2</a></li>
    <li><a href="#">Folder 3.1.1</a>
		<ul>
    		<li><a href="#">Sub Item 3.1.1.1</a></li>
    		<li><a href="#">Sub Item 3.1.1.2</a></li>
    		<li><a href="#">Sub Item 3.1.1.3</a></li>
    		<li><a href="#">Sub Item 3.1.1.4</a></li>
    		<li><a href="#">Sub Item 3.1.1.5</a></li>
		</ul>
    </li>
    <li><a href="#">Sub Item 2.1.4</a></li>
    </ul>
  </li>
  </ul>
</li>
<li><a href='<portlet:renderURL><portlet:param name="action" value="goVerticalMenu"/></portlet:renderURL>'>Vertical Menu</a></li>
</ul>
<br style="clear: left" />
</div>
</body>