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
public class TemplateController {
    /** Logger for logging. */
    private static Logger log = Logger.getLogger(TemplateController.class);

    /**
     * Default screen with name of JSP Page.
     * @return name of view which is the name of the JSP page.
     */
    @RequestMapping
    public String initScreen() {
        log.debug("initScreen.START");
        // Display hello.jsp
        return "hello";
    }
    
    /**
     * Default screen with Model and View.
     * @param request
     * @param session
     * @return
     */
    @RequestMapping
    public ModelAndView initScreen(RenderRequest request, PortletSession session) {
        log.debug("initScreen.START");
        ModelAndView mav = new ModelAndView("hello"); // Display hello.jsp
        
        mav.addObject("key", "Object value"); // Access from JSP with syntax ${key}
        return mav;
    }

    /**
     * Process renderURL with parameter "action" is "goAScreen".
     * @param request
     * @param session
     * @return
     */
    @RenderMapping(params = "action=goAScreen")
    public ModelAndView gotoScreen(RenderRequest request, PortletSession session) {
        log.debug("gotoScreen.START");

        ModelAndView mav = new ModelAndView("ViewDefectMode"); // display ViewDefectMode.jsp
        
        return mav;
    }
}
