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
package com.mks.cms.form;

import java.io.Serializable;
import java.util.List;

import com.mks.cms.entity.Tab;

/**
 * Form for home screen of the CMS.
 * @author thachle
 */
public class HomeForm implements Serializable {

    /** Selected id of the tab. Default is the first. */
    private String selectedId = "0";

    /** List of the tab. */
    private List<Tab> tabList;

    /** Event id of the . */
    private String eventId;

    /**
     * Get value of selectedId.
     * @return the selectedId
     */
    public String getSelectedId() {
        return selectedId;
    }

    /**
     * Set the value for selectedId.
     * @param selectedId the selectedId to set
     */
    public void setSelectedId(String selectedId) {
        this.selectedId = selectedId;
    }

    /**
     * Get value of tabList.
     * @return the tabList
     */
    public List<Tab> getTabList() {
        return tabList;
    }

    /**
     * Set the value for tabList.
     * @param tabList the tabList to set
     */
    public void setTabList(List<Tab> tabList) {
        this.tabList = tabList;
    }

    /**
     * Get value of eventId.
     * @return the eventId
     */
    public String getEventId() {
        return eventId;
    }

    /**
     * Set the value for eventId.
     * @param eventId the eventId to set
     */
    public void setEventId(String eventId) {
        this.eventId = eventId;
    }
}
