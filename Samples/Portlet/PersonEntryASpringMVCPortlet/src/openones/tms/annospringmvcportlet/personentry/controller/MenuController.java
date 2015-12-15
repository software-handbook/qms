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
package openones.tms.annospringmvcportlet.personentry.controller;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Thach.Le
 */
@Controller
@RequestMapping("VIEW")
public class MenuController {
    private static final Logger LOG = Logger.getLogger(MenuController.class);
    /**
     * Default screen.
     * @return name of view which is the name of the JSP
     */
    @RequestMapping
    public String initScreen() {
        LOG.debug("initScreen.START");
        // Display Login.jsp
        return "Menu";
    }

}
