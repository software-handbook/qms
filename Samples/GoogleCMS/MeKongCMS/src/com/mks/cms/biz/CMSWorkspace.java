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
package com.mks.cms.biz;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import rocky.common.CommonUtil;
import rocky.common.Constant;

import com.mks.cms.entity.Tab;
import com.mks.cms.util.AppUtil;

/**
 * Business center of CMS
 * @author thachle
 */
public class CMSWorkspace {
    /**  Logging. */
    private static Logger log = Logger.getLogger("CMSWorkspace");
    
    /**  Caching documents. */
    private static Map<String, String> docMap = new HashMap<String, String>();
    
    
    /**  Caching tabs. */
    private static List<Tab> tabList = null;
    
    /**
     * Get list of navigation Tabs.
     * @return all tabs
     */
    public static List<Tab> getTabs() {
        if (tabList == null){
            tabList = AppUtil.loadTabs();
        }
        
        return tabList;
    }

    /**
     * Get content (HTML formatĐ of document.
     * Step 1: Get from the cache. If not existed.
     * Step 2: Get from folder
     * @param mainDoc document name
     * @return HTML content of document
     */
    public static String getContent(String mainDoc) {
        if (!docMap.containsKey(mainDoc)) {
            // Get content of document from the folder
            String content = null;

            try {
                content = CommonUtil.getContent("/pages/" + mainDoc, Constant.DEF_ENCODE);
            } catch (IOException ex) {
                log.log(Level.FINEST, "Get resource '/pages/" + mainDoc, ex);
            }

            // Store the doc name and content into the Map table
            if (content != null) {
                docMap.put(mainDoc, content);
            }

            return content;
        }

        return (mainDoc != null) ? docMap.get(mainDoc) : null;
    }
    
    /**
     * Save the document name and content.
     * @param docName document name
     * @param content HTML content of document
     */
    public static void put(String docName, String content) {
        docMap.put(docName, content);
    }
}
