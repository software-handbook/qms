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
package openones.tms.menuportlet.controller;

import java.util.Date;

import javax.portlet.PortletSession;
import javax.portlet.RenderRequest;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.portlet.ModelAndView;
import org.springframework.web.portlet.bind.annotation.RenderMapping;

/**
 * @author Thach.Le
 */
@Controller
@RequestMapping("VIEW")
public class MainController {
    /** Logger for logging. */
    private static Logger log = Logger.getLogger(MainController.class);

    /**
     * Default screen.
     * @return name of view which is the name of the JSP page.
     */
    @RequestMapping
    public String initScreen() {
        log.debug("initScreen.START");
        // Display Home.jsp
        return "Home";
    }
    
    /**
     * Process renderURL with parameter "action" is "item1".
     * @param request
     * @param session
     * @return
     */
    @RenderMapping(params = "action=item1")
    public ModelAndView gotoItem1(RenderRequest request, PortletSession session) {
        log.debug("gotoItem1.START");

        ModelAndView mav = new ModelAndView("ITem1"); // display ITem1.jsp
        mav.addObject("currTime", new Date());
        return mav;
    }
    
    /**
     * Process renderURL with parameter "action" is "item1".
     * @param request
     * @param session
     * @return
     */
    @RenderMapping(params = "action=subItem1.2")
    public ModelAndView gotoItem1_2(RenderRequest request, PortletSession session) {
        log.debug("gotoItem1_2.START");

        ModelAndView mav = new ModelAndView("SubITem1_2"); // display SubITem1_2.jsp
        mav.addObject("currTime", new Date());
        return mav;
    }

    /**
     * Process renderURL with parameter "action" is "goVerticalMenu".
     * Demo using jquery, ddaccordion.js to display vertical menu
     * @param request
     * @param session
     * @return
     */
    @RenderMapping(params = "action=goVerticalMenu")
    public ModelAndView gotoVerticalMenu(RenderRequest request, PortletSession session) {
        log.debug("gotoItem1_2.START");

        ModelAndView mav = new ModelAndView("VerticalMenuWrapper"); // display Vertical-Menu.jsp
        mav.addObject("currTime", new Date());
        return mav;
    }

}
