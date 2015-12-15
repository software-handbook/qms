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
package openones.sample.stock.gaedao.dto;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import openones.stock.StockInfo;

@PersistenceCapable
public class StockDTO {
    /** Physical primary key of the object. */
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Long key;

    @Persistent
    private String code;
    
    @Persistent
    private Date date;
    
    @Persistent
    private float floorPrice;
    
    public StockDTO(StockInfo stock) {
        code = stock.getCode();
        date = stock.getDate();
        floorPrice = stock.getFloPrice();
        ceilPrice = stock.getCeilPrice();
        refPrice = stock.getRefPrice();
        closedPrice = stock.getClosedPrice();
        volume = stock.getVolume();
    }

    public Long getKey() {
        return key;
    }

    public void setKey(Long key) {
        this.key = key;
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

    public float getFloorPrice() {
        return floorPrice;
    }

    public void setFloorPrice(float floorPrice) {
        this.floorPrice = floorPrice;
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

    @Persistent
    private float ceilPrice;
    
    @Persistent
    private float refPrice;
    
    @Persistent
    private float closedPrice;
    
    @Persistent
    private float volume;
}
