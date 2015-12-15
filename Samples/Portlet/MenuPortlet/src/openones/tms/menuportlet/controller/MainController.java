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

import java.util.ArrayList;
import java.util.List;

import javax.portlet.PortletSession;
import javax.portlet.RenderRequest;

import openones.tms.menuportlet.form.SubMenu;

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

    /**  List sub menu in Menu bar . */
    private List<SubMenu> subMenuList = null ;
    
    /**
     * [Give the description for method].
     * @return list of sub menu
     */
    private List<SubMenu> getMenuBar() {
        if (subMenuList == null) {
            subMenuList = new ArrayList<SubMenu>();
            SubMenu subMenu1 = new SubMenu("ctl00_MainMenun0", "Trang chủ", "home.png", "initHomePage");
            SubMenu subMenu2 = new SubMenu("ctl00_MainMenun1", "Cá nhân", "admin.png");
            subMenu2.addMenuItem("id", "Thông tin cá nhân", "icon");

            subMenuList.add(subMenu1);
            subMenuList.add(subMenu2);
        }
        return subMenuList;
    }
    /**
     * Default screen.
     * @return name of view which is the name of the JSP page.
     */
    @RequestMapping
    public ModelAndView initScreen() {
        log.debug("initScreen.START");
        ModelAndView mav = new ModelAndView("HomePage"); // Display HomePage.jsp
        
        mav.addObject("subMenuList", getMenuBar());
        return mav;
    }

    @RenderMapping(params = "action=initHomePage")
    public ModelAndView goHomePage(RenderRequest request, PortletSession session) {
        log.debug("goHomePage.START");

        ModelAndView mav = new ModelAndView("HomePage"); // Display HomePage.jsp
        
        mav.addObject("subMenuList", getMenuBar());
        
        return mav;
    }
    
    @RenderMapping(params = "action=initPersonalInfo")
    public ModelAndView displayPersonalInfo(RenderRequest request, PortletSession session) {
        log.debug("displayPersonalInfo.START");

        ModelAndView mav = new ModelAndView("PersonalInfo"); // display PersonalInfo.jsp
        mav.addObject("subMenuList", getMenuBar());
        
        return mav;
    }
}
