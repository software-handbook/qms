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
package openones.tms.account.dao;

import java.util.List;

import openones.tms.account.entity.Account;

/**
 * Interfaces to access, persist account information.
 * @author thach.le
 */
public interface IAccountDao {

    /**
     * Persist account information.
     * @param account contain information of account
     */
    void save(Account account);

    /**
     * Find account by identifier.
     * @param id unique identifier
     * @return an instance contains information of account. Null if not found
     */
    Account findById(java.lang.String id);

    /**
     * Get all accounts.
     * @return list of accounts
     */
    List<Account> listAll();
}
