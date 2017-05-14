package m.k.s.sakaiapp.upload.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import lombok.Getter;
import lombok.Setter;
import m.k.s.sakaiapp.upload.logic.SakaiProxy;

/**
 * Handles requests for the application home page.
 */
@Controller
@EnableWebMvc
public class HomeController {
    final static protected Log LOG = LogFactory.getLog(HomeController.class);

    @Setter
    @Getter
    private SakaiProxy sakaiProxy = null;
	   
	   /**
     * This method is called when binding the HTTP parameter to bean (or model).
     * 
     * @param binder
     */
    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        // Sample init of Custom Editor

//        Class<List<ItemKine>> collectionType = (Class<List<ItemKine>>)(Class<?>)List.class;
//        PropertyEditor orderNoteEditor = new MotionRuleEditor(collectionType);
//        binder.registerCustomEditor((Class<List<ItemKine>>)(Class<?>)List.class, orderNoteEditor);

    }
    
	/**
	 * Simply selects the home view to render by returning its name.
     * @return 
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String home() {
		
		return "home";
	}

	@RequestMapping(value = "/home", method = RequestMethod.GET)
	public ModelAndView displayHome() {
		ModelAndView mav = new ModelAndView("home");

		
		mav.addObject("currentSiteId", sakaiProxy.getCurrentSiteId());
		mav.addObject("userDisplayName", sakaiProxy.getCurrentUserDisplayName());

		return mav;
	}
}
