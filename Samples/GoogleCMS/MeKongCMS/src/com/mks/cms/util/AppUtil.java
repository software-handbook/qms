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
package com.mks.cms.util;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import rocky.common.CommonUtil;
import rocky.common.XMLUtil;

import com.mks.cms.entity.Tab;

/**
 * Application utility.
 * @author Thach.Le
 */
public class AppUtil {
    /** Logger for logging. */
    private final static Logger log = Logger.getLogger("AppUtil");

    /**
     * Load tab information from the reosource file "/web-content.xml".
     * @return list of Tab entities.
     */
    public static List<Tab> loadTabs() {
        List<Tab> tabList = new ArrayList<Tab>();
        try {

            Document menuBarDoc = XMLUtil.parse(CommonUtil.loadResource("/web-content.xml"));
            XPathFactory xpf = XPathFactory.newInstance();
            XPath xp = xpf.newXPath();
            // Nodes of rule
            NodeList subMenuNodeList = (NodeList) xp.evaluate("//tab", menuBarDoc, XPathConstants.NODESET);

            int len = (subMenuNodeList != null) ? subMenuNodeList.getLength() : 0;

            Node subMenuNode;
            Tab tab;
            for (int i = 0; i < len; i++) {
                tab = new Tab();
                subMenuNode = subMenuNodeList.item(i);
                tab.setName(xp.evaluate("@name", subMenuNode));
                tab.setId(xp.evaluate("@id", subMenuNode));
                tab.setLink(xp.evaluate("@href", subMenuNode));
                tab.setTooltip(xp.evaluate("text()", subMenuNode));

                tabList.add(tab);
            }

        } catch (Exception ex) {
            log.log(Level.CONFIG, "Loading resource /web-content.xml", ex);
        }

        return tabList;
    }
}