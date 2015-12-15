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
package com.mks.cms.controller;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.mks.cms.biz.CMSWorkspace;
import com.mks.cms.form.HomeForm;

/**
 * This controller is center processing request.
 * @author thachle
 */
@Controller
public class EntryController {
    /** Logging. */
    private static Logger log = Logger.getLogger("EntryController");

    @RequestMapping("/*.html")
    public ModelAndView handleRequest(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        ModelAndView mav = new ModelAndView("index");
        HomeForm form = new HomeForm();
        String mainContent = null;

        try {
            String mainDoc = getNextDoc(req);
            String eventId = req.getParameter("eventId");

            form.setTabList(CMSWorkspace.getTabs());

            if (eventId != null) {
                form.setSelectedId(eventId);
            }

            if (mainDoc != null) {
                mainContent = CMSWorkspace.getContent(mainDoc);
            }
        } catch (Throwable th) {
            // skip
            log.log(Level.FINEST, "Unhandle error", th);
        }
        mav.addObject("homeForm", form);
        mav.addObject("mainContent", mainContent);

        return mav;
    }

    /**
     * Get URI name. It means document is selected to display. Ex: query "http://server/document-a.html return
     * "document-a.html"
     * @param req Http request
     * @return name of document is delected to display.
     */
    private static String getNextDoc(HttpServletRequest req) {
        String uri = req.getRequestURI();
        // Skip the first character /
        return uri.substring(1);
    }
}
