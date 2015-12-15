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
package openones.stock;

import java.util.Date;

public class StockInfo {
    private String code;
    private Date date;
    private float floPrice;
    private float ceilPrice;
    private float refPrice;
    private float closedPrice;
    private float volume;
    
    public StockInfo(String symbol) {
        code = symbol;
    }
    
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
    public Date getDate() {
        return date;
    }
    public void setDate(Date date) {
        this.date = date;
    }
    public float getFloPrice() {
        return floPrice;
    }
    public void setFloPrice(float floPrice) {
        this.floPrice = floPrice;
    }
    public float getCeilPrice() {
        return ceilPrice;
    }
    public void setCeilPrice(float ceilPrice) {
        this.ceilPrice = ceilPrice;
    }
    public float getRefPrice() {
        return refPrice;
    }
    public void setRefPrice(float refPrice) {
        this.refPrice = refPrice;
    }
    public float getClosedPrice() {
        return closedPrice;
    }

    public void setClosedPrice(float closedPrice) {
        this.closedPrice = closedPrice;
    }

    public float getVolume() {
        return volume;
    }

    public void setVolume(float volume) {
        this.volume = volume;
    }
}
