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
package openones.tms.menuportlet.form;

/**
 * @author Thach.Le
 *
 */
public class MenuItem {
    private String name;
    private String action;
    private String iconPath;
    /**
     * Get value of name.
     * @return the name
     */
    public String getName() {
        return name;
    }
    /**
     * Set the value for name.
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }
    /**
     * Get value of action.
     * @return the action
     */
    public String getAction() {
        return action;
    }
    /**
     * Set the value for action.
     * @param action the action to set
     */
    public void setAction(String action) {
        this.action = action;
    }
    /**
     * Get value of iconPath.
     * @return the iconPath
     */
    public String getIconPath() {
        return iconPath;
    }
    /**
     * Set the value for iconPath.
     * @param iconPath the iconPath to set
     */
    public void setIconPath(String iconPath) {
        this.iconPath = iconPath;
    }

}
