<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt"%>
<%@ taglib prefix="portlet" uri="http://java.sun.com/portlet"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script type="text/javascript" src="/ChartSpringPortletMVC/js/jquery.min.js"></script>
	<script type="text/javascript" src="/ChartSpringPortletMVC/js/jquery-ui-1.8.14.custom.min.js"></script>
	<script type="text/javascript" src="/ChartSpringPortletMVC/js/jquery.dataTables.min.js"></script>
	<script type="text/javascript" src="/ChartSpringPortletMVC/js/excanvas.min.js"></script>
    <script type="text/javascript" src="/ChartSpringPortletMVC/js/jquery.flot.min.js"></script>
    <script type="text/javascript" src="/ChartSpringPortletMVC/js/jquery.flot.pie.min.js"></script>
    <script type="text/javascript" src="/ChartSpringPortletMVC/js/json2.js"></script>
    <script type="text/javascript" src="/ChartSpringPortletMVC/script/common.js"></script>
</head>
<H1>Chart Portlet with Spring MVC Portlet framework 3.1</H1>

<div>
<div id="<portlet:namespace/>chart" style="width:700px;height:300px">${data}</div>

		<script type="text/javascript"> 
			$('#<portlet:namespace/>result').tabs();
            $('#<portlet:namespace/>griddata').dataTable( {
            	"sScrollY": "210px",
        		"bPaginate": false
			});
			$(function () {
			    $.plot($("#<portlet:namespace/>chart"),JSON.parse('${chartData}'),{
									 	series: {
                  								lines: { 
												show: true 
											},
                  								points: { 
												show: true 
											}
              								},
              								grid: { 
											hoverable: true, 
											clickable: true 
										},
										xaxis: {
											ticks: JSON.parse('${chartLabel}')
										}
									});
									
				function showTooltip(x, y, contents) {
			        $('<div id="<portlet:namespace/>tooltip">' + contents + '</div>').css( {
			            position: 'absolute',
			            display: 'none',
			            top: y + 5,
			            left: x + 5,
			            border: '1px solid #fdd',
			            padding: '2px',
			            'background-color': '#fee',
			            opacity: 0.80
			        }).appendTo("body").fadeIn(200);
			    }
				var prePoint = null;
				$("#<portlet:namespace/>chart").bind("plothover", function(event, pos, item) {
                   	if (item) {
						if (prePoint != item.dataIndex) {
							prePoint = item.dataIndex;
							$("#<portlet:namespace/>tooltip").remove();
							var x = item.series.xaxis.ticks[item.datapoint[0]].label;
                   			var y = item.datapoint[1];
							showTooltip(item.pageX, item.pageY, item.series.label + " : " + x + " contribute " + y);
						}
					}							
					else {
						$("#<portlet:namespace/>tooltip").remove();
						prePoint = null;
					}
				});	
			});
			$('#<portlet:namespace/>a-grid').click(function(){
				$('#tooltip').remove();
			});
		</script>

</div>