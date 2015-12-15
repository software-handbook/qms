/**
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
 */
package openones.tms.annospringmvcportlet.controller;

import java.util.Calendar;
import java.util.Date;

import javax.portlet.PortletSession;
import javax.portlet.RenderRequest;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.portlet.ModelAndView;

import rocky.common.CommonUtil;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

/**
 * @author Thach.Le
 */
@Controller
@RequestMapping("VIEW")
public class ChartController {
    /** Logger for logging. */
    private static Logger log = Logger.getLogger(ChartController.class);

    /**
     * Default screen.
     * @return name of view which is the name of the JSP page.
     */
    @RequestMapping
    public ModelAndView initScreen(RenderRequest request, PortletSession session) {
        log.debug("initScreen.START");
        
        // Display chart.jsp
        ModelAndView mav = new ModelAndView("chart");
        
        mav.addObject("data", "Test data");
        mav.addObject("chartData", getChartData());
        mav.addObject("chartLabel", getChartLabel());
        return mav;
    }

    /**
     * Build x-axis: before and after 10 days from current date.
     * @return
     */
    private String getChartLabel() {
        JsonArray chartLabel = new JsonArray();
        
        JsonArray chartNodeLabel;
        
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DAY_OF_MONTH, -10);
        String label;
        for (int i = 0; i < 20; i++) {
            label = CommonUtil.formatDate(cal.getTime(), "dd-MMM");
            // create chart node label, e.g., ["20-Oct 21-Oct 22-Oct..."]
            chartNodeLabel = new JsonArray();
            chartNodeLabel.add(new JsonPrimitive(i));
            chartNodeLabel.add(new JsonPrimitive(label));
            chartLabel.add(chartNodeLabel);
            cal.add(Calendar.DAY_OF_MONTH, +1);
        }
        return chartLabel.toString();
    }

    /**
     * Get sample data for chart.
     * @return
     */
    private String getChartData() {
        JsonArray chartData = new JsonArray();
        
        JsonObject serieData1 = buildDataSerie(1.0, "Plan LOC");
        JsonObject serieData2 = buildDataSerie(0.5, "Actual LOC");
        
        
        chartData.add(serieData1);
        chartData.add(serieData2);

        return chartData.toString();
    }
    
    /**
     * Create sample data for one serie.
     * @param double rate to create sample data 0.0 ~ 1.0
     * @return JsonObject "data" and property "label"
     */
    private JsonObject buildDataSerie(double rate, String label) {
        JsonObject chartSerie = new JsonObject();
        JsonArray chartSerieData = new JsonArray();

        JsonArray chartNode;

        int size = 10;
        for (int i = 0; i < 10; i++) {
            // create chart node data, e.g., [0,20]
            chartNode = new JsonArray();
            chartNode.add(new JsonPrimitive(i));

            if (i % 2 == 0) {
                size += 20;
            } else {
                size -= 3;
            }
            chartNode.add(new JsonPrimitive(size * rate));
            chartNode.add(new JsonPrimitive(0));

            chartSerieData.add(chartNode);
        }
        chartSerie.add("data", chartSerieData);
        chartSerie.addProperty("label", label);
        
        return chartSerie;
    }

}
