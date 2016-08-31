package m.k.s.webapp.spring.upload.controller;

import java.text.DateFormat;
import java.util.Date;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import m.k.s.webapp.spring.upload.model.VideoUploadModel;

/**
 * Handles requests for the application home page.
 */
@Controller
public class HomeController {
	
	private static final Logger logger = LoggerFactory.getLogger(HomeController.class);
	
	/**
	 * Simply selects the home view to render by returning its name.
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String home(Locale locale, Model model) {
		logger.info("Welcome home! The client locale is {}.", locale);
		
		Date date = new Date();
		DateFormat dateFormat = DateFormat.getDateTimeInstance(DateFormat.LONG, DateFormat.LONG, locale);
		
		String formattedDate = dateFormat.format(date);
		
		model.addAttribute("serverTime", formattedDate );
		model.addAttribute("model", new VideoUploadModel());

		return "home";
	}
	
	/**
	 * Perform to catch the uploaded file.
	 * @return name of view "upload"
	 */
	@RequestMapping(value = "/upload", method = RequestMethod.POST)
	public ModelAndView upload(@ModelAttribute("model") VideoUploadModel videoModel, BindingResult bindingResult) {
		// Next screen is "upload-result"
		ModelAndView mav = new ModelAndView("upload-result");
		logger.debug("Processing uploading...");
		
		if (bindingResult.hasErrors()) {
			logger.error("Binding has errors: " + bindingResult.getErrorCount());
			
			// Logging errors
			for (ObjectError objErr : bindingResult.getAllErrors()) {
				logger.error("Error message: " + objErr.getDefaultMessage());
			}
			mav.addObject("nError", bindingResult.getErrorCount());
		} else {
			// Logging upload file and title
			logger.debug("Video title: " + videoModel.getVideoTitle());
			logger.debug("Video size (bytes): " + videoModel.getVideoFile().getSize());
			
			mav.addObject("videoTitle", videoModel.getVideoTitle());
			mav.addObject("videoSize", videoModel.getVideoFile().getSize());
			mav.addObject("originalFileName", videoModel.getVideoFile().getOriginalFilename());
		}

		return mav;
	}
}
