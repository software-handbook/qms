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
package openones.tms.springmvcportlet.controller;

import javax.portlet.RenderRequest;

import openones.portlet.PortletSupport;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.portlet.ModelAndView;

/**
 * @author Thach.Le
 */
@Controller
@RequestMapping("VIEW")
public class HomeController {
    /** Logger for logging. */
    private static Logger log = Logger.getLogger(HomeController.class);

    /**
     * Default screen.
     * @return name of view which is the name of the JSP page.
     */
    @RequestMapping
    public ModelAndView initScreen(RenderRequest request) {
        log.debug("initScreen.START");
        ModelAndView mav = new ModelAndView("home"); // home.jsp used for view.

        // Get logon user
        PortletSupport portletSupport = new PortletSupport(request);
        String logonUser = portletSupport.getLogonUser();

        log.debug("logonUser=" + logonUser);

        if (logonUser == null) {
            mav.addObject("msg", "logonUser is null. You're running the portlet within development Portal.\n"
                    + "The resource /dev.properties not found or property 'username' is not declared.");
        } else if ("guest".equals(logonUser)) {
            mav.addObject(
                    "msg",
                    "Your portlet is running in the home page of uPortal. Or.\n"
                            + "You're running the portlet within development Portal with resource '/dev.properties' declares 'username' is 'guest'");
        } else {
            mav.addObject("msg", "Welcome '" + logonUser + "'");
        }

        return mav;
    }
}
