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
package openones.sample.stock.gaedao;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import openones.gaecore.PMF;
import openones.sample.stock.dao.IStockDao;
import openones.sample.stock.gaedao.dto.StockDTO;
import openones.stock.StockInfo;

/**
 * Implementation of Stock DAO layer which uses GAE persistence.
 * @author Thach Le
 */
public class GaeStockDao implements IStockDao {

    @Override
    public void insertStock(StockInfo stock) {
        // convert StockInfo into StockDTO
        StockDTO stockDTO = new StockDTO(stock);
        PMF.save(stockDTO);
    }

    @Override
    public Collection<StockInfo> getStocks() {
        // TODO Auto-generated method stub
        String ordering = "date asc";
        
        // Get list of Stock from the persistence layer
        List<StockDTO> stockDTOList = (List<StockDTO>) PMF.getObjects(StockDTO.class, PMF.NO_FILTER, PMF.NO_IMPORT,
                PMF.NO_PARAM, ordering , PMF.NO_PARAMVALUE);
        
        // Convert StockDTO into StockInfo
        Collection<StockInfo> stockInfoList = new ArrayList<StockInfo>();
        StockInfo stockInfo;
        for (StockDTO stockDto: stockDTOList) {
            stockInfo = new StockInfo(stockDto.getCode());
            stockInfo.setDate(stockDto.getDate());
            stockInfo.setRefPrice(stockDto.getRefPrice());
            stockInfo.setCeilPrice(stockDto.getCeilPrice());
            stockInfo.setFloPrice(stockDto.getFloorPrice());
            stockInfo.setClosedPrice(stockDto.getClosedPrice());
            stockInfo.setVolume(stockDto.getVolume());
            stockInfoList.add(stockInfo);
        }
        
        return stockInfoList;
    }
    

}
