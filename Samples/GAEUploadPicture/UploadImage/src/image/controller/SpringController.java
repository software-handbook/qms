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
package image.controller;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.servlet.ModelAndView;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;

/**
 * @author thachle
 */
@Controller
@SessionAttributes
public class SpringController {
    private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();

    /**
     * Display form to input data and upload picture.
     * @param req
     * @param resp
     * @param session
     * @return
     * @throws IOException
     */
    @RequestMapping("/home.html")
    public ModelAndView login(HttpServletRequest req, HttpServletResponse resp, HttpSession session) throws IOException {

        return new ModelAndView("upload");
    }

    /**
     * Processing form submit.
     * @param req
     * @return
     * @throws IOException
     */
    @RequestMapping("/upload.do")
    public ModelAndView processUpload(HttpServletRequest req) throws IOException {
        Map<String, BlobKey> blobs = blobstoreService.getUploadedBlobs(req);

        // Get content of uploaded picture by name of input "file"
        BlobKey blobKey = blobs.get("myPicture");

        // Get input name
        String name = req.getParameter("name");

        String imageKey = blobKey.getKeyString();

        // Prepare the next view with display.jsp
        ModelAndView mav = new ModelAndView("display");
        mav.addObject("name", name);
        mav.addObject("imageKey", imageKey);

        return mav;
    }

    /**
     * Display image with tag <img src="/display.do?imageKey=value"/>.
     * @param req
     * @param resp
     * @throws IOException
     */
    @RequestMapping("/display.do")
    public void displayImage(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        BlobKey blobKey = new BlobKey(req.getParameter("imageKey"));
        blobstoreService.serve(blobKey, resp);
    }
}
