//START AjaxControlToolkit.Common.Common.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


// Add common toolkit scripts here.  To consume the scripts on a control add
// 
//      [RequiredScript(typeof(CommonToolkitScripts))] 
//      public class SomeExtender : ...
// 
// to the controls extender class declaration.


Type.registerNamespace('AjaxControlToolkit');


AjaxControlToolkit.BoxSide = function() {
    /// <summary>
    /// The BoxSide enumeration describes the sides of a DOM element
    /// </summary>
    /// <field name="Top" type="Number" integer="true" static="true" />
    /// <field name="Right" type="Number" integer="true" static="true" />
    /// <field name="Bottom" type="Number" integer="true" static="true" />
    /// <field name="Left" type="Number" integer="true" static="true" />
}
AjaxControlToolkit.BoxSide.prototype = {
    Top : 0,
    Right : 1,
    Bottom : 2,
    Left : 3
}
AjaxControlToolkit.BoxSide.registerEnum("AjaxControlToolkit.BoxSide", false);


AjaxControlToolkit._CommonToolkitScripts = function() {
    /// <summary>
    /// The _CommonToolkitScripts class contains functionality utilized across a number
    /// of controls (but not universally)
    /// </summary>
    /// <remarks>
    /// You should not create new instances of _CommonToolkitScripts.  Instead you should use the shared instance CommonToolkitScripts (or AjaxControlToolkit.CommonToolkitScripts).
    /// </remarks>
}
AjaxControlToolkit._CommonToolkitScripts.prototype = {
    // The order of these lookup tables is directly linked to the BoxSide enum defined above
    _borderStyleNames : ["borderTopStyle","borderRightStyle","borderBottomStyle","borderLeftStyle"],
    _borderWidthNames : ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
    _paddingWidthNames : ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    _marginWidthNames : ["marginTop", "marginRight", "marginBottom", "marginLeft"],

    getCurrentStyle : function(element, attribute, defaultValue) {
        /// <summary>
        /// CommonToolkitScripts.getCurrentStyle is used to compute the value of a style attribute on an
        /// element that is currently being displayed.  This is especially useful for scenarios where
        /// several CSS classes and style attributes are merged, or when you need information about the
        /// size of an element (such as its padding or margins) that is not exposed in any other fashion.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Live DOM element to check style of
        /// </param>
        /// <param name="attribute" type="String">
        /// The style attribute's name is expected to be in a camel-cased form that you would use when
        /// accessing a JavaScript property instead of the hyphenated form you would use in a CSS
        /// stylesheet (i.e. it should be "backgroundColor" and not "background-color").
        /// </param>
        /// <param name="defaultValue" type="Object" mayBeNull="true" optional="true">
        /// In the event of a problem (i.e. a null element or an attribute that cannot be found) we
        /// return this object (or null if none if not specified).
        /// </param>
        /// <returns type="Object">
        /// Current style of the element's attribute
        /// </returns>

        var currentValue = null;
        if (element) {
            if (element.currentStyle) {
                currentValue = element.currentStyle[attribute];
            } else if (document.defaultView && document.defaultView.getComputedStyle) {
                var style = document.defaultView.getComputedStyle(element, null);
                if (style) {
                    currentValue = style[attribute];
                }
            }
            
            if (!currentValue && element.style.getPropertyValue) {
                currentValue = element.style.getPropertyValue(attribute);
            }
            else if (!currentValue && element.style.getAttribute) {
                currentValue = element.style.getAttribute(attribute);
            }       
        }
        
        if ((!currentValue || currentValue == "" || typeof(currentValue) === 'undefined')) {
            if (typeof(defaultValue) != 'undefined') {
                currentValue = defaultValue;
            }
            else {
                currentValue = null;
            }
        }   
        return currentValue;  
    },

    getInheritedBackgroundColor : function(element) {
        /// <summary>
        /// CommonToolkitScripts.getInheritedBackgroundColor provides the ability to get the displayed
        /// background-color of an element.  In most cases calling CommonToolkitScripts.getCurrentStyle
        /// won't do the job because it will return "transparent" unless the element has been given a
        /// specific background color.  This function will walk up the element's parents until it finds
        /// a non-transparent color.  If we get all the way to the top of the document or have any other
        /// problem finding a color, we will return the default value '#FFFFFF'.  This function is
        /// especially important when we're using opacity in IE (because ClearType will make text look
        /// horrendous if you fade it with a transparent background color).
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Live DOM element to get the background color of
        /// </param>
        /// <returns type="String">
        /// Background color of the element
        /// </returns>
        
        if (!element) return '#FFFFFF';
        var background = this.getCurrentStyle(element, 'backgroundColor');
        try {
            while (!background || background == '' || background == 'transparent' || background == 'rgba(0, 0, 0, 0)') {
                element = element.parentNode;
                if (!element) {
                    background = '#FFFFFF';
                } else {
                    background = this.getCurrentStyle(element, 'backgroundColor');
                }
            }
        } catch(ex) {
            background = '#FFFFFF';
        }
        return background;
    },

    getLocation : function(element) {
    /// <summary>Gets the coordinates of a DOM element.</summary>
    /// <param name="element" domElement="true"/>
    /// <returns type="Sys.UI.Point">
    ///   A Point object with two fields, x and y, which contain the pixel coordinates of the element.
    /// </returns>

    // workaround for an issue in getLocation where it will compute the location of the document element.
    // this will return an offset if scrolled.
    //
    if (element === document.documentElement) {
        return new Sys.UI.Point(0,0);
    }

    // Workaround for IE6 bug in getLocation (also required patching getBounds - remove that fix when this is removed)
    if (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7) {
        if (element.window === element || element.nodeType === 9 || !element.getClientRects || !element.getBoundingClientRect) return new Sys.UI.Point(0,0);

        // Get the first bounding rectangle in screen coordinates
        var screenRects = element.getClientRects();
        if (!screenRects || !screenRects.length) {
            return new Sys.UI.Point(0,0);
        }
        var first = screenRects[0];

        // Delta between client coords and screen coords
        var dLeft = 0;
        var dTop = 0;

        var inFrame = false;
        try {
            inFrame = element.ownerDocument.parentWindow.frameElement;
        } catch(ex) {
            // If accessing the frameElement fails, a frame is probably in a different
            // domain than its parent - and we still want to do the calculation below
            inFrame = true;
        }

        // If we're in a frame, get client coordinates too so we can compute the delta
        if (inFrame) {
            // Get the bounding rectangle in client coords
            var clientRect = element.getBoundingClientRect();
            if (!clientRect) {
                return new Sys.UI.Point(0,0);
            }

            // Find the minima in screen coords
            var minLeft = first.left;
            var minTop = first.top;
            for (var i = 1; i < screenRects.length; i++) {
                var r = screenRects[i];
                if (r.left < minLeft) {
                    minLeft = r.left;
                }
                if (r.top < minTop) {
                    minTop = r.top;
                }
            }

            // Compute the delta between screen and client coords
            dLeft = minLeft - clientRect.left;
            dTop = minTop - clientRect.top;
        }

        // Subtract 2px, the border of the viewport (It can be changed in IE6 by applying a border style to the HTML element,
        // but this is not supported by ASP.NET AJAX, and it cannot be changed in IE7.), and also subtract the delta between
        // screen coords and client coords
        var ownerDocument = element.document.documentElement;
        return new Sys.UI.Point(first.left - 2 - dLeft + ownerDocument.scrollLeft, first.top - 2 - dTop + ownerDocument.scrollTop);
    }

    return Sys.UI.DomElement.getLocation(element);
},

    setLocation : function(element, point) {
        /// <summary>
        /// Sets the current location for an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="point" type="Object">
        /// Point object (of the form {x,y})
        /// </param>
        /// <remarks>
        /// This method does not attempt to set the positioning mode of an element.
        /// The position is relative from the elements nearest position:relative or
        /// position:absolute element.
        /// </remarks>
        Sys.UI.DomElement.setLocation(element, point.x, point.y);
    },
    
    getContentSize : function(element) {
        /// <summary>
        /// Gets the "content-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Size of the element (in the form {width,height})
        /// </returns>
        /// <remarks>
        /// The "content-box" is the size of the content area *inside* of the borders and
        /// padding of an element. The "content-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var size = this.getSize(element);
        var borderBox = this.getBorderBox(element);
        var paddingBox = this.getPaddingBox(element);
        return {
            width :  size.width - borderBox.horizontal - paddingBox.horizontal,
            height : size.height - borderBox.vertical - paddingBox.vertical
        }
    },

    getSize : function(element) {
        /// <summary>
        /// Gets the "border-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Size of the element (in the form {width,height})
        /// </returns>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        return {
            width:  element.offsetWidth,
            height: element.offsetHeight
        };
    },
    
    setContentSize : function(element, size) {
        /// <summary>
        /// Sets the "content-box" size of an element.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="size" type="Object">
        /// Size of the element (in the form {width,height})
        /// </param>
        /// <remarks>
        /// The "content-box" is the size of the content area *inside* of the borders and
        /// padding of an element. The "content-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!size) {
            throw Error.argumentNull('size');
        }
        // FF respects -moz-box-sizing css extension, so adjust the box size for the border-box
        if(this.getCurrentStyle(element, 'MozBoxSizing') == 'border-box' || this.getCurrentStyle(element, 'BoxSizing') == 'border-box') {
            var borderBox = this.getBorderBox(element);
            var paddingBox = this.getPaddingBox(element);
            size = {
                width: size.width + borderBox.horizontal + paddingBox.horizontal,
                height: size.height + borderBox.vertical + paddingBox.vertical
            };
        }
        element.style.width = size.width.toString() + 'px';
        element.style.height = size.height.toString() + 'px';
    },
    
    setSize : function(element, size) {
        /// <summary>
        /// Sets the "border-box" size of an element.
        /// </summary>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and 
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        /// <param name="element" type="Sys.UI.DomElement">DOM element</param>
        /// <param name="size" type="Object">Size of the element (in the form {width,height})</param>
        /// <returns />
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!size) {
            throw Error.argumentNull('size');
        }
        var borderBox = this.getBorderBox(element);
        var paddingBox = this.getPaddingBox(element);
        var contentSize = {
            width:  size.width - borderBox.horizontal - paddingBox.horizontal,
            height: size.height - borderBox.vertical - paddingBox.vertical
        };
        this.setContentSize(element, contentSize);
    },
    
    getBounds : function(element) {
        /// <summary>Gets the coordinates, width and height of an element.</summary>
        /// <param name="element" domElement="true"/>
        /// <returns type="Sys.UI.Bounds">
        ///   A Bounds object with four fields, x, y, width and height, which contain the pixel coordinates,
        ///   width and height of the element.
        /// </returns>
        /// <remarks>
        ///   Use the CommonToolkitScripts version of getLocation to handle the workaround for IE6.  We can
        ///   remove the below implementation and just call Sys.UI.DomElement.getBounds when the other bug
        ///   is fixed.
        /// </remarks>
        
        var offset = $common.getLocation(element);
        return new Sys.UI.Bounds(offset.x, offset.y, element.offsetWidth || 0, element.offsetHeight || 0);
    }, 
    
    setBounds : function(element, bounds) {
        /// <summary>
        /// Sets the "border-box" bounds of an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="bounds" type="Object">
        /// Bounds of the element (of the form {x,y,width,height})
        /// </param>
        /// <remarks>
        /// The "border-box" is the size of the content area *outside* of the borders and
        /// padding of an element.  The "border-box" size does not include the margins around
        /// the element.
        /// </remarks>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if (!bounds) {
            throw Error.argumentNull('bounds');
        }
        this.setSize(element, bounds);
        $common.setLocation(element, bounds);
    },
    
    getClientBounds : function() {
        /// <summary>
        /// Gets the width and height of the browser client window (excluding scrollbars)
        /// </summary>
        /// <returns type="Sys.UI.Bounds">
        /// Browser's client width and height
        /// </returns>

        var clientWidth;
        var clientHeight;
        switch(Sys.Browser.agent) {
            case Sys.Browser.InternetExplorer:
                clientWidth = document.documentElement.clientWidth;
                clientHeight = document.documentElement.clientHeight;
                break;
            case Sys.Browser.Safari:
                clientWidth = window.innerWidth;
                clientHeight = window.innerHeight;
                break;
            case Sys.Browser.Opera:
                clientWidth = Math.min(window.innerWidth, document.body.clientWidth);
                clientHeight = Math.min(window.innerHeight, document.body.clientHeight);
                break;
            default:  // Sys.Browser.Firefox, etc.
                clientWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
                clientHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
                break;
        }
        return new Sys.UI.Bounds(0, 0, clientWidth, clientHeight);
    },
   
    getMarginBox : function(element) {
        /// <summary>
        /// Gets the entire margin box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's margin box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getMargin(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getMargin(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getMargin(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getMargin(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },
    
    getBorderBox : function(element) {
        /// <summary>
        /// Gets the entire border box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's border box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getBorderWidth(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },
    
    getPaddingBox : function(element) {
        /// <summary>
        /// Gets the entire padding box sizes.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <returns type="Object">
        /// Element's padding box sizes (of the form {top,left,bottom,right,horizontal,vertical})
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        var box = {
            top: this.getPadding(element, AjaxControlToolkit.BoxSide.Top),
            right: this.getPadding(element, AjaxControlToolkit.BoxSide.Right),
            bottom: this.getPadding(element, AjaxControlToolkit.BoxSide.Bottom),
            left: this.getPadding(element, AjaxControlToolkit.BoxSide.Left)
        };
        box.horizontal = box.left + box.right;
        box.vertical = box.top + box.bottom;
        return box;
    },
    
    isBorderVisible : function(element, boxSide) {
        /// <summary>
        /// Gets whether the current border style for an element on a specific boxSide is not 'none'.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Boolean">
        /// Whether the current border style for an element on a specific boxSide is not 'none'.
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._borderStyleNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return styleValue != "none";
    },
    
    getMargin : function(element, boxSide) {
        /// <summary>
        /// Gets the margin thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Margin thickness on the element's specified side
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._marginWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        try { return this.parsePadding(styleValue); } catch(ex) { return 0; }
    },

    getBorderWidth : function(element, boxSide) {
        /// <summary>
        /// Gets the border thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Border thickness on the element's specified side
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        if(!this.isBorderVisible(element, boxSide)) {
            return 0;
        }        
        var styleName = this._borderWidthNames[boxSide];    
        var styleValue = this.getCurrentStyle(element, styleName);
        return this.parseBorderWidth(styleValue);
    },
    
    getPadding : function(element, boxSide) {
        /// <summary>
        /// Gets the padding thickness of an element on a specific boxSide.
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// DOM element
        /// </param>
        /// <param name="boxSide" type="AjaxControlToolkit.BoxSide">
        /// Side of the element
        /// </param>
        /// <returns type="Number" integer="true">
        /// Padding on the element's specified side
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        if(boxSide < AjaxControlToolkit.BoxSide.Top || boxSide > AjaxControlToolkit.BoxSide.Left) {
            throw Error.argumentOutOfRange(String.format(Sys.Res.enumInvalidValue, boxSide, 'AjaxControlToolkit.BoxSide'));
        }
        var styleName = this._paddingWidthNames[boxSide];
        var styleValue = this.getCurrentStyle(element, styleName);
        return this.parsePadding(styleValue);
    },
    
    parseBorderWidth : function(borderWidth) {
        /// <summary>
        /// Parses a border-width string into a pixel size
        /// </summary>
        /// <param name="borderWidth" type="String" mayBeNull="true">
        /// Type of border ('thin','medium','thick','inherit',px unit,null,'')
        /// </param>
        /// <returns type="Number" integer="true">
        /// Number of pixels in the border-width
        /// </returns>
        if (!this._borderThicknesses) {
            
            // Populate the borderThicknesses lookup table
            var borderThicknesses = { };
            var div0 = document.createElement('div');
            div0.style.visibility = 'hidden';
            div0.style.position = 'absolute';
            div0.style.fontSize = '1px';
            document.body.appendChild(div0)
            var div1 = document.createElement('div');
            div1.style.height = '0px';
            div1.style.overflow = 'hidden';
            div0.appendChild(div1);
            var base = div0.offsetHeight;
            div1.style.borderTop = 'solid black';
            div1.style.borderTopWidth = 'thin';
            borderThicknesses['thin'] = div0.offsetHeight - base;
            div1.style.borderTopWidth = 'medium';
            borderThicknesses['medium'] = div0.offsetHeight - base;
            div1.style.borderTopWidth = 'thick';
            borderThicknesses['thick'] = div0.offsetHeight - base;
            div0.removeChild(div1);
            document.body.removeChild(div0);
            this._borderThicknesses = borderThicknesses;
        }
        
        if (borderWidth) {
            switch(borderWidth) {
                case 'thin':
                case 'medium':
                case 'thick':
                    return this._borderThicknesses[borderWidth];
                case 'inherit':
                    return 0;
            }
            var unit = this.parseUnit(borderWidth);
            Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidBorderWidthUnit, unit.type));
            return unit.size;
        }
        return 0;
    },
    
    parsePadding : function(padding) {
        /// <summary>
        /// Parses a padding string into a pixel size
        /// </summary>
        /// <param name="padding" type="String" mayBeNull="true">
        /// Padding to parse ('inherit',px unit,null,'')
        /// </param>
        /// <returns type="Number" integer="true">
        /// Number of pixels in the padding
        /// </returns>
        
        if(padding) {
            if(padding == 'inherit') {
                return 0;
            }
            var unit = this.parseUnit(padding);
            Sys.Debug.assert(unit.type == 'px', String.format(AjaxControlToolkit.Resources.Common_InvalidPaddingUnit, unit.type));
            return unit.size;
        }
        return 0;
    },
    
    parseUnit : function(value) {
        /// <summary>
        /// Parses a unit string into a unit object
        /// </summary>
        /// <param name="value" type="String" mayBeNull="true">
        /// Value to parse (of the form px unit,% unit,em unit,...)
        /// </param>
        /// <returns type="Object">
        /// Parsed unit (of the form {size,type})
        /// </returns>
        
        if (!value) {
            throw Error.argumentNull('value');
        }
        
        value = value.trim().toLowerCase();
        var l = value.length;
        var s = -1;
        for(var i = 0; i < l; i++) {
            var ch = value.substr(i, 1);
            if((ch < '0' || ch > '9') && ch != '-' && ch != '.' && ch != ',') {
                break;
            }
            s = i;
        }
        if(s == -1) {
            throw Error.create(AjaxControlToolkit.Resources.Common_UnitHasNoDigits);
        }
        var type;
        var size;
        if(s < (l - 1)) {
            type = value.substring(s + 1).trim();
        } else {
            type = 'px';
        }
        size = parseFloat(value.substr(0, s + 1));
        if(type == 'px') {
            size = Math.floor(size);
        }
        return { 
            size: size,
            type: type
        };
    },
    
    getElementOpacity : function(element) {
        /// <summary>
        /// Get the element's opacity
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <returns type="Number">
        /// Opacity of the element
        /// </returns>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        
        var hasOpacity = false;
        var opacity;
        
        if (element.filters) {
            var filters = element.filters;
            if (filters.length !== 0) {
                var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
                if (alphaFilter) {
                    opacity = alphaFilter.opacity / 100.0;
                    hasOpacity = true;
                }
            }
        }
        else {
            opacity = this.getCurrentStyle(element, 'opacity', 1);
            hasOpacity = true;
        }
        
        if (hasOpacity === false) {
            return 1.0;
        }
        return parseFloat(opacity);
    },

    setElementOpacity : function(element, value) {
        /// <summary>
        /// Set the element's opacity
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <param name="value" type="Number">
        /// Opacity of the element
        /// </param>
        
        if (!element) {
            throw Error.argumentNull('element');
        }
        
        if (element.filters) {
            var filters = element.filters;
            var createFilter = true;
            if (filters.length !== 0) {
                var alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
                if (alphaFilter) {
                    createFilter = false;
                    alphaFilter.opacity = value * 100;
                }
            }
            if (createFilter) {
                element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (value * 100) + ')';
            }
        }
        else {
            element.style.opacity = value;
        }
    },
    
    getVisible : function(element) {
        /// <summary>
        /// Check if an element is visible
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <returns type="Boolean" mayBeNull="false">
        /// True if the element is visible, false otherwise
        /// </returns>
        
        // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
        // replace with 'this') because this function will be aliased
        
        return (element &&
                ("none" != $common.getCurrentStyle(element, "display")) &&
                ("hidden" != $common.getCurrentStyle(element, "visibility")));
    },
    
    setVisible : function(element, value) {
        /// <summary>
        /// Check if an element is visible
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement" domElement="true">
        /// Element
        /// </param>
        /// <param name="value" type="Boolean" mayBeNull="false">
        /// True to make the element visible, false to hide it
        /// </param>
        
        // Note: reference to CommonToolkitScripts must be left intact (i.e. don't
        // replace with 'this') because this function will be aliased
        
        if (element && value != $common.getVisible(element)) {
            if (value) {
                if (element.style.removeAttribute) {
                    element.style.removeAttribute("display");
                } else {
                   element.style.removeProperty("display");
                }
            } else {
                element.style.display = 'none';
            }
            element.style.visibility = value ? 'visible' : 'hidden';
        }
    },
    
    resolveFunction : function(value) {
        /// <summary>
        /// Returns a function reference that corresponds to the provided value
        /// </summary>
        /// <param name="value" type="Object">
        /// The value can either be a Function, the name of a function (that can be found using window['name']),
        /// or an expression that evaluates to a function.
        /// </param>
        /// <returns type="Function">
        /// Reference to the function, or null if not found
        /// </returns>
        
        if (value) {
            if (value instanceof Function) {
                return value;
            } else if (String.isInstanceOfType(value) && value.length > 0) {
                var func;
                if ((func = window[value]) instanceof Function) {
                    return func;
                } else if ((func = eval(value)) instanceof Function) {
                    return func;
                }
            }
        }
        return null;
    },

    addCssClasses : function(element, classNames) {
        /// <summary>
        /// Adds multiple css classes to a DomElement
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="classNames" type="Array">The class names to add</param>
        
        for(var i = 0; i < classNames.length; i++) {
            Sys.UI.DomElement.addCssClass(element, classNames[i]);
        }
    },
    removeCssClasses : function(element, classNames) {
        /// <summary>
        /// Removes multiple css classes to a DomElement
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="classNames" type="Array">The class names to remove</param>
        
        for(var i = 0; i < classNames.length; i++) {
            Sys.UI.DomElement.removeCssClass(element, classNames[i]);
        }
    },
    setStyle : function(element, style) {
        /// <summary>
        /// Sets the style of the element using the supplied style template object
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="style" type="Object">The template</param>

        $common.applyProperties(element.style, style);
    },
    removeHandlers : function(element, events) {
        /// <summary>
        /// Removes a set of event handlers from an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to modify</param>
        /// <param name="events" type="Object">The template object that contains event names and delegates</param>
        /// <remarks>
        /// This is NOT the same as $clearHandlers which removes all delegates from a DomElement.  This rather removes select delegates 
        /// from a specified element and has a matching signature as $addHandlers
        /// </remarks>
        for (var name in events) {
            $removeHandler(element, name, events[name]);
        }
    },
    
    overlaps : function(r1, r2) {
        /// <summary>
        /// Determine if two rectangles overlap
        /// </summary>
        /// <param name="r1" type="Object">
        /// Rectangle
        /// </param>
        /// <param name="r2" type="Object">
        /// Rectangle
        /// </param>
        /// <returns type="Boolean">
        /// True if the rectangles overlap, false otherwise
        /// </returns>
        
         return r1.x < (r2.x + r2.width)
                && r2.x < (r1.x + r1.width)
                && r1.y < (r2.y + r2.height)
                && r2.y < (r1.y + r1.height);
    },
    
    containsPoint : function(rect, x, y) {
        /// <summary>
        /// Tests whether a point (x,y) is contained within a rectangle
        /// </summary>
        /// <param name="rect" type="Object">The rectangle</param>
        /// <param name="x" type="Number">The x coordinate of the point</param>
        /// <param name="y" type="Number">The y coordinate of the point</param>
        
        return x >= rect.x && x < (rect.x + rect.width) && y >= rect.y && y < (rect.y + rect.height);
    },

    isKeyDigit : function(keyCode) { 
        /// <summary>
        /// Gets whether the supplied key-code is a digit
        /// </summary>
        /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
        /// <returns type="Boolean" />

        return (0x30 <= keyCode && keyCode <= 0x39); 
    },
    
    isKeyNavigation : function(keyCode) { 
        /// <summary>
        /// Gets whether the supplied key-code is a navigation key
        /// </summary>
        /// <param name="keyCode" type="Number" integer="true">The key code of the event (from Sys.UI.DomEvent)</param>
        /// <returns type="Boolean" />

        return (Sys.UI.Key.left <= keyCode && keyCode <= Sys.UI.Key.down); 
    },
    
    padLeft : function(text, size, ch, truncate) { 
        /// <summary>
        /// Pads the left hand side of the supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
        /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
        /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>
        
        return $common._pad(text, size || 2, ch || ' ', 'l', truncate || false); 
    },
    
    padRight : function(text, size, ch, truncate) { 
        /// <summary>
        /// Pads the right hand side of the supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true" optional="true">The size to pad the text (default is 2)</param>
        /// <param name="ch" type="String" optional="true">The single character to use as the pad character (default is ' ')</param>
        /// <param name="truncate" type="Boolean" optional="true">Whether to truncate the text to size (default is false)</param>

        return $common._pad(text, size || 2, ch || ' ', 'r', truncate || false); 
    },
    
    _pad : function(text, size, ch, side, truncate) {
        /// <summary>
        /// Pads supplied text with the specified pad character up to the requested size
        /// </summary>
        /// <param name="text" type="String">The text to pad</param>
        /// <param name="size" type="Number" integer="true">The size to pad the text</param>
        /// <param name="ch" type="String">The single character to use as the pad character</param>
        /// <param name="side" type="String">Either 'l' or 'r' to siginfy whether to pad the Left or Right side respectively</param>
        /// <param name="truncate" type="Boolean">Whether to truncate the text to size</param>

        text = text.toString();
        var length = text.length;
        var builder = new Sys.StringBuilder();
        if (side == 'r') {
            builder.append(text);
        } 
        while (length < size) {
            builder.append(ch);
            length++;
        }
        if (side == 'l') {
            builder.append(text);
        }
        var result = builder.toString();
        if (truncate && result.length > size) {
            if (side == 'l') {
                result = result.substr(result.length - size, size);
            } else {
                result = result.substr(0, size);
            }
        }
        return result;
    },
    
    __DOMEvents : {
        focusin : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("focusin", true, false, window, 1); } },
        focusout : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("focusout", true, false, window, 1); } },
        activate : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("activate", true, true, window, 1); } },
        focus : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("focus", false, false, window, 1); } },
        blur : { eventGroup : "UIEvents", init : function(e, p) { e.initUIEvent("blur", false, false, window, 1); } },
        click : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("click", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        dblclick : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("click", true, true, window, 2, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mousedown : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mousedown", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseup : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mouseup", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseover : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mouseover", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mousemove : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        mouseout : { eventGroup : "MouseEvents", init : function(e, p) { e.initMouseEvent("mousemove", true, true, window, 1, p.screenX || 0, p.screenY || 0, p.clientX || 0, p.clientY || 0, p.ctrlKey || false, p.altKey || false, p.shiftKey || false, p.metaKey || false, p.button || 0, p.relatedTarget || null); } },
        load : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("load", false, false); } },
        unload : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("unload", false, false); } },
        select : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("select", true, false); } },
        change : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("change", true, false); } },
        submit : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("submit", true, true); } },
        reset : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("reset", true, false); } },
        resize : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("resize", true, false); } },
        scroll : { eventGroup : "HTMLEvents", init : function(e, p) { e.initEvent("scroll", true, false); } }
    },
    
    tryFireRawEvent : function(element, rawEvent) {
        /// <summary>
        /// Attempts to fire a raw DOM event on an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
        /// <param name="rawEvent" type="Object">The raw DOM event object to fire. Must not be Sys.UI.DomEvent</param>
        /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>
        
        try {
            if (element.fireEvent) {
                element.fireEvent("on" + rawEvent.type, rawEvent);
                return true;
            } else if (element.dispatchEvent) {
                element.dispatchEvent(rawEvent);
                return true;
            }
        } catch (e) {
        }
        return false;
    },    

    tryFireEvent : function(element, eventName, properties) {
        /// <summary>
        /// Attempts to fire a DOM event on an element
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to fire the event</param>
        /// <param name="eventName" type="String">The name of the event to fire (without an 'on' prefix)</param>
        /// <param name="properties" type="Object">Properties to add to the event</param>
        /// <returns type="Boolean">True if the event was successfully fired, otherwise false</returns>
        
        try {
            if (document.createEventObject) {
                var e = document.createEventObject();
                $common.applyProperties(e, properties || {});
                element.fireEvent("on" + eventName, e);
                return true;
            } else if (document.createEvent) {
                var def = $common.__DOMEvents[eventName];
                if (def) {
                    var e = document.createEvent(def.eventGroup);
                    def.init(e, properties || {});
                    element.dispatchEvent(e);
                    return true;
                }
            }
        } catch (e) {
        }
        return false;
    },

    wrapElement : function(innerElement, newOuterElement, newInnerParentElement) {
        /// <summary>
        /// Wraps an inner element with a new outer element at the same DOM location as the inner element
        /// </summary>
        /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
        /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
        /// <returns />
        
        var parent = innerElement.parentNode;
        parent.replaceChild(newOuterElement, innerElement);        
        (newInnerParentElement || newOuterElement).appendChild(innerElement);
    },

    unwrapElement : function(innerElement, oldOuterElement) {
        /// <summary>
        /// Unwraps an inner element from an outer element at the same DOM location as the outer element
        /// </summary>
        /// <param name="innerElement" type="Sys.UI.DomElement">The element to be wrapped</param>
        /// <param name="newOuterElement" type="Sys.UI.DomElement">The new parent for the element</param>
        /// <returns />

        var parent = oldOuterElement.parentNode;
        if (parent != null) {
            $common.removeElement(innerElement);
            parent.replaceChild(innerElement, oldOuterElement);
        }
    },
    
    removeElement : function(element) {
        /// <summary>
        /// Removes an element from the DOM tree
        /// </summary>
        /// <param name="element" type="Sys.UI.DomElement">The element to be removed</param>
        /// <returns />

        var parent = element.parentNode;
        if (parent != null) {
            parent.removeChild(element);
        }
    },
 
    applyProperties : function(target, properties) {
        /// <summary>
        /// Quick utility method to copy properties from a template object to a target object
        /// </summary>
        /// <param name="target" type="Object">The object to apply to</param>
        /// <param name="properties" type="Object">The template to copy values from</param>
        
        for (var p in properties) {
            var pv = properties[p];
            if (pv != null && Object.getType(pv)===Object) {
                var tv = target[p];
                $common.applyProperties(tv, pv);
            } else {
                target[p] = pv;
            }
        }
    },
        
    createElementFromTemplate : function(template, appendToParent, nameTable) {
        /// <summary>
        /// Creates an element for the current document based on a template object
        /// </summary>
        /// <param name="template" type="Object">The template from which to create the element</param>
        /// <param name="appendToParent" type="Sys.UI.DomElement" optional="true" mayBeNull="true">A DomElement under which to append this element</param>
        /// <param name="nameTable" type="Object" optional="true" mayBeNull="true">An object to use as the storage for the element using template.name as the key</param>
        /// <returns type="Sys.UI.DomElement" />
        /// <remarks>
        /// This method is useful if you find yourself using the same or similar DomElement constructions throughout a class.  You can even set the templates
        /// as static properties for a type to cut down on overhead.  This method is often called with a JSON style template:
        /// <code>
        /// var elt = $common.createElementFromTemplate({
        ///     nodeName : "div",
        ///     properties : {
        ///         style : {
        ///             height : "100px",
        ///             width : "100px",
        ///             backgroundColor : "white"
        ///         },
        ///         expandoAttribute : "foo"
        ///     },
        ///     events : {
        ///         click : function() { alert("foo"); },
        ///         mouseover : function() { elt.backgroundColor = "silver"; },
        ///         mouseout : function() { elt.backgroundColor = "white"; }
        ///     },
        ///     cssClasses : [ "class0", "class1" ],
        ///     visible : true,
        ///     opacity : .5
        /// }, someParent);
        /// </code>
        /// </remarks>
        
        // if we wish to override the name table we do so here
        if (typeof(template.nameTable)!='undefined') {
            var newNameTable = template.nameTable;
            if (String.isInstanceOfType(newNameTable)) {
                newNameTable = nameTable[newNameTable];
            }
            if (newNameTable != null) {
                nameTable = newNameTable;
            }
        }
        
        // get a name for the element in the nameTable
        var elementName = null;
        if (typeof(template.name)!=='undefined') {
            elementName = template.name;
        }
        
        // create or acquire the element
        var elt = document.createElement(template.nodeName);
        
        // if our element is named, add it to the name table
        if (typeof(template.name)!=='undefined' && nameTable) {
            nameTable[template.name] = elt;
        }
        
        // if we wish to supply a default parent we do so here
        if (typeof(template.parent)!=='undefined' && appendToParent == null) {
            var newParent = template.parent;
            if (String.isInstanceOfType(newParent)) {
                newParent = nameTable[newParent];
            }
            if (newParent != null) {
                appendToParent = newParent;
            }
        }
        
        // properties are applied as expando values to the element
        if (typeof(template.properties)!=='undefined' && template.properties != null) {
            $common.applyProperties(elt, template.properties);
        }
        
        // css classes are added to the element's className property
        if (typeof(template.cssClasses)!=='undefined' && template.cssClasses != null) {
            $common.addCssClasses(elt, template.cssClasses);
        }
        
        // events are added to the dom element using $addHandlers
        if (typeof(template.events)!=='undefined' && template.events != null) {
            $addHandlers(elt, template.events);
        }
        
        // if the element is visible or not its visibility is set
        if (typeof(template.visible)!=='undefined' && template.visible != null) {
            this.setVisible(elt, template.visible);
        }
        
        // if we have an appendToParent we will now append to it
        if (appendToParent) {
            appendToParent.appendChild(elt);
        }

        // if we have opacity, apply it
        if (typeof(template.opacity)!=='undefined' && template.opacity != null) {
            $common.setElementOpacity(elt, template.opacity);
        }
        
        // if we have child templates, process them
        if (typeof(template.children)!=='undefined' && template.children != null) {
            for (var i = 0; i < template.children.length; i++) {
                var subtemplate = template.children[i];
                $common.createElementFromTemplate(subtemplate, elt, nameTable);
            }
        }
        
        // if we have a content presenter for the element get it (the element itself is the default presenter for content)
        var contentPresenter = elt;
        if (typeof(template.contentPresenter)!=='undefined' && template.contentPresenter != null) {
            contentPresenter = nameTable[contentPresenter];
        }
        
        // if we have content, add it
        if (typeof(template.content)!=='undefined' && template.content != null) {
            var content = template.content;
            if (String.isInstanceOfType(content)) {
                content = nameTable[content];
            }
            if (content.parentNode) {
                $common.wrapElement(content, elt, contentPresenter);
            } else {
                contentPresenter.appendChild(content);
            }
        }
        
        // return the created element
        return elt;
    },
    
    prepareHiddenElementForATDeviceUpdate : function () {
        /// <summary>
        /// JAWS, an Assistive Technology device responds to updates to form elements 
        /// and refreshes its document buffer to what is showing live
        /// in the browser. To ensure that Toolkit controls that make XmlHttpRequests to
        /// retrieve content are useful to users with visual disabilities, we update a
        /// hidden form element to ensure that JAWS conveys what is in
        /// the browser. See this article for more details: 
        /// http://juicystudio.com/article/improving-ajax-applications-for-jaws-users.php
        /// This method creates a hidden input on the screen for any page that uses a Toolkit
        /// control that will perform an XmlHttpRequest.
        /// </summary>   
        var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');
        if (!objHidden) {
            var objHidden = document.createElement('input');
            objHidden.setAttribute('type', 'hidden');
            objHidden.setAttribute('value', '1');
            objHidden.setAttribute('id', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
            objHidden.setAttribute('name', 'hiddenInputToUpdateATBuffer_CommonToolkitScripts');
            if ( document.forms[0] ) {
                document.forms[0].appendChild(objHidden);
            }
        }
    },
    
    updateFormToRefreshATDeviceBuffer : function () {
        /// <summary>
        /// Updates the hidden buffer to ensure that the latest document stream is picked up
        /// by the screen reader.
        /// </summary>
        var objHidden = document.getElementById('hiddenInputToUpdateATBuffer_CommonToolkitScripts');

        if (objHidden) {
            if (objHidden.getAttribute('value') == '1') {
                objHidden.setAttribute('value', '0');
            } else {
                objHidden.setAttribute('value', '1');
            }
        }
    }
}

// Create the singleton instance of the CommonToolkitScripts
var CommonToolkitScripts = AjaxControlToolkit.CommonToolkitScripts = new AjaxControlToolkit._CommonToolkitScripts();
var $common = CommonToolkitScripts;

// Alias functions that were moved from BlockingScripts into Common
Sys.UI.DomElement.getVisible = $common.getVisible;
Sys.UI.DomElement.setVisible = $common.setVisible;
Sys.UI.Control.overlaps = $common.overlaps;

AjaxControlToolkit._DomUtility = function() {
    /// <summary>
    /// Utility functions for manipulating the DOM
    /// </summary>
}
AjaxControlToolkit._DomUtility.prototype = {
    isDescendant : function(ancestor, descendant) {
        /// <summary>
        /// Whether the specified element is a descendant of the ancestor
        /// </summary>
        /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
        /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
        /// <returns type="Boolean" />
        
        for (var n = descendant.parentNode; n != null; n = n.parentNode) {
            if (n == ancestor) return true;
        }
        return false;
    },
    isDescendantOrSelf : function(ancestor, descendant) {
        /// <summary>
        /// Whether the specified element is a descendant of the ancestor or the same as the ancestor
        /// </summary>
        /// <param name="ancestor" type="Sys.UI.DomElement">Ancestor node</param>
        /// <param name="descendant" type="Sys.UI.DomElement">Possible descendant node</param>
        /// <returns type="Boolean" />

        if (ancestor === descendant) 
            return true;
        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isAncestor : function(descendant, ancestor) {
        /// <summary>
        /// Whether the specified element is an ancestor of the descendant
        /// </summary>
        /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
        /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
        /// <returns type="Boolean" />

        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isAncestorOrSelf : function(descendant, ancestor) {
        /// <summary>
        /// Whether the specified element is an ancestor of the descendant or the same as the descendant
        /// </summary>
        /// <param name="descendant" type="Sys.UI.DomElement">Descendant node</param>
        /// <param name="ancestor" type="Sys.UI.DomElement">Possible ancestor node</param>
        /// <returns type="Boolean" />
        
        if (descendant === ancestor)
            return true;
            
        return AjaxControlToolkit.DomUtility.isDescendant(ancestor, descendant);
    },
    isSibling : function(self, sibling) {
        /// <summary>
        /// Whether the specified element is a sibling of the self element
        /// </summary>
        /// <param name="self" type="Sys.UI.DomElement">Self node</param>
        /// <param name="sibling" type="Sys.UI.DomElement">Possible sibling node</param>
        /// <returns type="Boolean" />
        
        var parent = self.parentNode;
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] == sibling) return true;
        }
        return false;
    }
}
AjaxControlToolkit._DomUtility.registerClass("AjaxControlToolkit._DomUtility");
AjaxControlToolkit.DomUtility = new AjaxControlToolkit._DomUtility();


AjaxControlToolkit.TextBoxWrapper = function(element) {
    /// <summary>
    /// Class that wraps a TextBox (INPUT type="text") to abstract-out the
    /// presence of a watermark (which may be visible to the user but which
    /// should never be read by script.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.TextBoxWrapper.initializeBase(this, [element]);
    this._current = element.value;
    this._watermark = null;
    this._isWatermarked = false;
}

AjaxControlToolkit.TextBoxWrapper.prototype = {

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        this.get_element().AjaxControlToolkitTextBoxWrapper = null;
        AjaxControlToolkit.TextBoxWrapper.callBaseMethod(this, 'dispose');
    },

    get_Current : function() {
        /// <value type="String">
        /// Current value actually in the TextBox (i.e., TextBox.value)
        /// </value>
        this._current = this.get_element().value;
        return this._current;
    },
    set_Current : function(value) {
        this._current = value;
        this._updateElement();
    },

    get_Value : function() {
        /// <value type="String">
        /// Conceptual "value" of the TextBox - its contents if no watermark is present
        /// or "" if one is
        /// </value>
        if (this.get_IsWatermarked()) {
            return "";
        } else {
            return this.get_Current();
        }
    },
    set_Value : function(text) {
        this.set_Current(text);
        if (!text || (0 == text.length)) {
            if (null != this._watermark) {
                this.set_IsWatermarked(true);
            }
        } else {
            this.set_IsWatermarked(false);
        }
    },

    get_Watermark : function() {
        /// <value type="String">
        /// Text of the watermark for the TextBox
        /// </value>
        return this._watermark;
    },
    set_Watermark : function(value) {
        this._watermark = value;
        this._updateElement();
    },

    get_IsWatermarked : function() {
        /// <value type="Boolean">
        /// true iff the TextBox is watermarked
        /// </value>
        return this._isWatermarked;
    },
    set_IsWatermarked : function(isWatermarked) {
        if (this._isWatermarked != isWatermarked) {
            this._isWatermarked = isWatermarked;
            this._updateElement();
            this._raiseWatermarkChanged();
        }
    },

    _updateElement : function() {
        /// <summary>
        /// Updates the actual contents of the TextBox according to what should be there
        /// </summary>
        var element = this.get_element();
        if (this._isWatermarked) {
            if (element.value != this._watermark) {
                element.value = this._watermark;
            }
        } else {
            if (element.value != this._current) {
                element.value = this._current;
            }
        }
    },

    add_WatermarkChanged : function(handler) {
        /// <summary>
        /// Adds a handler for the WatermarkChanged event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().addHandler("WatermarkChanged", handler);
    },
    remove_WatermarkChanged : function(handler) {
        /// <summary>
        /// Removes a handler for the WatermarkChanged event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().removeHandler("WatermarkChanged", handler);
    },
    _raiseWatermarkChanged : function() {
        /// <summary>
        /// Raises the WatermarkChanged event
        /// </summary>
        var onWatermarkChangedHandler = this.get_events().getHandler("WatermarkChanged");
        if (onWatermarkChangedHandler) {
            onWatermarkChangedHandler(this, Sys.EventArgs.Empty);
        }
    }
}
AjaxControlToolkit.TextBoxWrapper.get_Wrapper = function(element) {
    /// <summary>
    /// Gets (creating one if necessary) the TextBoxWrapper for the specified TextBox
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// TextBox for which to get the wrapper
    /// </param>
    /// <returns type="AjaxControlToolkit.TextBoxWrapper">
    /// TextBoxWrapper instance
    /// </returns>
    if (null == element.AjaxControlToolkitTextBoxWrapper) {
        element.AjaxControlToolkitTextBoxWrapper = new AjaxControlToolkit.TextBoxWrapper(element);
    }
    return element.AjaxControlToolkitTextBoxWrapper;
}
AjaxControlToolkit.TextBoxWrapper.registerClass('AjaxControlToolkit.TextBoxWrapper', Sys.UI.Behavior);

AjaxControlToolkit.TextBoxWrapper.validatorGetValue = function(id) {
    /// <summary>
    /// Wrapper for ASP.NET's validatorGetValue to return the value from the wrapper if present
    /// </summary>
    /// <param name="id" type="String">
    /// id of the element
    /// </param>
    /// <returns type="Object">
    /// Value from the wrapper or result of original ValidatorGetValue
    /// </returns>
    var control = $get(id);
    if (control && control.AjaxControlToolkitTextBoxWrapper) {
        return control.AjaxControlToolkitTextBoxWrapper.get_Value();
    }
    return AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue(id);
}

// Wrap ASP.NET's ValidatorGetValue with AjaxControlToolkit.TextBoxWrapper.validatorGetValue
// to make validators work properly with watermarked TextBoxes
if (typeof(ValidatorGetValue) == 'function') {
    AjaxControlToolkit.TextBoxWrapper._originalValidatorGetValue = ValidatorGetValue;
    ValidatorGetValue = AjaxControlToolkit.TextBoxWrapper.validatorGetValue;
}


// Temporary fix null reference bug in Sys.CultureInfo._getAbbrMonthIndex
if (Sys.CultureInfo.prototype._getAbbrMonthIndex) {
    try {
        Sys.CultureInfo.prototype._getAbbrMonthIndex('');
    } catch(ex) {
        Sys.CultureInfo.prototype._getAbbrMonthIndex = function(value) {
            if (!this._upperAbbrMonths) {
                this._upperAbbrMonths = this._toUpperArray(this.dateTimeFormat.AbbreviatedMonthNames);
            }
            return Array.indexOf(this._upperAbbrMonths, this._toUpper(value));
        }
        Sys.CultureInfo.CurrentCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
        Sys.CultureInfo.InvariantCulture._getAbbrMonthIndex = Sys.CultureInfo.prototype._getAbbrMonthIndex;
    }
}

//END AjaxControlToolkit.Common.Common.js
//START AjaxControlToolkit.ExtenderBase.BaseScripts.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


Type.registerNamespace('AjaxControlToolkit');

// This is the base behavior for all extender behaviors
AjaxControlToolkit.BehaviorBase = function(element) {
    /// <summary>
    /// Base behavior for all extender behaviors
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.BehaviorBase.initializeBase(this,[element]);
    
    this._clientStateFieldID = null;
    this._pageRequestManager = null;
    this._partialUpdateBeginRequestHandler = null;
    this._partialUpdateEndRequestHandler = null;
}
AjaxControlToolkit.BehaviorBase.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>

        // TODO: Evaluate necessity
        AjaxControlToolkit.BehaviorBase.callBaseMethod(this, 'initialize');
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        AjaxControlToolkit.BehaviorBase.callBaseMethod(this, 'dispose');

        if (this._pageRequestManager) {
            if (this._partialUpdateBeginRequestHandler) {
                this._pageRequestManager.remove_beginRequest(this._partialUpdateBeginRequestHandler);
                this._partialUpdateBeginRequestHandler = null;
            }
            if (this._partialUpdateEndRequestHandler) {
                this._pageRequestManager.remove_endRequest(this._partialUpdateEndRequestHandler);
                this._partialUpdateEndRequestHandler = null;
            }
            this._pageRequestManager = null;
        }
    },

    get_ClientStateFieldID : function() {
        /// <value type="String">
        /// ID of the hidden field used to store client state
        /// </value>
        return this._clientStateFieldID;
    },
    set_ClientStateFieldID : function(value) {
        if (this._clientStateFieldID != value) {
            this._clientStateFieldID = value;
            this.raisePropertyChanged('ClientStateFieldID');
        }
    },

    get_ClientState : function() {
        /// <value type="String">
        /// Client state
        /// </value>
        if (this._clientStateFieldID) {
            var input = document.getElementById(this._clientStateFieldID);
            if (input) {
                return input.value;
            }
        }
        return null;
    },
    set_ClientState : function(value) {
        if (this._clientStateFieldID) {
            var input = document.getElementById(this._clientStateFieldID);
            if (input) {
                input.value = value;
            }
        }
    },

    registerPartialUpdateEvents : function() {
        /// <summary>
        /// Register for beginRequest and endRequest events on the PageRequestManager,
        /// (which cause _partialUpdateBeginRequest and _partialUpdateEndRequest to be
        /// called when an UpdatePanel refreshes)
        /// </summary>

        if (Sys && Sys.WebForms && Sys.WebForms.PageRequestManager){
            this._pageRequestManager = Sys.WebForms.PageRequestManager.getInstance();
            if (this._pageRequestManager) {
                this._partialUpdateBeginRequestHandler = Function.createDelegate(this, this._partialUpdateBeginRequest);
                this._pageRequestManager.add_beginRequest(this._partialUpdateBeginRequestHandler);
                this._partialUpdateEndRequestHandler = Function.createDelegate(this, this._partialUpdateEndRequest);
                this._pageRequestManager.add_endRequest(this._partialUpdateEndRequestHandler);
            }
        }
    },

    _partialUpdateBeginRequest : function(sender, beginRequestEventArgs) {
        /// <summary>
        /// Method that will be called when a partial update (via an UpdatePanel) begins,
        /// if registerPartialUpdateEvents() has been called.
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="beginRequestEventArgs" type="Sys.WebForms.BeginRequestEventArgs">
        /// Event arguments
        /// </param>

        // Nothing done here; override this method in a child class
    },
    
    _partialUpdateEndRequest : function(sender, endRequestEventArgs) {
        /// <summary>
        /// Method that will be called when a partial update (via an UpdatePanel) finishes,
        /// if registerPartialUpdateEvents() has been called.
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="endRequestEventArgs" type="Sys.WebForms.EndRequestEventArgs">
        /// Event arguments
        /// </param>

        // Nothing done here; override this method in a child class
    }
}
AjaxControlToolkit.BehaviorBase.registerClass('AjaxControlToolkit.BehaviorBase', Sys.UI.Behavior);


// Dynamically populates content when the populate method is called
AjaxControlToolkit.DynamicPopulateBehaviorBase = function(element) {
    /// <summary>
    /// DynamicPopulateBehaviorBase is used to add DynamicPopulateBehavior funcitonality
    /// to other extenders.  It will dynamically populate the contents of the target element
    /// when its populate method is called.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DynamicPopulateBehaviorBase.initializeBase(this, [element]);
    
    this._DynamicControlID = null;
    this._DynamicContextKey = null;
    this._DynamicServicePath = null;
    this._DynamicServiceMethod = null;
    this._cacheDynamicResults = false;
    this._dynamicPopulateBehavior = null;
    this._populatingHandler = null;
    this._populatedHandler = null;
}
AjaxControlToolkit.DynamicPopulateBehaviorBase.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>

        AjaxControlToolkit.DynamicPopulateBehaviorBase.callBaseMethod(this, 'initialize');

        // Create event handlers
        this._populatingHandler = Function.createDelegate(this, this._onPopulating);
        this._populatedHandler = Function.createDelegate(this, this._onPopulated);
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        // Dispose of event handlers
        if (this._populatedHandler) {
            if (this._dynamicPopulateBehavior) {
                this._dynamicPopulateBehavior.remove_populated(this._populatedHandler);
            }
            this._populatedHandler = null;
        }
        if (this._populatingHandler) {
            if (this._dynamicPopulateBehavior) {
                this._dynamicPopulateBehavior.remove_populating(this._populatingHandler);
            }
            this._populatingHandler = null;
        }

        // Dispose of the placeholder control and behavior
        if (this._dynamicPopulateBehavior) {
            this._dynamicPopulateBehavior.dispose();
            this._dynamicPopulateBehavior = null;
        }
        AjaxControlToolkit.DynamicPopulateBehaviorBase.callBaseMethod(this, 'dispose');
    },

    populate : function(contextKeyOverride) {
        /// <summary>
        /// Demand-create the DynamicPopulateBehavior and use it to populate the target element
        /// </summary>
        /// <param name="contextKeyOverride" type="String" mayBeNull="true" optional="true">
        /// An arbitrary string value to be passed to the web method. For example, if the element to be populated is within a data-bound repeater, this could be the ID of the current row.
        /// </param>

        // If the DynamicPopulateBehavior's element is out of date, dispose of it
        if (this._dynamicPopulateBehavior && (this._dynamicPopulateBehavior.get_element() != $get(this._DynamicControlID))) {
            this._dynamicPopulateBehavior.dispose();
            this._dynamicPopulateBehavior = null;
        }
        
        // If a DynamicPopulateBehavior is not available and the necessary information is, create one
        if (!this._dynamicPopulateBehavior && this._DynamicControlID && this._DynamicServiceMethod) {
            this._dynamicPopulateBehavior = $create(AjaxControlToolkit.DynamicPopulateBehavior,
                {
                    "id" : this.get_id() + "_DynamicPopulateBehavior",
                    "ContextKey" : this._DynamicContextKey,
                    "ServicePath" : this._DynamicServicePath,
                    "ServiceMethod" : this._DynamicServiceMethod,
                    "cacheDynamicResults" : this._cacheDynamicResults
                }, null, null, $get(this._DynamicControlID));

            // Attach event handlers
            this._dynamicPopulateBehavior.add_populating(this._populatingHandler);
            this._dynamicPopulateBehavior.add_populated(this._populatedHandler);
        }
        
        // If a DynamicPopulateBehavior is available, use it to populate the dynamic content
        if (this._dynamicPopulateBehavior) {
            this._dynamicPopulateBehavior.populate(contextKeyOverride ? contextKeyOverride : this._DynamicContextKey);
        }
    },

    _onPopulating : function(sender, eventArgs) {
        /// <summary>
        /// Handler for DynamicPopulate behavior's Populating event
        /// </summary>
        /// <param name="sender" type="Object">
        /// DynamicPopulate behavior
        /// </param>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event args
        /// </param>
        this.raisePopulating(eventArgs);
    },

    _onPopulated : function(sender, eventArgs) {
        /// <summary>
        /// Handler for DynamicPopulate behavior's Populated event
        /// </summary>
        /// <param name="sender" type="Object">
        /// DynamicPopulate behavior
        /// </param>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event args
        /// </param>
        this.raisePopulated(eventArgs);
    },

    get_dynamicControlID : function() {
        /// <value type="String">
        /// ID of the element to populate with dynamic content
        /// </value>
        return this._DynamicControlID;
    },
    get_DynamicControlID : this.get_dynamicControlID,
    set_dynamicControlID : function(value) {
        if (this._DynamicControlID != value) {
            this._DynamicControlID = value;
            this.raisePropertyChanged('dynamicControlID');
            this.raisePropertyChanged('DynamicControlID');
        }
    },
    set_DynamicControlID : this.set_dynamicControlID,

    get_dynamicContextKey : function() {
        /// <value type="String">
        /// An arbitrary string value to be passed to the web method.
        /// For example, if the element to be populated is within a
        /// data-bound repeater, this could be the ID of the current row.
        /// </value>
        return this._DynamicContextKey;
    },
    get_DynamicContextKey : this.get_dynamicContextKey,
    set_dynamicContextKey : function(value) {
        if (this._DynamicContextKey != value) {
            this._DynamicContextKey = value;
            this.raisePropertyChanged('dynamicContextKey');
            this.raisePropertyChanged('DynamicContextKey');
        }
    },
    set_DynamicContextKey : this.set_dynamicContextKey,

    get_dynamicServicePath : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// The URL of the web service to call.  If the ServicePath is not defined, then we will invoke a PageMethod instead of a web service.
        /// </value>
        return this._DynamicServicePath;
    },
    get_DynamicServicePath : this.get_dynamicServicePath,
    set_dynamicServicePath : function(value) {
        if (this._DynamicServicePath != value) {
            this._DynamicServicePath = value;
            this.raisePropertyChanged('dynamicServicePath');
            this.raisePropertyChanged('DynamicServicePath');
        }
    },
    set_DynamicServicePath : this.set_dynamicServicePath,

    get_dynamicServiceMethod : function() {
        /// <value type="String">
        /// The name of the method to call on the page or web service
        /// </value>
        /// <remarks>
        /// The signature of the method must exactly match the following:
        ///     [WebMethod]
        ///     string DynamicPopulateMethod(string contextKey)
        ///     {
        ///         ...
        ///     }
        /// </remarks>
        return this._DynamicServiceMethod;
    },
    get_DynamicServiceMethod : this.get_dynamicServiceMethod,
    set_dynamicServiceMethod : function(value) {
        if (this._DynamicServiceMethod != value) {
            this._DynamicServiceMethod = value;
            this.raisePropertyChanged('dynamicServiceMethod');
            this.raisePropertyChanged('DynamicServiceMethod');
        }
    },
    set_DynamicServiceMethod : this.set_dynamicServiceMethod,
    
    get_cacheDynamicResults : function() {
        /// <value type="Boolean" mayBeNull="false">
        /// Whether the results of the dynamic population should be cached and
        /// not fetched again after the first load
        /// </value>
        return this._cacheDynamicResults;
    },
    set_cacheDynamicResults : function(value) {
        if (this._cacheDynamicResults != value) {
            this._cacheDynamicResults = value;
            this.raisePropertyChanged('cacheDynamicResults');
        }
    },
    
    add_populated : function(handler) {
        /// <summary>
        /// Add a handler on the populated event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().addHandler("populated", handler);
    },
    remove_populated : function(handler) {
        /// <summary>
        /// Remove a handler from the populated event
        /// </summary>
        /// <param name="handler" type="Function">
        /// Handler
        /// </param>
        this.get_events().removeHandler("populated", handler);
    },
    raisePopulated : function(arg) {
        /// <summary>
        /// Raise the populated event
        /// </summary>
        /// <param name="arg" type="Sys.EventArgs">
        /// Event arguments
        /// </param>
        var handler = this.get_events().getHandler("populated");  
        if (handler) handler(this, arg);
    },
    
    add_populating : function(handler) {
        /// <summary>
        /// Add an event handler for the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('populating', handler);
    },
    remove_populating : function(handler) {
        /// <summary>
        /// Remove an event handler from the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('populating', handler);
    },
    raisePopulating : function(eventArgs) {
        /// <summary>
        /// Raise the populating event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the populating event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('populating');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.DynamicPopulateBehaviorBase.registerClass('AjaxControlToolkit.DynamicPopulateBehaviorBase', AjaxControlToolkit.BehaviorBase);


AjaxControlToolkit.ControlBase = function(element) {
    AjaxControlToolkit.ControlBase.initializeBase(this, [element]);
    this._clientStateField = null;
    this._callbackTarget = null;
    this._onsubmit$delegate = Function.createDelegate(this, this._onsubmit);
    this._oncomplete$delegate = Function.createDelegate(this, this._oncomplete);
    this._onerror$delegate = Function.createDelegate(this, this._onerror);
}
AjaxControlToolkit.ControlBase.prototype = {
    initialize : function() {
        AjaxControlToolkit.ControlBase.callBaseMethod(this, "initialize");
        // load the client state if possible
        if (this._clientStateField) {
            this.loadClientState(this._clientStateField.value);
        }
        // attach an event to save the client state before a postback or updatepanel partial postback
        if (typeof(Sys.WebForms)!=="undefined" && typeof(Sys.WebForms.PageRequestManager)!=="undefined") {
            Array.add(Sys.WebForms.PageRequestManager.getInstance()._onSubmitStatements, this._onsubmit$delegate);
        } else {
            $addHandler(document.forms[0], "submit", this._onsubmit$delegate);
        }
    },
    dispose : function() {
        if (typeof(Sys.WebForms)!=="undefined" && typeof(Sys.WebForms.PageRequestManager)!=="undefined") {
            Array.remove(Sys.WebForms.PageRequestManager.getInstance()._onSubmitStatements, this._onsubmit$delegate);
        } else {
            $removeHandler(document.forms[0], "submit", this._onsubmit$delegate);
        }
        AjaxControlToolkit.ControlBase.callBaseMethod(this, "dispose");
    },
    findElement : function(id) {
        // <summary>Finds an element within this control (ScriptControl/ScriptUserControl are NamingContainers);
        return $get(this.get_id() + '_' + id.split(':').join('_'));
    },
    get_clientStateField : function() {
        return this._clientStateField;
    },
    set_clientStateField : function(value) {
        if (this.get_isInitialized()) throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_CannotSetClientStateField);
        if (this._clientStateField != value) {
            this._clientStateField = value;
            this.raisePropertyChanged('clientStateField');
        }
    },
    loadClientState : function(value) {
        /// <remarks>override this method to intercept client state loading after a callback</remarks>
    },
    saveClientState : function() {
        /// <remarks>override this method to intercept client state acquisition before a callback</remarks>
        return null;
    },
    _invoke : function(name, args, cb) {
        /// <summary>invokes a callback method on the server control</summary>        
        if (!this._callbackTarget) {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_ControlNotRegisteredForCallbacks);
        }
        if (typeof(WebForm_DoCallback)==="undefined") {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_PageNotRegisteredForCallbacks);
        }
        var ar = [];
        for (var i = 0; i < args.length; i++) 
            ar[i] = args[i];
        var clientState = this.saveClientState();
        if (clientState != null && !String.isInstanceOfType(clientState)) {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.ExtenderBase_InvalidClientStateType);
        }
        var payload = Sys.Serialization.JavaScriptSerializer.serialize({name:name,args:ar,state:this.saveClientState()});
        WebForm_DoCallback(this._callbackTarget, payload, this._oncomplete$delegate, cb, this._onerror$delegate, true);
    },
    _oncomplete : function(result, context) {
        result = Sys.Serialization.JavaScriptSerializer.deserialize(result);
        if (result.error) {
            throw Error.create(result.error);
        }
        this.loadClientState(result.state);
        context(result.result);
    },
    _onerror : function(message, context) {
        throw Error.create(message);
    },
    _onsubmit : function() {
        if (this._clientStateField) {
            this._clientStateField.value = this.saveClientState();
        }
        return true;
    }    
   
}
AjaxControlToolkit.ControlBase.registerClass("AjaxControlToolkit.ControlBase", Sys.UI.Control);

AjaxControlToolkit.Resources={
"PasswordStrength_InvalidWeightingRatios":"Strength Weighting ratios must have 4 elements","Animation_ChildrenNotAllowed":"AjaxControlToolkit.Animation.createAnimation cannot add child animations to type \"{0}\" that does not derive from AjaxControlToolkit.Animation.ParentAnimation","PasswordStrength_RemainingSymbols":"{0} symbol characters","ExtenderBase_CannotSetClientStateField":"clientStateField can only be set before initialization","RTE_PreviewHTML":"Preview HTML","RTE_JustifyCenter":"Justify Center","PasswordStrength_RemainingUpperCase":"{0} more upper case characters","Animation_TargetNotFound":"AjaxControlToolkit.Animation.Animation.set_animationTarget requires the ID of a Sys.UI.DomElement or Sys.UI.Control.  No element or control could be found corresponding to \"{0}\"","RTE_FontColor":"Font Color","RTE_LabelColor":"Label Color","Common_InvalidBorderWidthUnit":"A unit type of \"{0}\"\u0027 is invalid for parseBorderWidth","RTE_Heading":"Heading","Tabs_PropertySetBeforeInitialization":"{0} cannot be changed before initialization","RTE_OrderedList":"Ordered List","ReorderList_DropWatcherBehavior_NoChild":"Could not find child of list with id \"{0}\"","CascadingDropDown_MethodTimeout":"[Method timeout]","RTE_Columns":"Columns","RTE_InsertImage":"Insert Image","RTE_InsertTable":"Insert Table","RTE_Values":"Values","RTE_OK":"OK","ExtenderBase_PageNotRegisteredForCallbacks":"This Page has not been registered for callbacks","Animation_NoDynamicPropertyFound":"AjaxControlToolkit.Animation.createAnimation found no property corresponding to \"{0}\" or \"{1}\"","Animation_InvalidBaseType":"AjaxControlToolkit.Animation.registerAnimation can only register types that inherit from AjaxControlToolkit.Animation.Animation","RTE_UnorderedList":"Unordered List","ResizableControlBehavior_InvalidHandler":"{0} handler not a function, function name, or function text","Animation_InvalidColor":"Color must be a 7-character hex representation (e.g. #246ACF), not \"{0}\"","RTE_CellColor":"Cell Color","PasswordStrength_RemainingMixedCase":"Mixed case characters","RTE_Italic":"Italic","CascadingDropDown_NoParentElement":"Failed to find parent element \"{0}\"","ValidatorCallout_DefaultErrorMessage":"This control is invalid","RTE_Indent":"Indent","ReorderList_DropWatcherBehavior_CallbackError":"Reorder failed, see details below.\\r\\n\\r\\n{0}","PopupControl_NoDefaultProperty":"No default property supported for control \"{0}\" of type \"{1}\"","RTE_Normal":"Normal","PopupExtender_NoParentElement":"Couldn\u0027t find parent element \"{0}\"","RTE_ViewValues":"View Values","RTE_Legend":"Legend","RTE_Labels":"Labels","RTE_CellSpacing":"Cell Spacing","PasswordStrength_RemainingNumbers":"{0} more numbers","RTE_Border":"Border","RTE_Create":"Create","RTE_BackgroundColor":"Background Color","RTE_Cancel":"Cancel","RTE_JustifyFull":"Justify Full","RTE_JustifyLeft":"Justify Left","RTE_Cut":"Cut","ResizableControlBehavior_CannotChangeProperty":"Changes to {0} not supported","RTE_ViewSource":"View Source","Common_InvalidPaddingUnit":"A unit type of \"{0}\" is invalid for parsePadding","RTE_Paste":"Paste","ExtenderBase_ControlNotRegisteredForCallbacks":"This Control has not been registered for callbacks","Calendar_Today":"Today: {0}","Common_DateTime_InvalidFormat":"Invalid format","ListSearch_DefaultPrompt":"Type to search","CollapsiblePanel_NoControlID":"Failed to find element \"{0}\"","RTE_ViewEditor":"View Editor","RTE_BarColor":"Bar Color","PasswordStrength_DefaultStrengthDescriptions":"NonExistent;Very Weak;Weak;Poor;Almost OK;Barely Acceptable;Average;Good;Strong;Excellent;Unbreakable!","RTE_Inserttexthere":"Insert text here","Animation_UknownAnimationName":"AjaxControlToolkit.Animation.createAnimation could not find an Animation corresponding to the name \"{0}\"","ExtenderBase_InvalidClientStateType":"saveClientState must return a value of type String","Rating_CallbackError":"An unhandled exception has occurred:\\r\\n{0}","Tabs_OwnerExpected":"owner must be set before initialize","DynamicPopulate_WebServiceTimeout":"Web service call timed out","PasswordStrength_RemainingLowerCase":"{0} more lower case characters","Animation_MissingAnimationName":"AjaxControlToolkit.Animation.createAnimation requires an object with an AnimationName property","RTE_JustifyRight":"Justify Right","Tabs_ActiveTabArgumentOutOfRange":"Argument is not a member of the tabs collection","RTE_CellPadding":"Cell Padding","RTE_ClearFormatting":"Clear Formatting","AlwaysVisible_ElementRequired":"AjaxControlToolkit.AlwaysVisibleControlBehavior must have an element","Slider_NoSizeProvided":"Please set valid values for the height and width attributes in the slider\u0027s CSS classes","DynamicPopulate_WebServiceError":"Web Service call failed: {0}","PasswordStrength_StrengthPrompt":"Strength: ","PasswordStrength_RemainingCharacters":"{0} more characters","PasswordStrength_Satisfied":"Nothing more required","RTE_Hyperlink":"Hyperlink","Animation_NoPropertyFound":"AjaxControlToolkit.Animation.createAnimation found no property corresponding to \"{0}\"","PasswordStrength_InvalidStrengthDescriptionStyles":"Text Strength description style classes must match the number of text descriptions.","PasswordStrength_GetHelpRequirements":"Get help on password requirements","PasswordStrength_InvalidStrengthDescriptions":"Invalid number of text strength descriptions specified","RTE_Underline":"Underline","Tabs_PropertySetAfterInitialization":"{0} cannot be changed after initialization","RTE_Rows":"Rows","RTE_Redo":"Redo","RTE_Size":"Size","RTE_Undo":"Undo","RTE_Bold":"Bold","RTE_Copy":"Copy","RTE_Font":"Font","CascadingDropDown_MethodError":"[Method error {0}]","RTE_BorderColor":"Border Color","RTE_Paragraph":"Paragraph","RTE_InsertHorizontalRule":"Insert Horizontal Rule","Common_UnitHasNoDigits":"No digits","RTE_Outdent":"Outdent","Common_DateTime_InvalidTimeSpan":"\"{0}\" is not a valid TimeSpan format","Animation_CannotNestSequence":"AjaxControlToolkit.Animation.SequenceAnimation cannot be nested inside AjaxControlToolkit.Animation.ParallelAnimation","Shared_BrowserSecurityPreventsPaste":"Your browser security settings don\u0027t permit the automatic execution of paste operations. Please use the keyboard shortcut Ctrl+V instead."};
//END AjaxControlToolkit.ExtenderBase.BaseScripts.js
//START AjaxControlToolkit.Tabs.Tabs.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../DynamicPopulate/DynamicPopulateBehavior.js" />


Type.registerNamespace("AjaxControlToolkit");

AjaxControlToolkit.ScrollBars = function() { }
AjaxControlToolkit.ScrollBars.prototype = {
    None : 0x00,
    Horizontal : 0x01,
    Vertical : 0x02,
    Both : 0x03,
    Auto : 0x04
}
AjaxControlToolkit.ScrollBars.registerEnum("AjaxControlToolkit.ScrollBars", true);

AjaxControlToolkit.TabContainer = function(element) {
    AjaxControlToolkit.TabContainer.initializeBase(this, [element]);    
    this._cachedActiveTabIndex = -1;
    this._activeTabIndex = -1;
    this._scrollBars = AjaxControlToolkit.ScrollBars.None;
    this._tabs = null;
    this._header = null;
    this._body = null;
    this._loaded = false;
    this._autoPostBackId = null;
    this._app_onload$delegate = Function.createDelegate(this, this._app_onload);
}
AjaxControlToolkit.TabContainer.prototype = {

    add_activeTabChanged : function(handler) {
        this.get_events().addHandler("activeTabChanged", handler);
    },
    remove_activeTabChanged : function(handler) {
        this.get_events().removeHandler("activeTabChanged", handler);
    },
    raiseActiveTabChanged : function() {
        var eh = this.get_events().getHandler("activeTabChanged");
        if (eh) {
            eh(this, Sys.EventArgs.Empty);
        }
        if (this._autoPostBackId) {
            __doPostBack(this._autoPostBackId, "activeTabChanged:" + this.get_activeTabIndex());
        }
    },

    get_activeTabIndex : function() { 
        if (this._cachedActiveTabIndex > -1) {
            return this._cachedActiveTabIndex;
        }
        return this._activeTabIndex; 
    },
    set_activeTabIndex : function(value) {
        if (!this.get_isInitialized()) {
            this._cachedActiveTabIndex = value;
        } else {
        
            if (value < -1 || value >= this.get_tabs().length) {
                throw Error.argumentOutOfRange("value");
            }
            if (this._activeTabIndex != -1) {
                this.get_tabs()[this._activeTabIndex]._set_active(false);
            }
            this._activeTabIndex = value;
            if (this._activeTabIndex != -1) {
                this.get_tabs()[this._activeTabIndex]._set_active(true);
            }
            if (this._loaded) {
                this.raiseActiveTabChanged();
            }
            this.raisePropertyChanged("activeTabIndex");
        }
    },
    
    get_tabs : function() { 
        if (this._tabs == null) {
            this._tabs = [];
        }
        return this._tabs; 
    },
    
    get_activeTab : function() {
        if (this._activeTabIndex > -1) {
            return this.get_tabs()[this._activeTabIndex];
        }
        return null;
    },
    set_activeTab : function(value) {
        var i = Array.indexOf(this.get_tabs(), value);
        if (i == -1) {
            throw Error.argument("value", AjaxControlToolkit.Resources.Tabs_ActiveTabArgumentOutOfRange);
        }
        this.set_activeTabIndex(i);
    },
    
    get_autoPostBackId : function() {
        return this._autoPostBackId;
    },
    set_autoPostBackId : function(value) {
        this._autoPostBackId = value;
    },    
    get_scrollBars : function() { 
        return this._scrollBars; 
    },
    set_scrollBars : function(value) { 
        if (this._scrollBars != value) {
            this._scrollBars = value; 
            this._invalidate();
            this.raisePropertyChanged("scrollBars");
        }
    },
    
    initialize : function() {
        AjaxControlToolkit.TabContainer.callBaseMethod(this, "initialize");
        
        var elt = this.get_element();
        var header = this._header = $get(this.get_id() + "_header");
        var body = this._body = $get(this.get_id() + "_body");

        // default classes
        $common.addCssClasses(elt, [
            "ajax__tab_container",
            "ajax__tab_default"
        ]);
        Sys.UI.DomElement.addCssClass(header, "ajax__tab_header");
        Sys.UI.DomElement.addCssClass(body, "ajax__tab_body");
        
        this._invalidate();
        
        Sys.Application.add_load(this._app_onload$delegate);
    },
    dispose : function() {
        Sys.Application.remove_load(this._app_onload$delegate);
        AjaxControlToolkit.TabContainer.callBaseMethod(this, "dispose");
    },
    getFirstTab : function(includeDisabled) {
        var tabs = this.get_tabs();
        for(var i = 0; i < tabs.length; i++) {
            if (includeDisabled || tabs[i].get_enabled()) {
                return tabs[i];
            }
        }
        return null;
    },
    getLastTab : function(includeDisabled) {
        var tabs = this.get_tabs();
        for(var i = tabs.length -1; i >= 0; i--) {
            if (includeDisabled || tabs[i].get_enabled()) {
                return tabs[i];
            }
        }
        return null;
    },
    getNextTab : function(includeDisabled) {
        var tabs = this.get_tabs();
        var active = this.get_activeTabIndex();
        for (var i = 1; i < tabs.length; i++) {
            var tabIndex = (active + i) % tabs.length;
            var tab = tabs[tabIndex];
            if (includeDisabled || tab.get_enabled()) 
                return tab;
        }
        return null;
    },
    getPreviousTab : function(includeDisabled) {
        var tabs = this.get_tabs();
        var active = this.get_activeTabIndex();
        for (var i = 1; i < tabs.length; i++) {
            var tabIndex = (tabs.length + (active - i)) % tabs.length;
            var tab = tabs[tabIndex];
            if (includeDisabled || tab.get_enabled()) 
              return tab;
        }
        return null;
    },
    getNearestTab : function() {
        var prev = this.getPreviousTab(false);
        var next = this.getNextTab(false);
        if (prev && prev.get_tabIndex() < this._activeTabIndex) {
            return prev;
        } else if(next && next.get_tabIndex() > this._activeTabIndex) {
            return next;
        }
        return null;
    },
    saveClientState : function() {
        var tabs = this.get_tabs();
        var tabState = [];
        for(var i = 0; i < tabs.length; i++) {
            Array.add(tabState, tabs[i].get_enabled());
        }        
        var state = {
            ActiveTabIndex:this._activeTabIndex,
            TabState:tabState
        };
        return Sys.Serialization.JavaScriptSerializer.serialize(state);
    },
    _invalidate : function() {
        if (this.get_isInitialized()) {
            $common.removeCssClasses(this._body, [
                "ajax__scroll_horiz",
                "ajax__scroll_vert",
                "ajax__scroll_both",
                "ajax__scroll_auto"
            ]);
            switch (this._scrollBars) {
                case AjaxControlToolkit.ScrollBars.Horizontal: 
                    Sys.UI.DomElement.addCssClass(this._body, "ajax__scroll_horiz"); 
                    break;
                case AjaxControlToolkit.ScrollBars.Vertical: 
                    Sys.UI.DomElement.addCssClass(this._body, "ajax__scroll_vert"); 
                    break;
                case AjaxControlToolkit.ScrollBars.Both: 
                    Sys.UI.DomElement.addCssClass(this._body, "ajax__scroll_both"); 
                    break;
                case AjaxControlToolkit.ScrollBars.Auto: 
                    Sys.UI.DomElement.addCssClass(this._body, "ajax__scroll_auto"); 
                    break;
            }
        }
    },
    _app_onload : function(sender, e) {
        if (this._cachedActiveTabIndex != -1) {
            this.set_activeTabIndex(this._cachedActiveTabIndex);
            this._cachedActiveTabIndex = -1;
        }        
        this._loaded = true;
    }
}
AjaxControlToolkit.TabContainer.registerClass("AjaxControlToolkit.TabContainer", AjaxControlToolkit.ControlBase);

AjaxControlToolkit.TabPanel = function(element) {
    AjaxControlToolkit.TabPanel.initializeBase(this, [element]);
    this._active = false;
    this._tab = null;
    this._headerOuter = null;
    this._headerInner = null;
    this._header = null;
    this._owner = null;
    this._enabled = true;
    this._tabIndex = -1;
    this._dynamicContextKey = null;
    this._dynamicServicePath = null;
    this._dynamicServiceMethod = null;
    this._dynamicPopulateBehavior = null;
    this._scrollBars = AjaxControlToolkit.ScrollBars.None;    
    this._header_onclick$delegate = Function.createDelegate(this, this._header_onclick);
    this._header_onmouseover$delegate = Function.createDelegate(this, this._header_onmouseover);
    this._header_onmouseout$delegate = Function.createDelegate(this, this._header_onmouseout);
    this._header_onmousedown$delegate = Function.createDelegate(this, this._header_onmousedown);
    this._dynamicPopulate_onpopulated$delegate = Function.createDelegate(this, this._dynamicPopulate_onpopulated);
    this._oncancel$delegate = Function.createDelegate(this, this._oncancel);
}
AjaxControlToolkit.TabPanel.prototype = {
    
    add_click : function(handler) {
        this.get_events().addHandler("click", handler);
    },
    remove_click : function(handler) {
        this.get_events().removeHandler("click", handler);
    },
    raiseClick : function() {
        var eh = this.get_events().getHandler("click");
        if (eh) {
            eh(this, Sys.EventArgs.Empty);
        }
    },
    
    add_populating : function(handler) {
        this.get_events().addHandler("populating", handler);
    },
    remove_populating : function(handler) {
        this.get_events().removeHandler("populating", handler);
    },
    raisePopulating : function() {
        var eh = this.get_events().getHandler("populating");
        if (eh) {
            eh(this, Sys.EventArgs.Empty);
        }
    },

    add_populated : function(handler) {
        this.get_events().addHandler("populated", handler);
    },
    remove_populated : function(handler) {
        this.get_events().removeHandler("populated", handler);
    },
    raisePopulated : function() {
        var eh = this.get_events().getHandler("populated");
        if (eh) {
            eh(this, Sys.EventArgs.Empty);
        }
    },
    
    get_headerText : function() { 
        if (this.get_isInitialized()) {
            return this._header.innerHTML;
        }
        return ""; 
    },
    set_headerText : function(value) { 
        if (!this.get_isInitialized()) {
            throw Error.invalidOperation(String.format(AjaxControlToolkit.Resources.Tabs_PropertySetBeforeInitialization, 'headerText'));
        }
        if (this._headerText != value) {
            this._headerTab.innerHTML = value;
            this.raisePropertyChanged("headerText");
        }
    },
    
    get_headerTab : function() {
        return this._header;
    },
    set_headerTab : function(value) {
        if (this._header != value) {
            if (this.get_isInitialized()) {
                throw Error.invalidOperation(String.format(AjaxControlToolkit.Resources.Tabs_PropertySetAfterInitialization, 'headerTab'));
            }
            this._header = value;
            this.raisePropertyChanged("value");
        }
    },
        
    get_enabled : function() {
        return this._enabled;
    },
    set_enabled : function(value) {
        if (value != this._enabled) {
            this._enabled = value;
            if (this.get_isInitialized()) {
                if (!this._enabled) {
                    this._hide();
                } else {
                    this._show();
                }
            }
            this.raisePropertyChanged("enabled");
        }
    },
    
    get_owner : function() {
        return this._owner;
    },
    set_owner : function(value) {
        if (this._owner != value) {
            if (this.get_isInitialized()) {
                throw Error.invalidOperation(String.format(AjaxControlToolkit.Resources.Tabs_PropertySetAfterInitialization, 'owner'));
            }
            this._owner = value;
            this.raisePropertyChanged("owner");
        }
    },
    
    get_scrollBars : function() {
        return this._scrollBars;
    },
    set_scrollBars : function(value) {
        if (this._scrollBars != value) {
            this._scrollBars = value;
            this.raisePropertyChanged("scrollBars");
        }
    },
    
    get_tabIndex : function() {
        return this._tabIndex;
    },
    
    get_dynamicContextKey : function() {
        return this._dynamicContextKey;
    },
    set_dynamicContextKey : function(value) {
        if (this._dynamicContextKey != value) {
            this._dynamicContextKey = value;
            this.raisePropertyChanged('dynamicContextKey');
        }
    },

    get_dynamicServicePath : function() {
        return this._dynamicServicePath;
    },
    set_dynamicServicePath : function(value) {
        if (this._dynamicServicePath != value) {
            this._dynamicServicePath = value;
            this.raisePropertyChanged('dynamicServicePath');
        }
    },

    get_dynamicServiceMethod : function() {
        return this._dynamicServiceMethod;
    },
    set_dynamicServiceMethod : function(value) {
        if (this._dynamicServiceMethod != value) {
            this._dynamicServiceMethod = value;
            this.raisePropertyChanged('dynamicServiceMethod');
        }
    },

    _get_active : function() { 
        return this._active; 
    },
    _set_active : function(value) { 
        this._active = value; 
        if (value) 
            this._activate(); 
        else 
            this._deactivate();
    },
    
    initialize : function() {
        AjaxControlToolkit.TabPanel.callBaseMethod(this, "initialize");
        
        var owner = this.get_owner();
        if (!owner) {
            throw Error.invalidOperation(AjaxControlToolkit.Resources.Tabs_OwnerExpected);
        }
        
        this._tabIndex = owner.get_tabs().length;
        
        Array.add(owner.get_tabs(), this);
        
        this._headerOuterWrapper = document.createElement('span');
        this._headerInnerWrapper = document.createElement('span');
        this._tab = document.createElement('span');
        this._tab.id = this.get_id() + "_tab";
        this._header.parentNode.replaceChild(this._tab, this._header);
        this._tab.appendChild(this._headerOuterWrapper);
        this._headerOuterWrapper.appendChild(this._headerInnerWrapper);
        this._headerInnerWrapper.appendChild(this._header);
        $addHandlers(this._header, {
            click:this._header_onclick$delegate,
            mouseover:this._header_onmouseover$delegate,
            mouseout:this._header_onmouseout$delegate,
            mousedown:this._header_onmousedown$delegate,
            dragstart:this._oncancel$delegate,
            selectstart:this._oncancel$delegate,
            select:this._oncancel$delegate
        });
        Sys.UI.DomElement.addCssClass(this._headerOuterWrapper, "ajax__tab_outer");
        Sys.UI.DomElement.addCssClass(this._headerInnerWrapper, "ajax__tab_inner");
        Sys.UI.DomElement.addCssClass(this._header, "ajax__tab_tab");
        Sys.UI.DomElement.addCssClass(this.get_element(), "ajax__tab_panel");

        if (!this._enabled) {
            this._hide();
        }
    },
    
    dispose : function() {    
        if (this._dynamicPopulateBehavior) {
            this._dynamicPopulateBehavior.dispose();
            this._dynamicPopulateBehavior = null;
        }
        $common.removeHandlers(this._header, {
            click:this._header_onclick$delegate,
            mouseover:this._header_onmouseover$delegate,
            mouseout:this._header_onmouseout$delegate,
            mousedown:this._header_onmousedown$delegate,
            dragstart:this._oncancel$delegate,
            selectstart:this._oncancel$delegate,
            select:this._oncancel$delegate
        });
        AjaxControlToolkit.TabPanel.callBaseMethod(this, "dispose");
    },

    populate : function(contextKeyOverride) {
        if (this._dynamicPopulateBehavior && (this._dynamicPopulateBehavior.get_element() != this.get_element())) {
            this._dynamicPopulateBehavior.dispose();
            this._dynamicPopulateBehavior = null;
        }
        if (!this._dynamicPopulateBehavior && this._dynamicServiceMethod) {
            this._dynamicPopulateBehavior = $create(AjaxControlToolkit.DynamicPopulateBehavior,{"ContextKey":this._dynamicContextKey,"ServicePath":this._dynamicServicePath,"ServiceMethod":this._dynamicServiceMethod}, {"populated":this._dynamicPopulate_onpopulated$delegate}, null, this.get_element());
        }
        if(this._dynamicPopulateBehavior) {
            this.raisePopulating();
            this._dynamicPopulateBehavior.populate(contextKeyOverride ? contextKeyOverride : this._dynamicContextKey);
        }
    },

    _activate : function() {
        var elt = this.get_element();
        $common.setVisible(elt, true);
        Sys.UI.DomElement.addCssClass(this._tab, "ajax__tab_active");
        
        this.populate();
        
        this._show();
        
        this._owner.get_element().style.visibility = 'visible';
    },
    _deactivate : function() {
        var elt = this.get_element();
        $common.setVisible(elt, false);
        Sys.UI.DomElement.removeCssClass(this._tab, "ajax__tab_active");
    },
    _show : function() {
        this._tab.style.display = '';
    },
    _hide : function() {
        this._tab.style.display = 'none';
        if (this._get_active()) {
            var next = this._owner.getNearestTab(false);
            if (!!next) {
                this._owner.set_activeTab(next);
            }
        }
        this._deactivate();
    },
    _header_onclick : function(e) {
        this.raiseClick();
        this.get_owner().set_activeTab(this);
    },
    _header_onmouseover : function(e) {
        Sys.UI.DomElement.addCssClass(this._tab, "ajax__tab_hover");
    },
    _header_onmouseout : function(e) {
        Sys.UI.DomElement.removeCssClass(this._tab, "ajax__tab_hover");
    },
    _header_onmousedown : function(e) {
        e.preventDefault();
    },
    _oncancel : function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    _dynamicPopulate_onpopulated : function(sender, e) {
        this.raisePopulated();
    }
}
AjaxControlToolkit.TabPanel.registerClass("AjaxControlToolkit.TabPanel", Sys.UI.Control);

//END AjaxControlToolkit.Tabs.Tabs.js
//START AjaxControlToolkit.DynamicPopulate.DynamicPopulateBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.DynamicPopulateBehavior = function(element) {
    /// <summary>
    /// The DynamicPopulateBehavior replaces the contents of an element with the result of a web service or page method call.  The method call returns a string of HTML that is inserted as the children of the target element.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DynamicPopulateBehavior.initializeBase(this, [element]);
    
    this._servicePath = null;
    this._serviceMethod = null;
    this._contextKey = null;
    this._cacheDynamicResults = false;
    this._populateTriggerID = null;
    this._setUpdatingCssClass = null;
    this._clearDuringUpdate = true;
    this._customScript = null;
    
    this._clickHandler = null;
    
    this._callID = 0;
    this._currentCallID = -1;
    
    // Whether or not we've already populated (used for cacheDynamicResults)
    this._populated = false;
}
AjaxControlToolkit.DynamicPopulateBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.DynamicPopulateBehavior.callBaseMethod(this, 'initialize');
        $common.prepareHiddenElementForATDeviceUpdate();        
    
        // hook up the trigger if we have one.
        if (this._populateTriggerID) {
            var populateTrigger = $get(this._populateTriggerID);
            if (populateTrigger) {
                this._clickHandler = Function.createDelegate(this, this._onPopulateTriggerClick);
                $addHandler(populateTrigger, "click", this._clickHandler);
            }
        }
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        // clean up the trigger event.
        if (this._populateTriggerID && this._clickHandler) {
            var populateTrigger = $get(this._populateTriggerID);
            if (populateTrigger) {
                $removeHandler(populateTrigger, "click", this._clickHandler);
            }
            this._populateTriggerID = null;
            this._clickHandler = null;
        }
       
        AjaxControlToolkit.DynamicPopulateBehavior.callBaseMethod(this, 'dispose');
    },
    
    populate : function(contextKey) {
        /// <summary>
        /// Get the dymanic content and use it to populate the target element
        /// </summary>
        /// <param name="contextKey" type="String" mayBeNull="true" optional="true">
        /// An arbitrary string value to be passed to the web method. For example, if the element to be
        /// populated is within a data-bound repeater, this could be the ID of the current row.
        /// </param>
        
        // Don't populate if we already cached the results
        if (this._populated && this._cacheDynamicResults) {
            return;
        }

        // Initialize the population if this is the very first call
        if (this._currentCallID == -1) {
            var eventArgs = new Sys.CancelEventArgs();
            this.raisePopulating(eventArgs);
            if (eventArgs.get_cancel()) {
                return;
            }
            this._setUpdating(true);
        }
        
        // Either run the custom population script or invoke the web service
        if (this._customScript) {
            // Call custom javascript call to populate control
            var scriptResult = eval(this._customScript);
            this.get_element().innerHTML = scriptResult; 
            this._setUpdating(false);
         } else {
             this._currentCallID = ++this._callID;
             if (this._servicePath && this._serviceMethod) {
                Sys.Net.WebServiceProxy.invoke(this._servicePath, this._serviceMethod, false,
                    { contextKey:(contextKey ? contextKey : this._contextKey) },
                    Function.createDelegate(this, this._onMethodComplete), Function.createDelegate(this, this._onMethodError),
                    this._currentCallID);
                $common.updateFormToRefreshATDeviceBuffer();
             }
        }
    },

    _onMethodComplete : function (result, userContext, methodName) {
        /// <summary>
        /// Callback used when the populating service returns successfully
        /// </summary>
        /// <param name="result" type="Object" mayBeNull="">
        /// The data returned from the Web service method call
        /// </param>
        /// <param name="userContext" type="Object">
        /// The context information that was passed when the Web service method was invoked
        /// </param>        
        /// <param name="methodName" type="String">
        /// The Web service method that was invoked
        /// </param>

        // ignore if it's not the current call.
        if (userContext != this._currentCallID) return;

        // Time has passed; make sure the element is still accessible
        var e = this.get_element();
        if (e) {
            e.innerHTML = result;
        }

        this._setUpdating(false);
    },

    _onMethodError : function(webServiceError, userContext, methodName) {
        /// <summary>
        /// Callback used when the populating service fails
        /// </summary>
        /// <param name="webServiceError" type="Sys.Net.WebServiceError">
        /// Web service error
        /// </param>
        /// <param name="userContext" type="Object">
        /// The context information that was passed when the Web service method was invoked
        /// </param>        
        /// <param name="methodName" type="String">
        /// The Web service method that was invoked
        /// </param>

        // ignore if it's not the current call.
        if (userContext != this._currentCallID) return;

        var e = this.get_element();
        if (e) {
            if (webServiceError.get_timedOut()) {
                e.innerHTML = AjaxControlToolkit.Resources.DynamicPopulate_WebServiceTimeout;
            } else {
                e.innerHTML = String.format(AjaxControlToolkit.Resources.DynamicPopulate_WebServiceError, webServiceError.get_statusCode());
            }
        }

        this._setUpdating(false);
    },

    _onPopulateTriggerClick : function() {
        /// <summary>
        /// Handler for the element described by PopulateTriggerID's click event
        /// </summary>

        // just call through to the trigger.
        this.populate(this._contextKey);
    },
    
    _setUpdating : function(updating) {
        /// <summary>
        /// Toggle the display elements to indicate if they are being updated or not
        /// </summary>
        /// <param name="updating" type="Boolean">
        /// Whether or not the display should indicated it is being updated
        /// </param>

        this.setStyle(updating);
        
        if (!updating) {
            this._currentCallID = -1;
            this._populated = true;
            this.raisePopulated(this, Sys.EventArgs.Empty);
        }
    },
    
    setStyle : function(updating) {
        /// <summary>
        /// Set the style of the display
        /// </summary>
        /// <param name="updating" type="Boolean">
        /// Whether or not the display is being updated
        /// </param>
        
        var e = this.get_element();
        if (this._setUpdatingCssClass) {
            if (!updating) {
                e.className = this._oldCss;
                this._oldCss = null;
            } else {
                this._oldCss = e.className;
                e.className = this._setUpdatingCssClass;
            }
        }
        
        if (updating && this._clearDuringUpdate) {
            e.innerHTML = "";
        }
    },
    
    get_ClearContentsDuringUpdate : function() {
        /// <value type="Boolean">
        /// Whether the contents of the target should be cleared when an update begins
        /// </value>
        return this._clearDuringUpdate;
    },
    set_ClearContentsDuringUpdate : function(value) {
        if (this._clearDuringUpdate != value) {
            this._clearDuringUpdate = value;
            this.raisePropertyChanged('ClearContentsDuringUpdate');
        }
    },
    
    get_ContextKey : function() {
        /// <value type="String">
        /// An arbitrary string value to be passed to the web method.
        /// For example, if the element to be populated is within a
        /// data-bound repeater, this could be the ID of the current row.
        /// </value>
        return this._contextKey;
    },
    set_ContextKey : function(value) {
        if (this._contextKey != value) {
            this._contextKey = value;
            this.raisePropertyChanged('ContextKey');
        }
    },
    
    get_PopulateTriggerID : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// Name of an element that triggers the population of the target when clicked
        /// </value>
        return this._populateTriggerID;
    },
    set_PopulateTriggerID : function(value) {
        if (this._populateTriggerID != value) {
            this._populateTriggerID = value;
            this.raisePropertyChanged('PopulateTriggerID');
        }
    },
    
    get_ServicePath : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// The URL of the web service to call.  If the ServicePath is not defined, then we will invoke a PageMethod instead of a web service.
        /// </value>
        return this._servicePath;
    },
    set_ServicePath : function(value) {
        if (this._servicePath != value) {
            this._servicePath = value;
            this.raisePropertyChanged('ServicePath');
        }
    },
    
    get_ServiceMethod : function() {
        /// <value type="String">
        /// The name of the method to call on the page or web service
        /// </value>
        /// <remarks>
        /// The signature of the method must exactly match the following:
        ///    [WebMethod]
        ///    string DynamicPopulateMethod(string contextKey)
        ///    {
        ///        ...
        ///    }
        /// </remarks>
        return this._serviceMethod;
    },
    set_ServiceMethod : function(value) {
        if (this._serviceMethod != value) {
            this._serviceMethod = value;
            this.raisePropertyChanged('ServiceMethod');
        }
    },
    
    get_cacheDynamicResults : function() {
        /// <value type="Boolean" mayBeNull="false">
        /// Whether the results of the dynamic population should be cached and
        /// not fetched again after the first load
        /// </value>
        return this._cacheDynamicResults;
    },
    set_cacheDynamicResults : function(value) {
        if (this._cacheDynamicResults != value) {
            this._cacheDynamicResults = value;
            this.raisePropertyChanged('cacheDynamicResults');
        }
    },
    
    get_UpdatingCssClass : function() {
        /// <value type="String">
        /// The CSS class to apply to the target during asynchronous calls
        /// </value>
        return this._setUpdatingCssClass;
    },
    set_UpdatingCssClass : function(value) {
        if (this._setUpdatingCssClass != value) {
            this._setUpdatingCssClass = value;
            this.raisePropertyChanged('UpdatingCssClass');
        }
    },
    
    get_CustomScript : function() {
        /// <value type="String">
        /// The script to invoke instead of calling a Web or Page method. This script must evaluate to a string value.
        /// </value>
        return this._customScript;
    },   
    set_CustomScript : function(value) {
        if (this._customScript != value) {
            this._customScript = value;
            this.raisePropertyChanged('CustomScript');
        }
    },
    
    add_populating : function(handler) {
        /// <summary>
        /// Add an event handler for the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('populating', handler);
    },
    remove_populating : function(handler) {
        /// <summary>
        /// Remove an event handler from the populating event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('populating', handler);
    },
    raisePopulating : function(eventArgs) {
        /// <summary>
        /// Raise the populating event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the populating event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('populating');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_populated : function(handler) {
        /// <summary>
        /// Add an event handler for the populated event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('populated', handler);
    },
    remove_populated : function(handler) {
        /// <summary>
        /// Remove an event handler from the populated event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('populated', handler);
    },
    raisePopulated : function(eventArgs) {
        /// <summary>
        /// Raise the populated event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the populated event
        /// </param>
        /// <returns />
         
        var handler = this.get_events().getHandler('populated');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.DynamicPopulateBehavior.registerClass('AjaxControlToolkit.DynamicPopulateBehavior', AjaxControlToolkit.BehaviorBase);

//END AjaxControlToolkit.DynamicPopulate.DynamicPopulateBehavior.js
//START AjaxControlToolkit.RoundedCorners.RoundedCornersBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.BoxCorners = function() {
    /// <summary>
    /// Corners of an element
    /// </summary>
    /// <field name="None" type="Number" integer="true" />
    /// <field name="TopLeft" type="Number" integer="true" />
    /// <field name="TopRight" type="Number" integer="true" />
    /// <field name="BottomRight" type="Number" integer="true" />
    /// <field name="BottomLeft" type="Number" integer="true" />
    /// <field name="Top" type="Number" integer="true" />
    /// <field name="Right" type="Number" integer="true" />
    /// <field name="Bottom" type="Number" integer="true" />
    /// <field name="Left" type="Number" integer="true" />
    /// <field name="All" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.BoxCorners.prototype = {
    None        : 0x00,

    TopLeft     : 0x01,
    TopRight    : 0x02,
    BottomRight : 0x04,
    BottomLeft  : 0x08,
    
    Top         : 0x01 | 0x02,
    Right       : 0x02 | 0x04,
    Bottom      : 0x04 | 0x08,
    Left        : 0x08 | 0x01,
    All         : 0x01 | 0x02 | 0x04 | 0x08
}
AjaxControlToolkit.BoxCorners.registerEnum("AjaxControlToolkit.BoxCorners", true);


AjaxControlToolkit.RoundedCornersBehavior = function(element) {
    /// <summary>
    /// The RoundedCornersBehavior rounds the corners of its target element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM element associated with the behavior
    /// </param>
    AjaxControlToolkit.RoundedCornersBehavior.initializeBase(this, [element]);
    
    this._corners = AjaxControlToolkit.BoxCorners.All;
    this._radius = 5;
    this._color = null;
    this._parentDiv = null;
    this._originalStyle = null;
    this._borderColor = null;
}
AjaxControlToolkit.RoundedCornersBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.RoundedCornersBehavior.callBaseMethod(this, 'initialize');
        this.buildParentDiv();
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        this.disposeParentDiv();
        AjaxControlToolkit.RoundedCornersBehavior.callBaseMethod(this, 'dispose');
    },

    buildParentDiv : function() {
        /// <summary>
        /// Create the surrounding div that will have rounded corners
        /// </summary>
        var e = this.get_element();

        if (!e) return;

        this.disposeParentDiv();
        
        var color = this.getBackgroundColor();
        var originalWidth = e.offsetWidth;
        var newParent = e.cloneNode(false);

        // move all children into the new div.
        this.moveChildren(e, newParent);

        // modify the target element to be transparent
        // and set up the new parent
        this._originalStyle = e.style.cssText;
        e.style.backgroundColor = "transparent";
        e.style.verticalAlign = "top";
        e.style.padding = "0";
        e.style.overflow = "";
        e.style.className = "";
        if (e.style.height) {
            // Increase the height to account for the rounded corners
            e.style.height = parseInt($common.getCurrentStyle(e, 'height')) + (this._radius * 2) + "px";
        } else {
            // Note: Do NOT use $common.getCurrentStyle in the check below
            // because that breaks the work-around
            if (!e.style.width && (0 < originalWidth)) {
                // The following line works around a problem where IE renders the first
                // rounded DIV about 6 pixels too high if e doesn't have a width or height
                e.style.width = originalWidth + "px";
            }
        }

        // these are properties we don't want cloned down to the new parent
        newParent.style.position = "";
        newParent.style.border   = "";
        newParent.style.margin   = "";
        newParent.style.width    = "100%";
        newParent.id             = "";
        newParent.removeAttribute("control");

        if (this._borderColor) {
            newParent.style.borderTopStyle = "none";
            newParent.style.borderBottomStyle = "none";
            newParent.style.borderLeftStyle = "solid";
            newParent.style.borderRightStyle = "solid";
            newParent.style.borderLeftColor = this._borderColor;
            newParent.style.borderRightColor = this._borderColor;
            newParent.style.borderLeftWidth = "1px";
            newParent.style.borderRightWidth = "1px";
            if (this._radius == 0) {
                newParent.style.borderTopStyle = "solid";
                newParent.style.borderBottomStyle = "solid";
                newParent.style.borderTopColor = this._borderColor;
                newParent.style.borderBottomColor = this._borderColor;
                newParent.style.borderTopWidth = "1px";
                newParent.style.borderBottomWidth = "1px";
            }
        } else {
            newParent.style.borderTopStyle = "none";
            newParent.style.borderBottomStyle = "none";
            newParent.style.borderLeftStyle = "none";
            newParent.style.borderRightStyle = "none";
        }

        // build a set of steps on each end to fake the corners.
        //  ------- (step 0)
        //  -------- (step n-1)
        //  --------- (step n)
        //  XXXXXXXXX (inner div)
        //  XXXXXXXXX
        //  --------- (bottom step n)
        //  --------  (bottom step n-1)
        //  ------    (bottom step 0)

        var lastDiv = null;
        var radius = this._radius;
        var lines = this._radius;
        var lastDelta = 0;
        
        for (var i = lines; i > 0; i--) {

            // figure out how much we'll need to subtract from each item
            var angle = Math.acos(i / radius);
            var delta = radius - Math.round(Math.sin(angle) * radius);

            // build a 1 pixel tall div
            // that's delta pixels shorter on each end.

            // add the top one
            var newDiv = document.createElement("DIV");
            newDiv.__roundedDiv = true;
            newDiv.style.backgroundColor = color;
            newDiv.style.marginLeft = delta + "px";
            newDiv.style.marginRight = (delta - (this._borderColor ? 2 : 0)) + "px";
            newDiv.style.height = "1px";
            newDiv.style.fontSize = "1px"; // workaround for IE wierdness with 1px divs.
            newDiv.style.overflow = "hidden";

            if (this._borderColor) {
                newDiv.style.borderLeftStyle = "solid";
                newDiv.style.borderRightStyle = "solid";
                newDiv.style.borderLeftColor = this._borderColor;
                newDiv.style.borderRightColor = this._borderColor;
                
                var offset = Math.max(0, lastDelta - delta - 1);
                newDiv.style.borderLeftWidth = (offset + 1) + "px";
                newDiv.style.borderRightWidth = (offset + 1) + "px";
                
                if (i == lines) {
                    newDiv.__roundedDivNoBorder = true;
                    newDiv.style.backgroundColor = this._borderColor;
                }
            }

            e.insertBefore(newDiv, lastDiv);

            var topDiv = newDiv;

            // add the bottom one one
            newDiv = newDiv.cloneNode(true);
            newDiv.__roundedDiv = true;

            e.insertBefore(newDiv, lastDiv);

            var bottomDiv = newDiv;

            lastDiv = newDiv;
            lastDelta = delta;
            
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.TopLeft)) {
                topDiv.style.marginLeft = "0";
                if (this._borderColor) {
                    topDiv.style.borderLeftWidth = "1px";
                }
            }
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.TopRight)) {
                topDiv.style.marginRight = "0";
                if (this._borderColor) {
                    topDiv.style.borderRightWidth = "1px";
                    topDiv.style.marginRight = "-2px";
                }
            }
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.BottomLeft)) {
                bottomDiv.style.marginLeft = "0";
                if (this._borderColor) {
                    bottomDiv.style.borderLeftWidth = "1px";
                }
            }
            if (!this.isCornerSet(AjaxControlToolkit.BoxCorners.BottomRight)) {
                bottomDiv.style.marginRight = "0";
                if (this._borderColor) {
                    bottomDiv.style.borderRightWidth = "1px";
                    bottomDiv.style.marginRight = "-2px";
                }
            }
        }

        // finally, add the newParent (which has all the original content)
        // into the div.
        e.insertBefore(newParent, lastDiv);
        this._parentDiv = newParent;
    },

    disposeParentDiv : function() {
        /// <summary>
        /// Dispose the surrounding div with rounded corners
        /// </summary>

        if (this._parentDiv) {
            // clean up the divs we added.
            var e = this.get_element();
            var children = e.childNodes;
            for (var i = children.length - 1; i >=0; i--) {
                var child = children[i];
                if (child) {
                    if (child == this._parentDiv) {
                        this.moveChildren(child, e);
                    }
                    try {
                        e.removeChild(child);
                    } catch(e) {
                        // Safari likes to throw NOT_FOUND_ERR (DOMException 8)
                        // but it seems to work fine anyway.
                    }
                }
            }

            // restore the original style
            if (this._originalStyle) {
                e.style.cssText = this._originalStyle;
                this._originalStyle = null;
            }
            this._parentDiv = null;
        }
    },

    getBackgroundColor : function() {
        /// <summary>
        /// Get the background color of the target element
        /// </summary>
        if (this._color) {
            return this._color;
        }
        return $common.getCurrentStyle(this.get_element(), 'backgroundColor');
    },

    moveChildren : function(src, dest) {
        /// <summary>
        /// Move the child nodes from one element to another
        /// </summary>
        /// <param name="src" type="Sys.UI.DomElement" domElement="true">
        /// DOM Element
        /// </param>
        /// <param name="dest" type="Sys.UI.DomElement" domElement="true">
        /// DOM Element
        /// </param>

        var moveCount = 0;
        while (src.hasChildNodes()) {
            var child = src.childNodes[0];
            child = src.removeChild(child);
            dest.appendChild(child);
            moveCount++;
        }
        return moveCount;
    },
    
    isCornerSet : function(corner) {
        /// <summary>
        /// Check whether the a flag for this corner has been set
        /// </summary>
        /// <param name="corner" type="AjaxControlTooolkit.BoxCorners">
        /// Corner to check
        /// </param>
        /// <returns type="Boolean">
        /// True if it is included in the flags, false otherwise
        /// </returns>
        return (this._corners & corner) != AjaxControlToolkit.BoxCorners.None;
    },
    
    setCorner : function(corner, value) {
        /// <summary>
        /// Set a corner as one that should be rounded
        /// </summary>
        /// <param name="corner" type="AjaxControlToolkit.BoxCorners">
        /// Corner to set
        /// </param>
        /// <param name="value" type="Boolean">
        /// True to set the value, False to clear it
        /// </param>
        if (value) {
            this.set_Corners(this._corners | corner);
        } else {
            this.set_Corners(this._corners & ~corner);
        }
    },
    
    get_Color : function() {
        /// <value type="String">
        /// The background color of the rounded area an corners.  By default this picks up the background color of the panel that it is attached to.
        /// </value>
        return this._color;
    },
    set_Color : function(value) {
        if (value != this._color) {
            this._color = value;
            this.buildParentDiv();
            this.raisePropertyChanged('Color');
        }
    },

    get_Radius : function() {
        /// <value type="Number" integer="true">
        /// The radius of the corners (and height of the added area).  Default is 5.
        /// </value>
        return this._radius;
    },
    set_Radius : function(value) {
        if (value != this._radius) {
            this._radius = value;
            this.buildParentDiv();
            this.raisePropertyChanged('Radius');
        }
    },
    
    get_Corners : function() {
        /// <value type="AjaxControlToolkit.BoxCorners">
        /// Corners that should be rounded
        /// </value>
        return this._corners;
    },
    set_Corners : function(value) {
        if (value != this._corners) {
            this._corners = value;
            this.buildParentDiv();
            this.raisePropertyChanged("Corners");
        }
    },
    
    get_BorderColor : function() {
        /// <value type="String">
        /// Color of the border (and hence the rounded corners)
        /// </value>
        return this._borderColor;
    },
    set_BorderColor : function(value) {
        if (value != this._borderColor) {
            this._borderColor = value;
            this.buildParentDiv();
            this.raisePropertyChanged("BorderColor");
        }
    }
}
AjaxControlToolkit.RoundedCornersBehavior.registerClass('AjaxControlToolkit.RoundedCornersBehavior', AjaxControlToolkit.BehaviorBase);

//END AjaxControlToolkit.RoundedCorners.RoundedCornersBehavior.js
//START AjaxControlToolkit.Compat.Timer.Timer.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


///////////////////////////////////////////////////////////////////////////////
// Sys.Timer

Sys.Timer = function() {
    Sys.Timer.initializeBase(this);
    
    this._interval = 1000;
    this._enabled = false;
    this._timer = null;
}

Sys.Timer.prototype = {
    get_interval: function() {
        
        return this._interval;
    },
    set_interval: function(value) {
        
        if (this._interval !== value) {
            this._interval = value;
            this.raisePropertyChanged('interval');
            
            if (!this.get_isUpdating() && (this._timer !== null)) {
                this._stopTimer();
                this._startTimer();
            }
        }
    },
    
    get_enabled: function() {
        
        return this._enabled;
    },
    set_enabled: function(value) {
        
        if (value !== this.get_enabled()) {
            this._enabled = value;
            this.raisePropertyChanged('enabled');
            if (!this.get_isUpdating()) {
                if (value) {
                    this._startTimer();
                }
                else {
                    this._stopTimer();
                }
            }
        }
    },

    
    add_tick: function(handler) {
        
        
        this.get_events().addHandler("tick", handler);
    },

    remove_tick: function(handler) {
        
        
        this.get_events().removeHandler("tick", handler);
    },

    dispose: function() {
        this.set_enabled(false);
        this._stopTimer();
        
        Sys.Timer.callBaseMethod(this, 'dispose');
    },
    
    updated: function() {
        Sys.Timer.callBaseMethod(this, 'updated');

        if (this._enabled) {
            this._stopTimer();
            this._startTimer();
        }
    },

    _timerCallback: function() {
        var handler = this.get_events().getHandler("tick");
        if (handler) {
            handler(this, Sys.EventArgs.Empty);
        }
    },

    _startTimer: function() {
        this._timer = window.setInterval(Function.createDelegate(this, this._timerCallback), this._interval);
    },

    _stopTimer: function() {
        window.clearInterval(this._timer);
        this._timer = null;
    }
}

Sys.Timer.descriptor = {
    properties: [   {name: 'interval', type: Number},
                    {name: 'enabled', type: Boolean} ],
    events: [ {name: 'tick'} ]
}

Sys.Timer.registerClass('Sys.Timer', Sys.Component);

//END AjaxControlToolkit.Compat.Timer.Timer.js
//START AjaxControlToolkit.DropShadow.DropShadowBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../RoundedCorners/RoundedCornersBehavior.js" />
/// <reference path="../Compat/Timer/Timer.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.DropShadowBehavior = function(element) {
    /// <summary>
    /// The DropShadowBehavior is used to attach a drop shadow to the element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.DropShadowBehavior.initializeBase(this, [element]);

    // our property values
    this._opacity = 1.0;
    this._width = 5;

    // the div we create for the shadow.
    this._shadowDiv = null;

    // our timer for tracking position
    this._trackPosition = null;
    this._trackPositionDelay = 50;
    this._timer = null;
    this._tickHandler = null;
    this._roundedBehavior = null;
    this._shadowRoundedBehavior = null;

    this._rounded = false;
    this._radius = 5;

    // our cache of our last size and position for tracking
    this._lastX = null;
    this._lastY = null;
    this._lastW = null;
    this._lastH = null;
}
AjaxControlToolkit.DropShadowBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'initialize');
        
        var e = this.get_element();

        // flip the styles position to relative so that we z-order properly.
        if ($common.getCurrentStyle(e, 'position', e.style.position) != "absolute") {
            e.style.position = "relative";
        }

        // set up our initial state
        if (this._rounded) {
            this.setupRounded();
        }
        if (this._trackPosition) {
            this.startTimer();
        }
        this.setShadow();
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        this.stopTimer();
        this.disposeShadowDiv();
        AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'dispose');
    },

    buildShadowDiv : function() {
        /// <summary>
        /// Create the div that we'll use as the shadow
        /// </summary>
        
        var e = this.get_element();

        if (!this.get_isInitialized() || !e || !this._width) return;

        var div = document.createElement("DIV");
        div.style.backgroundColor = "black";
        div.style.position= "absolute";
                
        if (e.id) {
            div.id = e.id + "_DropShadow";
        }

        // initialize a control around it, and
        // set up the opacity behavior and rounding
        this._shadowDiv = div;

       e.parentNode.appendChild(div);

       if (this._rounded ) {
            this._shadowDiv.style.height = Math.max(0, e.offsetHeight - (2*this._radius)) + "px";
            if (!this._shadowRoundedBehavior) {
                this._shadowRoundedBehavior = $create(AjaxControlToolkit.RoundedCornersBehavior, {"Radius": this._radius}, null, null, this._shadowDiv);
            } else {
                this._shadowRoundedBehavior.set_Radius(this._radius);
            }
        } else if (this._shadowRoundedBehavior) {
            this._shadowRoundedBehavior.set_Radius(0);
        }

        if (this._opacity != 1.0) {
            this.setupOpacity();
        }

        this.setShadow(false, true);
        this.updateZIndex();
    },

    disposeShadowDiv : function() {
        /// <summary>
        /// Dispose of the div we use as the shadow
        /// </summary>

        if (this._shadowDiv) {
            // on page teardown (or in an update panel, this may already
            // be gone)
            //
            if (this._shadowDiv.parentNode) {
                this._shadowDiv.parentNode.removeChild(this._shadowDiv);
            }            
            this._shadowDiv = null;
        }
        
        if (this._shadowRoundedBehavior) {
            this._shadowRoundedBehavior.dispose();
            this._shadowRoundedBehavior = null;            
        }
    },

    onTimerTick : function() {
        /// <summary>
        /// Timer's tick handler that is used to position the shadow when its target moves
        /// </summary>
        this.setShadow();
    },

    startTimer : function() {
        /// <summary>
        /// Start the timer (and hence start tracking the bounds of the target element)
        /// </summary>

        if (!this._timer) {
            if (!this._tickHandler) {
                this._tickHandler = Function.createDelegate(this, this.onTimerTick);
            }
            this._timer = new Sys.Timer();
            this._timer.set_interval(this._trackPositionDelay);
            this._timer.add_tick(this._tickHandler);
            this._timer.set_enabled(true);
        }
    },

    stopTimer : function() {
        /// <summary>
        /// Stop the timer (and hence stop tracking the bounds of the target element)
        /// </summary>

        // on stop, just clean the thing up completely
        if (this._timer) {
            this._timer.remove_tick(this._tickHandler);
            this._timer.set_enabled(false);
            this._timer.dispose();
            this._timer = null;
        }
    },

    setShadow : function(force, norecurse) {
        /// <summary>
        /// This function does the heavy lifting of positioning and sizing the shadow.
        /// It caches values to avoid extra work - it's called on a timer so we need to
        /// keep it light weight.
        /// </summary>
        /// <param name="force" type="Boolean">
        /// Whether to force the bounds change
        /// </param>
        /// <param name="norecurse" type="Boolean">
        /// Whether to recurse if we need to recreate the shadow div
        /// </param>

        var e = this.get_element();
        if (!this.get_isInitialized() || !e || (!this._width && !force)) return;

        var existingShadow = this._shadowDiv;
        if (!existingShadow) {
            this.buildShadowDiv();
        }

        // Consider calling offsetLeft first to avoid recursive math of location?                
        var location = $common.getLocation(e);
        
        if (force || this._lastX != location.x || this._lastY != location.y || !existingShadow) {
            this._lastX = location.x;
            this._lastY = location.y;

            var w = this.get_Width();
            
            // to work around setlocation bug because elements embedded within fixed\absolute
            // elements are set relative to their parent instead of the window
            if((e.parentNode.style.position == "absolute") || (e.parentNode.style.position == "fixed") )
            {
                location.x = w;
                location.y = w;
            }
            else if (e.parentNode.style.position == "relative")
            {
                location.x = w;
                var paddingTop = e.parentNode.style.paddingTop;
                paddingTop = paddingTop.replace("px", "");
                
                var intPaddingTop = 0;
                intPaddingTop = parseInt(paddingTop);
                 
                location.y = w + intPaddingTop;
            }
            else
            {
                location.x += w;
                location.y += w;
            }
            
            $common.setLocation(this._shadowDiv, location);
        }

        var h = e.offsetHeight;
        var w = e.offsetWidth;

        if (force || h != this._lastH || w != this._lastW || !existingShadow) {
            this._lastW = w;
            this._lastH = h;
            if (!this._rounded || !existingShadow || norecurse) {
               this._shadowDiv.style.width = w + "px";
               this._shadowDiv.style.height = h + "px";
            } else {
                // recurse if we need to redo the div
                this.disposeShadowDiv();
                this.setShadow();
            }
        }

        if (this._shadowDiv) {
            this._shadowDiv.style.visibility = $common.getCurrentStyle(e, 'visibility');
        }
    },

    setupOpacity : function() {
        /// <summary>
        /// Set the opacity of the shadow div
        /// </summary>
        if (this.get_isInitialized() && this._shadowDiv) {
            $common.setElementOpacity(this._shadowDiv, this._opacity);
        }
    },

    setupRounded : function() {
        /// <summary>
        /// Demand create and initialize the RoundedCornersBehavior
        /// </summary>
        
        if (!this._roundedBehavior && this._rounded) {
            this._roundedBehavior = $create(AjaxControlToolkit.RoundedCornersBehavior, null, null, null, this.get_element());            
        }
        if (this._roundedBehavior) {
            this._roundedBehavior.set_Radius(this._rounded ? this._radius : 0);
        }
    },

    updateZIndex : function() {
        /// <summary>
        /// Update the z-Index so the shadow div remains behind the target element
        /// </summary>

        if (!this._shadowDiv) return;
        
        var e = this.get_element();
        var targetZIndex = e.style.zIndex;
        var shadowZIndex = this._shadowDiv.style.zIndex;

        if (shadowZIndex && targetZIndex && targetZIndex > shadowZIndex) {
            return;
        } else {
           targetZIndex = Math.max(2, targetZIndex);
           shadowZIndex = targetZIndex - 1;
        }
        e.style.zIndex = targetZIndex;
        this._shadowDiv.style.zIndex = shadowZIndex;
    },

    updateRoundedCorners : function() {
        /// <summary>
        /// Update the RoundedCorndersBehavior and recreate the shadow div so its corners are rounded as well
        /// </summary>
        if (this.get_isInitialized()) {
            this.setupRounded();
            this.disposeShadowDiv();
            this.setShadow();
        }
    },

    get_Opacity : function() {
        /// <value type="Number">
        /// The opacity of the drop shadow, from 0 (fully transparent) to 1.0 (fully opaque). The default value is .5.
        /// </value>
        return this._opacity;
    },
    set_Opacity : function(value) {
        if (this._opacity != value) {
            this._opacity = value;
            this.setupOpacity();
            this.raisePropertyChanged('Opacity');
        }
    },

    get_Rounded : function() {
        /// <value type="Boolean">
        /// Whether or not the corners of the target and drop shadow should be rounded
        /// </value>
        return this._rounded;
    },
    set_Rounded : function(value) {
        if (value != this._rounded) {
            this._rounded = value;
            this.updateRoundedCorners();
            this.raisePropertyChanged('Rounded');
        }
    },

    get_Radius : function() {
        /// <value type="Number" integer="true">
        /// Radius, in pixels, of the rounded corners
        /// </value>
        return this._radius;
    },
    set_Radius : function(value) {
        if (value != this._radius) {
            this._radius = value;
            this.updateRoundedCorners();
            this.raisePropertyChanged('Radius');
        }
    },

    get_Width : function() {
        /// <value type="Number" integer="true">
        /// Width in pixels of the drop shadow.  The default value is 5 pixels.
        /// </value>
        return this._width;
    },
    set_Width : function(value) {
        if (value != this._width) {
            this._width = value;
            
            if (this._shadowDiv) {
                $common.setVisible(this._shadowDiv, value > 0);
            }
            
            this.setShadow(true);
            this.raisePropertyChanged('Width');
        }
    },

    get_TrackPositionDelay : function() {
        /// <value type="Number">
        /// Length of the timer interval used when tracking the position of the target
        /// </value>
        return this._trackPositionDelay;
    },
    set_TrackPositionDelay : function(value) {
        if (value != this._trackPositionDelay) {
            this._trackPositionDelay = value;
            if (this._trackPosition) {
                this.stopTimer();
                this.startTimer();
            }
            this.raisePropertyChanged('TrackPositionDelay');
        }
    },

    get_TrackPosition : function() {
        /// <value type="Boolean">
        /// Whether the drop shadow should track the position of the panel it is attached to. Use this if the panel is absolutely positioned or will otherwise move.
        /// </value>
        return this._trackPosition;
    },
    set_TrackPosition : function(value) {
        if (value != this._trackPosition) {
            this._trackPosition = value;
            if (this.get_element()) {
                if (value) {
                    this.startTimer();
                } else {
                    this.stopTimer();
                }
            }
            this.raisePropertyChanged('TrackPosition');
        }
    }
}
AjaxControlToolkit.DropShadowBehavior.registerClass('AjaxControlToolkit.DropShadowBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        var td = AjaxControlToolkit.DropShadowBehavior.callBaseMethod(this, 'getDescriptor');
//        td.addProperty('Opacity', Number);
//        td.addProperty('Width', Number);
//        td.addProperty('TrackPosition', Boolean);
//        td.addProperty('TrackPositionDelay', Number);
//        td.addProperty('Rounded', Boolean);
//        td.addProperty('Radius', Number);
//        return td;
//    },

//END AjaxControlToolkit.DropShadow.DropShadowBehavior.js
//START AjaxControlToolkit.Compat.DragDrop.DragDropScripts.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../../Common/Common.js" />
/// <reference path="../Timer/Timer.js" />


///////////////////////////////////////////////////////////////////////////////
// IDropSource

Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.IDragSource = function() {
}
AjaxControlToolkit.IDragSource.prototype = {
    // Type get_dragDataType()
    get_dragDataType: function() { throw Error.notImplemented(); },
    // Object getDragData(Context)
    getDragData: function() { throw Error.notImplemented(); },
    // DragMode get_dragMode()
    get_dragMode: function() { throw Error.notImplemented(); },
    // void onDragStart()
    onDragStart: function() { throw Error.notImplemented(); },
    // void onDrag()
    onDrag: function() { throw Error.notImplemented(); },
    // void onDragEnd(Cancelled)
    onDragEnd: function() { throw Error.notImplemented(); }
}
AjaxControlToolkit.IDragSource.registerInterface('AjaxControlToolkit.IDragSource');

///////////////////////////////////////////////////////////////////////////////
// IDropTarget
AjaxControlToolkit.IDropTarget = function() {
}
AjaxControlToolkit.IDropTarget.prototype = {
    get_dropTargetElement: function() { throw Error.notImplemented(); },
    // bool canDrop(DragMode, DataType, Data)
    canDrop: function() { throw Error.notImplemented(); },
    // void drop(DragMode, DataType, Data)
    drop: function() { throw Error.notImplemented(); },
    // void onDragEnterTarget(DragMode, DataType, Data)
    onDragEnterTarget: function() { throw Error.notImplemented(); },
    // void onDragLeaveTarget(DragMode, DataType, Data)
    onDragLeaveTarget: function() { throw Error.notImplemented(); },
    // void onDragInTarget(DragMode, DataType, Data)
    onDragInTarget: function() { throw Error.notImplemented(); }
}
AjaxControlToolkit.IDropTarget.registerInterface('AjaxControlToolkit.IDropTarget');

///////////////////////////////////////////////
// DragMode
//

AjaxControlToolkit.DragMode = function() {
    throw Error.invalidOperation();
}
AjaxControlToolkit.DragMode.prototype = {
    Copy: 0,
    Move: 1
}
AjaxControlToolkit.DragMode.registerEnum('AjaxControlToolkit.DragMode');

////////////////////////////////////////////////////////////////////
// DragDropEventArgs
//

AjaxControlToolkit.DragDropEventArgs = function(dragMode, dragDataType, dragData) {
    this._dragMode = dragMode;
    this._dataType = dragDataType;
    this._data = dragData;
}
AjaxControlToolkit.DragDropEventArgs.prototype = {
    get_dragMode: function() {
        return this._dragMode || null;
    },
    get_dragDataType: function() {
        return this._dataType || null;
    },
    get_dragData: function() {
        return this._data || null;
    }
}
AjaxControlToolkit.DragDropEventArgs.registerClass('AjaxControlToolkit.DragDropEventArgs');


AjaxControlToolkit._DragDropManager = function() {
    this._instance = null;
    this._events =  null;
}
AjaxControlToolkit._DragDropManager.prototype = {

    add_dragStart: function(handler) {
        this.get_events().addHandler('dragStart', handler);
    },
    remove_dragStart: function(handler) {
        this.get_events().removeHandler('dragStart', handler);
    },
    
    get_events: function() {
    // todo: doc comments. this one is commented out (two //) due to a bug with the preprocessor.
        // <value type="Sys.EventHandlerList">
        // </value>
        if (!this._events) {
            this._events = new Sys.EventHandlerList();
        }
        return this._events;
    },
    
    add_dragStop: function(handler) {
        this.get_events().addHandler('dragStop', handler);
    },
    remove_dragStop: function(handler) {
        this.get_events().removeHandler('dragStop', handler);
    },
    
    _getInstance: function() {
        if (!this._instance) {
            if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
                this._instance = new AjaxControlToolkit.IEDragDropManager();
            }
            else {
                this._instance = new AjaxControlToolkit.GenericDragDropManager();
            }
            this._instance.initialize();
            this._instance.add_dragStart(Function.createDelegate(this, this._raiseDragStart));
            this._instance.add_dragStop(Function.createDelegate(this, this._raiseDragStop));
        }
        return this._instance;
    },
    
    startDragDrop: function(dragSource, dragVisual, context) {
        this._getInstance().startDragDrop(dragSource, dragVisual, context);
    },
    
    registerDropTarget: function(target) {
        this._getInstance().registerDropTarget(target);
    },
    
    unregisterDropTarget: function(target) {
        this._getInstance().unregisterDropTarget(target);
    },
    
    dispose: function() {
        delete this._events;
        Sys.Application.unregisterDisposableObject(this);
        Sys.Application.removeComponent(this);
    },
    
    _raiseDragStart: function(sender, eventArgs) {
        var handler = this.get_events().getHandler('dragStart');
        if(handler) {
            handler(this, eventArgs);
        }
    },
    
    _raiseDragStop: function(sender, eventArgs) {
        var handler = this.get_events().getHandler('dragStop');
        if(handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit._DragDropManager.registerClass('AjaxControlToolkit._DragDropManager');
AjaxControlToolkit.DragDropManager = new AjaxControlToolkit._DragDropManager();


AjaxControlToolkit.IEDragDropManager = function() {
    AjaxControlToolkit.IEDragDropManager.initializeBase(this);
    
    this._dropTargets = null;
    // Radius of the cursor used to determine what drop target we 
    // are hovering. Anything below the cursor's zone may be a 
    // potential drop target.
    this._radius = 10;
    this._activeDragVisual = null;
    this._activeContext = null;
    this._activeDragSource = null;
    this._underlyingTarget = null;
    this._oldOffset = null;
    this._potentialTarget = null;
    this._isDragging = false;
    this._mouseUpHandler = null;
    this._documentMouseMoveHandler = null;
    this._documentDragOverHandler = null;
    this._dragStartHandler = null;
    this._mouseMoveHandler = null;
    this._dragEnterHandler = null;
    this._dragLeaveHandler = null;
    this._dragOverHandler = null;
    this._dropHandler = null;
}
AjaxControlToolkit.IEDragDropManager.prototype = {

    add_dragStart : function(handler) {
        this.get_events().addHandler("dragStart", handler);
    },
    
    remove_dragStart : function(handler) {
        this.get_events().removeHandler("dragStart", handler);
    },
    
    add_dragStop : function(handler) {
        this.get_events().addHandler("dragStop", handler);
    },
    
    remove_dragStop : function(handler) {
        this.get_events().removeHandler("dragStop", handler);
    },
    
    initialize : function() {
        AjaxControlToolkit.IEDragDropManager.callBaseMethod(this, 'initialize');
        this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
        this._documentMouseMoveHandler = Function.createDelegate(this, this._onDocumentMouseMove);
        this._documentDragOverHandler = Function.createDelegate(this, this._onDocumentDragOver);
        this._dragStartHandler = Function.createDelegate(this, this._onDragStart);
        this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
        this._dragEnterHandler = Function.createDelegate(this, this._onDragEnter);
        this._dragLeaveHandler = Function.createDelegate(this, this._onDragLeave);
        this._dragOverHandler = Function.createDelegate(this, this._onDragOver);
        this._dropHandler = Function.createDelegate(this, this._onDrop);
    },
    
    
    dispose : function() {
        if(this._dropTargets) {
            for (var i = 0; i < this._dropTargets; i++) {
                this.unregisterDropTarget(this._dropTargets[i]);
            }
            this._dropTargets = null;
        }
        
        AjaxControlToolkit.IEDragDropManager.callBaseMethod(this, 'dispose');
    },
    

    startDragDrop : function(dragSource, dragVisual, context) {
        var ev = window._event;
        
        // Don't allow drag and drop if there is another active drag operation going on.
        if (this._isDragging) {
            return;
        }
        
        this._underlyingTarget = null;
        this._activeDragSource = dragSource;
        this._activeDragVisual = dragVisual;
        this._activeContext = context;
        
        var mousePosition = { x: ev.clientX, y: ev.clientY };
        
        // By default we use absolute positioning, unless a different type 
        // of positioning is set explicitly.
        dragVisual.originalPosition = dragVisual.style.position;
        dragVisual.style.position = "absolute";
        
        document._lastPosition = mousePosition;
        dragVisual.startingPoint = mousePosition;
        var scrollOffset = this.getScrollOffset(dragVisual, /* recursive */ true);
        
        dragVisual.startingPoint = this.addPoints(dragVisual.startingPoint, scrollOffset);
        
        if (dragVisual.style.position == "absolute") {
            dragVisual.startingPoint = this.subtractPoints(dragVisual.startingPoint, $common.getLocation(dragVisual));
        }
        else {
            var left = parseInt(dragVisual.style.left);
            var top = parseInt(dragVisual.style.top);
            if (isNaN(left)) left = "0";
            if (isNaN(top)) top = "0";
            
            dragVisual.startingPoint = this.subtractPoints(dragVisual.startingPoint, { x: left, y: top });
        }
        
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dragSource.onDragStart();
        var eventArgs = new AjaxControlToolkit.DragDropEventArgs(
            dragSource.get_dragMode(),
            dragSource.get_dragDataType(),
            dragSource.getDragData(context));
        var handler = this.get_events().getHandler('dragStart');
        if(handler) handler(this,eventArgs);
        this._recoverFromDomChanges();
        
        this._wireEvents();
        
        this._drag(/* isInitialDrag */ true);
    },
    
    
    _stopDragDrop : function(cancelled) {
        var ev = window._event;
        if (this._activeDragSource != null) {
            this._unwireEvents();
        
            if (!cancelled) {
                // The drag operation is cancelled if there 
                // is no drop target.
                cancelled = (this._underlyingTarget == null);
            }

            if (!cancelled && this._underlyingTarget != null) {
                this._underlyingTarget.drop(this._activeDragSource.get_dragMode(), this._activeDragSource.get_dragDataType(),
                    this._activeDragSource.getDragData(this._activeContext));
            }

            this._activeDragSource.onDragEnd(cancelled);
            var handler = this.get_events().getHandler('dragStop');
            if(handler) handler(this,Sys.EventArgs.Empty);
            
            this._activeDragVisual.style.position = this._activeDragVisual.originalPosition;
        
            this._activeDragSource = null;
            this._activeContext = null;
            this._activeDragVisual = null;
            this._isDragging = false;
            this._potentialTarget = null;
            ev.preventDefault();
        }
    },
    
    _drag : function(isInitialDrag) {
        var ev = window._event;
        var mousePosition = { x: ev.clientX, y: ev.clientY };
        
        // NOTE: We store the event object to be able to determine the current 
        // mouse position in Mozilla in other event handlers such as keydown.
        document._lastPosition = mousePosition;
        
        var scrollOffset = this.getScrollOffset(this._activeDragVisual, /* recursive */ true);
        var position = this.addPoints(this.subtractPoints(mousePosition, this._activeDragVisual.startingPoint), scrollOffset);
        
        // Check if the visual moved at all.
        if (!isInitialDrag && parseInt(this._activeDragVisual.style.left) == position.x && parseInt(this._activeDragVisual.style.top) == position.y) {
            return;
        }
        
        $common.setLocation(this._activeDragVisual, position);
        
        // Monitor DOM changes.
        this._prepareForDomChanges();
        this._activeDragSource.onDrag();
        this._recoverFromDomChanges();
        
        // Find a potential target.
        this._potentialTarget = this._findPotentialTarget(this._activeDragSource, this._activeDragVisual);
        
        var movedToOtherTarget = (this._potentialTarget != this._underlyingTarget || this._potentialTarget == null);
        // Check if we are leaving an underlying target.
        if (movedToOtherTarget && this._underlyingTarget != null) {
            this._leaveTarget(this._activeDragSource, this._underlyingTarget);
        }
        
        if (this._potentialTarget != null) {
            // Check if we are entering a new target.
            if (movedToOtherTarget) {
                this._underlyingTarget = this._potentialTarget;
                
                // Enter the new target.
                this._enterTarget(this._activeDragSource, this._underlyingTarget);
            }
            else {
                this._moveInTarget(this._activeDragSource, this._underlyingTarget);
            }
        }
        else {
            this._underlyingTarget = null;
        }
    },
    
    
    _wireEvents : function() {
        $addHandler(document, "mouseup", this._mouseUpHandler);
        $addHandler(document, "mousemove", this._documentMouseMoveHandler);
        $addHandler(document.body, "dragover", this._documentDragOverHandler);
        
        $addHandler(this._activeDragVisual, "dragstart", this._dragStartHandler);
        $addHandler(this._activeDragVisual, "dragend", this._mouseUpHandler);
        $addHandler(this._activeDragVisual, "drag", this._mouseMoveHandler);
    },
    
    
    _unwireEvents : function() {
        $removeHandler(this._activeDragVisual, "drag", this._mouseMoveHandler);
        $removeHandler(this._activeDragVisual, "dragend", this._mouseUpHandler);
        $removeHandler(this._activeDragVisual, "dragstart", this._dragStartHandler);

        $removeHandler(document.body, "dragover", this._documentDragOverHandler);
        $removeHandler(document, "mousemove", this._documentMouseMoveHandler);
        $removeHandler(document, "mouseup", this._mouseUpHandler);
    },
    
    
    registerDropTarget : function(dropTarget) {
        if (this._dropTargets == null) {
            this._dropTargets = [];
        }
        Array.add(this._dropTargets, dropTarget);
        
        this._wireDropTargetEvents(dropTarget);
    },
    
    
    unregisterDropTarget : function(dropTarget) {
        this._unwireDropTargetEvents(dropTarget);
        if (this._dropTargets) {
            Array.remove(this._dropTargets, dropTarget);
        }
    },
    
    
    _wireDropTargetEvents : function(dropTarget) {
        var associatedElement = dropTarget.get_dropTargetElement();
        associatedElement._dropTarget = dropTarget;
        $addHandler(associatedElement, "dragenter",  this._dragEnterHandler);
        $addHandler(associatedElement, "dragleave",  this._dragLeaveHandler);
        $addHandler(associatedElement, "dragover", this._dragOverHandler);
        $addHandler(associatedElement, "drop", this._dropHandler);
    },
    
    
    _unwireDropTargetEvents : function(dropTarget) {
        var associatedElement = dropTarget.get_dropTargetElement();
        // make sure that the handlers are not removed twice
        if(associatedElement._dropTarget)
        {
            associatedElement._dropTarget = null;
            $removeHandler(associatedElement, "dragenter",  this._dragEnterHandler);
            $removeHandler(associatedElement, "dragleave",  this._dragLeaveHandler);
            $removeHandler(associatedElement, "dragover", this._dragOverHandler);
            $removeHandler(associatedElement, "drop", this._dropHandler);
        }
    },
    
    
    _onDragStart : function(ev) {
        window._event = ev;
        document.selection.empty();
        
        var dt = ev.dataTransfer;
        if(!dt && ev.rawEvent) dt = ev.rawEvent.dataTransfer;
        
        var dataType = this._activeDragSource.get_dragDataType().toLowerCase();
        var data = this._activeDragSource.getDragData(this._activeContext);
        
        if (data) {
            // TODO: How do we want to deal with 'non-compatible types'?
            if (dataType != "text" && dataType != "url") {
                dataType = "text";
                
                if (data.innerHTML != null) {
                    data = data.innerHTML;
                }
            }
            
            dt.effectAllowed = "move";
            dt.setData(dataType, data.toString());
        }
    },
    
    _onMouseUp : function(ev) {
        window._event = ev;
        this._stopDragDrop(false);
    },
    
    _onDocumentMouseMove : function(ev) {
        window._event = ev;
        this._dragDrop();
    },

    _onDocumentDragOver : function(ev) {
        window._event = ev;
        if(this._potentialTarget) ev.preventDefault();
        //ev.returnValue = (_potentialTarget == null);
    },
    
    _onMouseMove : function(ev) {
        window._event = ev;
        this._drag();
    },
    
    _onDragEnter : function(ev) {
        window._event = ev;
        if (this._isDragging) {
            ev.preventDefault();
            //ev.returnValue = false;
        }
        else {
            // An external object is dragged to the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.onDragEnterTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
    },
    
    _onDragLeave : function(ev) {
        window._event = ev;
        if (this._isDragging) {
            ev.preventDefault();
            //ev.returnValue = false;
        }
        else {
            // An external object is dragged to the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.onDragLeaveTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
    },
    
    _onDragOver : function(ev) {
        window._event = ev;
        if (this._isDragging) {
            ev.preventDefault();
            //ev.returnValue = false;
        }
        else {
            // An external object is dragged over the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.onDragInTarget(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
    },
    
    _onDrop : function(ev) {
        window._event = ev;
        if (!this._isDragging) {
            // An external object is dropped on the drop target.
            var dataObjects = AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget(this._getDropTarget(ev.target));
            for (var i = 0; i < dataObjects.length; i++) {
                this._dropTarget.drop(AjaxControlToolkit.DragMode.Copy, dataObjects[i].type, dataObjects[i].value);
            }
        }
        ev.preventDefault();
        //ev.returnValue = false;
    },
    
    _getDropTarget : function(element) {
        while (element) {
            if (element._dropTarget != null) {
                return element._dropTarget;
            }
            element = element.parentNode;
        }
        return null;
    },
    
    _dragDrop : function() {
        if (this._isDragging) {
            return;
        }
        
        this._isDragging = true;
        this._activeDragVisual.dragDrop();
        document.selection.empty();
    },
    
    _moveInTarget : function(dragSource, dropTarget) {
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dropTarget.onDragInTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
        this._recoverFromDomChanges();
    },
    
    _enterTarget : function(dragSource, dropTarget) {
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dropTarget.onDragEnterTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
        this._recoverFromDomChanges();
    },
    
    _leaveTarget : function(dragSource, dropTarget) {
        // Monitor DOM changes.
        this._prepareForDomChanges();
        dropTarget.onDragLeaveTarget(dragSource.get_dragMode(), dragSource.get_dragDataType(), dragSource.getDragData(this._activeContext));
        this._recoverFromDomChanges();
    },
    
    _findPotentialTarget : function(dragSource, dragVisual) {
        var ev = window._event;

        if (this._dropTargets == null) {
            return null;
        }
        
        var type = dragSource.get_dragDataType();
        var mode = dragSource.get_dragMode();
        var data = dragSource.getDragData(this._activeContext);

        // Get the current cursor location.
        var scrollOffset = this.getScrollOffset(document.body, /* recursive */ true);
        var x = ev.clientX + scrollOffset.x;
        var y = ev.clientY + scrollOffset.y;
        var cursorRect = { x: x - this._radius, y: y - this._radius, width: this._radius * 2, height: this._radius * 2 };
        
        // Find any targets near the current cursor location.
        var targetRect;
        for (var i = 0; i < this._dropTargets.length; i++) {
            targetRect = $common.getBounds(this._dropTargets[i].get_dropTargetElement());
            if ($common.overlaps(cursorRect, targetRect) && this._dropTargets[i].canDrop(mode, type, data)) {
                return this._dropTargets[i];
            }
        }
        
        return null;
    },
    
    _prepareForDomChanges : function() {
        this._oldOffset = $common.getLocation(this._activeDragVisual);
    },
    
    _recoverFromDomChanges : function() {
        var newOffset = $common.getLocation(this._activeDragVisual);
        if (this._oldOffset.x != newOffset.x || this._oldOffset.y != newOffset.y) {
            this._activeDragVisual.startingPoint = this.subtractPoints(this._activeDragVisual.startingPoint, this.subtractPoints(this._oldOffset, newOffset));
            scrollOffset = this.getScrollOffset(this._activeDragVisual, /* recursive */ true);
            var position = this.addPoints(this.subtractPoints(document._lastPosition, this._activeDragVisual.startingPoint), scrollOffset);
            $common.setLocation(this._activeDragVisual, position);
        }
    },
    
    addPoints : function(p1, p2) {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    },
    
    subtractPoints : function(p1, p2) {
        return { x: p1.x - p2.x, y: p1.y - p2.y };
    },
    
    // -- Drag and drop helper methods.
    getScrollOffset : function(element, recursive) {
        var left = element.scrollLeft;
        var top = element.scrollTop;
        if (recursive) {
            var parent = element.parentNode;
            while (parent != null && parent.scrollLeft != null) {
                left += parent.scrollLeft;
                top += parent.scrollTop;
                // Don't include anything below the body.
                if (parent == document.body && (left != 0 && top != 0))
                    break;
                parent = parent.parentNode;
            }
        }
        return { x: left, y: top };
    },
    
    getBrowserRectangle : function() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (width == null) {
            width = document.body.clientWidth;
        }
        if (height == null) {
            height = document.body.clientHeight;
        }
        
        return { x: 0, y: 0, width: width, height: height };
    },
    
    getNextSibling : function(item) {
        for (item = item.nextSibling; item != null; item = item.nextSibling) {
            if (item.innerHTML != null) {
                return item;
            }
        }
        return null;
    },
    
    hasParent : function(element) {
        return (element.parentNode != null && element.parentNode.tagName != null);
    }
}
AjaxControlToolkit.IEDragDropManager.registerClass('AjaxControlToolkit.IEDragDropManager', Sys.Component);

AjaxControlToolkit.IEDragDropManager._getDataObjectsForDropTarget = function(dropTarget) {
    if (dropTarget == null) {
        return [];
    }
    var ev = window._event;
    var dataObjects = [];
    var dataTypes = [ "URL", "Text" ];
    var data;
    for (var i = 0; i < dataTypes.length; i++) {
        var dt = ev.dataTransfer;
        if(!dt && ev.rawEvent) dt = ev.rawEvent.dataTransfer;
        data = dt.getData(dataTypes[i]);
        if (dropTarget.canDrop(AjaxControlToolkit.DragMode.Copy, dataTypes[i], data)) {
            if (data) {
                Array.add(dataObjects, { type : dataTypes[i], value : data });
            }
        }
    }

    return dataObjects;
}


AjaxControlToolkit.GenericDragDropManager = function() {
    AjaxControlToolkit.GenericDragDropManager.initializeBase(this);
    
    this._dropTargets = null;
    // Radius of the cursor used to determine what drop target we 
    // are hovering. Anything below the cursor's zone may be a 
    // potential drop target.
    this._scrollEdgeConst = 40;
    this._scrollByConst = 10;
    this._scroller = null;
    this._scrollDeltaX = 0;
    this._scrollDeltaY = 0;
    this._activeDragVisual = null;
    this._activeContext = null;
    this._activeDragSource = null;
    this._oldOffset = null;
    this._potentialTarget = null;
    this._mouseUpHandler = null;
    this._mouseMoveHandler = null;
    this._keyPressHandler = null;
    this._scrollerTickHandler = null;
}
AjaxControlToolkit.GenericDragDropManager.prototype = {
   
    initialize : function() {
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "initialize");
        this._mouseUpHandler = Function.createDelegate(this, this._onMouseUp);
        this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
        this._keyPressHandler = Function.createDelegate(this, this._onKeyPress);
        this._scrollerTickHandler = Function.createDelegate(this, this._onScrollerTick);
        if (Sys.Browser.agent === Sys.Browser.Safari) {
            AjaxControlToolkit.GenericDragDropManager.__loadSafariCompatLayer(this);
        }
        this._scroller = new Sys.Timer();
        this._scroller.set_interval(10);
        this._scroller.add_tick(this._scrollerTickHandler);
    },

    startDragDrop : function(dragSource, dragVisual, context) {
        this._activeDragSource = dragSource;
        this._activeDragVisual = dragVisual;
        this._activeContext = context;
        
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "startDragDrop", [dragSource, dragVisual, context]);
    },
    
    _stopDragDrop : function(cancelled) {
        this._scroller.set_enabled(false);
        
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "_stopDragDrop", [cancelled]);
    },
    
    _drag : function(isInitialDrag) {
        AjaxControlToolkit.GenericDragDropManager.callBaseMethod(this, "_drag", [isInitialDrag]);
        
        this._autoScroll();
    },
    
    _wireEvents : function() {
        $addHandler(document, "mouseup", this._mouseUpHandler);
        $addHandler(document, "mousemove", this._mouseMoveHandler);
        $addHandler(document, "keypress", this._keyPressHandler);
    },
    
    _unwireEvents : function() {
        $removeHandler(document, "keypress", this._keyPressHandler);
        $removeHandler(document, "mousemove", this._mouseMoveHandler);
        $removeHandler(document, "mouseup", this._mouseUpHandler);
    },
    
    _wireDropTargetEvents : function(dropTarget) {
        //
    },
    
    _unwireDropTargetEvents : function(dropTarget) {
        //
    },
    
    _onMouseUp : function(e) {
        window._event = e;
        this._stopDragDrop(false);
    },
    
    _onMouseMove : function(e) {
        window._event = e;
        this._drag();
    },
    
    _onKeyPress : function(e) {
        window._event = e;
        // Escape.
        var k = e.keyCode ? e.keyCode : e.rawEvent.keyCode;
        if (k == 27) {
            this._stopDragDrop(/* cancel */ true);
        }
    },
    
    _autoScroll : function() {
        var ev = window._event;
        var browserRect = this.getBrowserRectangle();
        if (browserRect.width > 0) {
            this._scrollDeltaX = this._scrollDeltaY = 0;
            if (ev.clientX < browserRect.x + this._scrollEdgeConst) this._scrollDeltaX = -this._scrollByConst;
            else if (ev.clientX > browserRect.width - this._scrollEdgeConst) this._scrollDeltaX = this._scrollByConst;
            if (ev.clientY < browserRect.y + this._scrollEdgeConst) this._scrollDeltaY = -this._scrollByConst;
            else if (ev.clientY > browserRect.height - this._scrollEdgeConst) this._scrollDeltaY = this._scrollByConst;
            if (this._scrollDeltaX != 0 || this._scrollDeltaY != 0) {
                this._scroller.set_enabled(true);
            }
            else {
                this._scroller.set_enabled(false);
            }
        }
    },
    
    _onScrollerTick : function() {
        var oldLeft = document.body.scrollLeft;
        var oldTop = document.body.scrollTop;
        window.scrollBy(this._scrollDeltaX, this._scrollDeltaY);
        var newLeft = document.body.scrollLeft;
        var newTop = document.body.scrollTop;
        
        var dragVisual = this._activeDragVisual;
        var position = { x: parseInt(dragVisual.style.left) + (newLeft - oldLeft), y: parseInt(dragVisual.style.top) + (newTop - oldTop) };
        $common.setLocation(dragVisual, position);
    }
}
AjaxControlToolkit.GenericDragDropManager.registerClass('AjaxControlToolkit.GenericDragDropManager', AjaxControlToolkit.IEDragDropManager);


if (Sys.Browser.agent === Sys.Browser.Safari) {
    AjaxControlToolkit.GenericDragDropManager.__loadSafariCompatLayer = function(ddm) {
        ddm._getScrollOffset = ddm.getScrollOffset;

        ddm.getScrollOffset = function(element, recursive) {
            return { x: 0, y: 0 };
        }

        ddm._getBrowserRectangle = ddm.getBrowserRectangle;

        ddm.getBrowserRectangle = function() {
            var browserRect = ddm._getBrowserRectangle();
            
            var offset = ddm._getScrollOffset(document.body, true);
            return { x: browserRect.x + offset.x, y: browserRect.y + offset.y,
                width: browserRect.width + offset.x, height: browserRect.height + offset.y };
        }
    }
}

//END AjaxControlToolkit.Compat.DragDrop.DragDropScripts.js
//START AjaxControlToolkit.DragPanel.FloatingBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Compat/DragDrop/DragDropScripts.js" />


AjaxControlToolkit.FloatingBehavior = function(element) {
    AjaxControlToolkit.FloatingBehavior.initializeBase(this,[element]);
    
    var _handle;
    var _location;
    var _dragStartLocation;
    var _profileProperty;
    var _profileComponent;
    
    var _mouseDownHandler = Function.createDelegate(this, mouseDownHandler);
    
    this.add_move = function(handler) {
        this.get_events().addHandler('move', handler);
    }
    this.remove_move = function(handler) {
        this.get_events().removeHandler('move', handler);
    }
    
    this.get_handle = function() {
        return _handle;
    }
    this.set_handle = function(value) {
        if (_handle != null) {
            $removeHandler(_handle, "mousedown", _mouseDownHandler);            
        }
    
        _handle = value;
        $addHandler(_handle, "mousedown", _mouseDownHandler);        
    }
    
    this.get_profileProperty = function() {
        return _profileProperty;
    }
    this.set_profileProperty = function(value) {
        //##DEBUG Sys.Debug.assert(!this.get_isInitialized() || _profileProperty === value, "You cannot change the profile property after initialization.");
        _profileProperty = value;
    }
    
    this.get_profileComponent = function() {
        return _profileComponent;
    }
    this.set_profileComponent = function(value) {
        _profileComponent = value;
    }
    
    this.get_location = function() {
        return _location;
    }
    this.set_location = function(value) {
        if (_location != value) {
            _location = value;
            if (this.get_isInitialized()) {                
                $common.setLocation(this.get_element(), _location);
            }
            this.raisePropertyChanged('location');
        }
    }
    
    this.initialize = function() {
        AjaxControlToolkit.FloatingBehavior.callBaseMethod(this, 'initialize');
        AjaxControlToolkit.DragDropManager.registerDropTarget(this);

        var el = this.get_element();

        
        if (!_location) {                       
            _location = $common.getLocation(el);
        }
        
        el.style.position = "fixed";
        $common.setLocation(el, _location);

//        var p = this.get_profileProperty();
//        if(p) {
//            var b = new Sys.Preview.Binding();
//            b.beginUpdate();
//            b.set_target(this);
//            b.set_property("location");
//            var profile = this.get_profileComponent();
//            if(!profile) profile = Sys.Preview.Services.Components.Profile.instance;
//            b.set_dataContext(profile);
//            b.set_dataPath(p);
//            b.set_direction(Sys.Preview.BindingDirection.InOut);            
//                      
//            // we must hook into the loaded event since the profile may be loaded and the location property
//            // will be different. But profile doesnt raise a change notificaiton for every property after a load
//            var a = new Sys.Preview.InvokeMethodAction();
//            a.beginUpdate();
//            a.set_eventSource(profile);
//            a.set_eventName("loadComplete");
//            a.set_target(b);
//            a.set_method("evaluateIn");

//            a.endUpdate();
//            b.endUpdate();

//            this._binding = b;
//            this._action = a;
//        }
    }
    
    this.dispose = function() {
        AjaxControlToolkit.DragDropManager.unregisterDropTarget(this);
        if (_handle && _mouseDownHandler) {
            $removeHandler(_handle, "mousedown", _mouseDownHandler);
            //_handle.detachEvent("onmousedown", _mouseDownHandler);
        }
        _mouseDownHandler = null;
        AjaxControlToolkit.FloatingBehavior.callBaseMethod(this, 'dispose');
    }
    
    this.checkCanDrag = function(element) {
        var undraggableTagNames = ["input", "button", "select", "textarea", "label"];
        var tagName = element.tagName;
        
        if ((tagName.toLowerCase() == "a") && (element.href != null) && (element.href.length > 0)) {
            return false;
        }
        if (Array.indexOf(undraggableTagNames, tagName.toLowerCase()) > -1) {
            return false;
        }
        return true;
    }
    
    function mouseDownHandler(ev) {
        window._event = ev;
        var el = this.get_element();
        
        if (this.checkCanDrag(ev.target)) {
            _dragStartLocation = $common.getLocation(el);
            
            ev.preventDefault();
            
            this.startDragDrop(el);
        }
    }

    // Type get_dataType()
    this.get_dragDataType = function() {
        return "_floatingObject";
    }
    
    // Object get_data(Context)
    this.getDragData = function(context) {
        return null;
    }
    
    // DragMode get_dragMode()
    this.get_dragMode = function() {
        return AjaxControlToolkit.DragMode.Move;
    }
    
    // void onDragStart()
    this.onDragStart = function() { }
    
    // void onDrag()
    this.onDrag = function() { }
    
    // void onDragEnd(Canceled)
    this.onDragEnd = function(canceled) {
        if (!canceled) {
            var handler = this.get_events().getHandler('move');
            if(handler) {
                var cancelArgs = new Sys.CancelEventArgs();
                handler(this, cancelArgs);
                canceled = cancelArgs.get_cancel();
            }            
        }
        
        var el = this.get_element();
        if (canceled) {
            // Restore the position of the control.
            $common.setLocation(el, _dragStartLocation);
        } else {
            _location = $common.getLocation(el);
            this.raisePropertyChanged('location');
        }
    }
    
    this.startDragDrop = function(dragVisual) {
        AjaxControlToolkit.DragDropManager.startDragDrop(this, dragVisual, null);
    }
    
    this.get_dropTargetElement = function() {
        return document.body;
    }
    
    // bool canDrop(DragMode, DataType, Data)
    this.canDrop = function(dragMode, dataType, data) {
        return (dataType == "_floatingObject");
    }
    
    // void drop(DragMode, DataType, Data)
    this.drop = function(dragMode, dataType, data) {}
    
    // void onDragEnterTarget(DragMode, DataType, Data)
    this.onDragEnterTarget = function(dragMode, dataType, data) {}
    
    // void onDragLeaveTarget(DragMode, DataType, Data)
    this.onDragLeaveTarget = function(dragMode, dataType, data) {}
    
    // void onDragInTarget(DragMode, DataType, Data)
    this.onDragInTarget = function(dragMode, dataType, data) {}
}
//AjaxControlToolkit.FloatingBehavior.descriptor = {
//    properties: [   {name: "profileProperty", type: String},
//                    {name: "profileComponent", type: Object},
//                    {name: "dragData", type: Object, readOnly: true},
//                    {name: "dragDataType", type: String, readOnly: true},
//                    {name: "dragMode", type: AjaxControlToolkit.DragMode, readOnly: true},
//                    {name: "dropTargetElement", type: Object, readOnly: true},
//                    {name: "handle", type: Sys.UI.DomElement},
//                    {name: "location", type: String} ],
//    events: [   {name: "move"} ]
//}
AjaxControlToolkit.FloatingBehavior.registerClass('AjaxControlToolkit.FloatingBehavior', AjaxControlToolkit.BehaviorBase, AjaxControlToolkit.IDragSource, AjaxControlToolkit.IDropTarget, Sys.IDisposable);

//END AjaxControlToolkit.DragPanel.FloatingBehavior.js
//START AjaxControlToolkit.ModalPopup.ModalPopupBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../DynamicPopulate/DynamicPopulateBehavior.js" />
/// <reference path="../RoundedCorners/RoundedCornersBehavior.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../DropShadow/DropShadowBehavior.js" />
/// <reference path="../Compat/DragDrop/DragDropScripts.js" />
/// <reference path="../DragPanel/FloatingBehavior.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.ModalPopupRepositionMode = function() {
    /// <summary>
    /// The ModalPopupRepositionMode enumeration describes how the modal popup repositions
    /// </summary>
    /// <field name="None" type="Number" integer="true" />
    /// <field name="RepositionOnWindowResize" type="Number" integer="true" />
    /// <field name="RepositionOnWindowScroll" type="Number" integer="true" />
    /// <field name="RepositionOnWindowResizeAndScroll" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.ModalPopupRepositionMode.prototype = {
    None : 0,
    RepositionOnWindowResize : 1,
    RepositionOnWindowScroll : 2,
    RepositionOnWindowResizeAndScroll : 3
}
AjaxControlToolkit.ModalPopupRepositionMode.registerEnum('AjaxControlToolkit.ModalPopupRepositionMode');


AjaxControlToolkit.ModalPopupBehavior = function(element) {
    /// <summary>
    /// The ModalPopupBehavior is used to display the target element as a modal dialog
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// DOM Element the behavior is associated with
    /// </param>
    AjaxControlToolkit.ModalPopupBehavior.initializeBase(this, [element]);
    
    // Properties
    this._PopupControlID = null;
    this._PopupDragHandleControlID = null;
    this._BackgroundCssClass = null;
    this._DropShadow = false;
    this._Drag = false;    
    this._OkControlID = null;
    this._CancelControlID = null;
    this._OnOkScript = null;
    this._OnCancelScript = null;
    this._xCoordinate = -1;
    this._yCoordinate = -1;
    this._repositionMode = AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResizeAndScroll;

    // Variables
    this._backgroundElement = null;
    this._foregroundElement = null;
    this._relativeOrAbsoluteParentElement = null;
    this._popupElement = null;
    this._dragHandleElement = null;
    this._showHandler = null;
    this._okHandler = null;
    this._cancelHandler = null;
    this._scrollHandler = null;
    this._resizeHandler = null;
    this._windowHandlersAttached = false;
    this._dropShadowBehavior = null;
    this._dragBehavior = null;
    this._isIE6 = false;

    this._saveTabIndexes = new Array();
    this._saveDesableSelect = new Array();
    this._tagWithTabIndex = new Array('A','AREA','BUTTON','INPUT','OBJECT','SELECT','TEXTAREA','IFRAME');
}
AjaxControlToolkit.ModalPopupBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        
        /*
            <div superpopup - drag container resizable><div -- drag handle\dropshadow foreground></div></div>
        */
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, 'initialize');
        this._isIE6 = (Sys.Browser.agent == Sys.Browser.InternetExplorer && Sys.Browser.version < 7);
        if(this._PopupDragHandleControlID)
            this._dragHandleElement = $get(this._PopupDragHandleControlID);

        this._popupElement = $get(this._PopupControlID);
        if(this._DropShadow)
        {
            this._foregroundElement = document.createElement('div');
            this._foregroundElement.id = this.get_id() + '_foregroundElement';
            this._popupElement.parentNode.appendChild(this._foregroundElement);
            this._foregroundElement.appendChild(this._popupElement);
        }
        else
        {
            this._foregroundElement = this._popupElement;
        }
        this._backgroundElement = document.createElement('div');
        this._backgroundElement.id = this.get_id() + '_backgroundElement';
        this._backgroundElement.style.display = 'none';
        this._backgroundElement.style.position = 'fixed';
        this._backgroundElement.style.left = '0px';
        this._backgroundElement.style.top = '0px';
        // Want zIndex to big enough that the background sits above everything else
        // CSS 2.1 defines no bounds for the <integer> type, so pick arbitrarily
        this._backgroundElement.style.zIndex = 10000;
        if (this._BackgroundCssClass) {
            this._backgroundElement.className = this._BackgroundCssClass;
        }
        this._foregroundElement.parentNode.appendChild(this._backgroundElement);

        this._foregroundElement.style.display = 'none';
        this._foregroundElement.style.position = 'fixed';
        this._foregroundElement.style.zIndex = $common.getCurrentStyle(this._backgroundElement, 'zIndex', this._backgroundElement.style.zIndex) + 1;
        
        this._showHandler = Function.createDelegate(this, this._onShow);
        $addHandler(this.get_element(), 'click', this._showHandler);

        if (this._OkControlID) {
            this._okHandler = Function.createDelegate(this, this._onOk);
            $addHandler($get(this._OkControlID), 'click', this._okHandler);
        }

        if (this._CancelControlID) {
            this._cancelHandler = Function.createDelegate(this, this._onCancel);
            $addHandler($get(this._CancelControlID), 'click', this._cancelHandler);
        }

        this._scrollHandler = Function.createDelegate(this, this._onLayout);
        this._resizeHandler = Function.createDelegate(this, this._onLayout);

        // Need to know when partial updates complete
        this.registerPartialUpdateEvents();
    },

    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>

        // Going away; restore any changes to the page
        this._hideImplementation();

        if (this._foregroundElement && this._foregroundElement.parentNode) {
            // Remove background we added to the DOM
            this._foregroundElement.parentNode.removeChild(this._backgroundElement);

            if(this._DropShadow) {
                // Remove DIV wrapper added in initialize
                this._foregroundElement.parentNode.appendChild(this._popupElement);
                this._foregroundElement.parentNode.removeChild(this._foregroundElement);
            }
        }

        this._scrollHandler = null;
        this._resizeHandler = null;
        if (this._cancelHandler && $get(this._CancelControlID)) {
            $removeHandler($get(this._CancelControlID), 'click', this._cancelHandler);
            this._cancelHandler = null;
        }
        if (this._okHandler && $get(this._OkControlID)) {
            $removeHandler($get(this._OkControlID), 'click', this._okHandler);
            this._okHandler = null;
        }
        if (this._showHandler) {
            $removeHandler(this.get_element(), 'click', this._showHandler);
            this._showHandler = null;
        }
        
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, 'dispose');
    },

    _attachPopup : function() {
        /// <summary>
        /// Attach the event handlers for the popup
        /// </summary>

        if (this._DropShadow && !this._dropShadowBehavior) {
            this._dropShadowBehavior = $create(AjaxControlToolkit.DropShadowBehavior, {}, null, null, this._popupElement);
        }
        if (this._dragHandleElement && !this._dragBehavior) {
            this._dragBehavior = $create(AjaxControlToolkit.FloatingBehavior, {"handle" : this._dragHandleElement}, null, null, this._foregroundElement);
        }        
                
        $addHandler(window, 'resize', this._resizeHandler);
        $addHandler(window, 'scroll', this._scrollHandler);
        this._windowHandlersAttached = true;
    },

    _detachPopup : function() {
        /// <summary>
        /// Detach the event handlers for the popup
        /// </summary>

        if (this._windowHandlersAttached) {
            if (this._scrollHandler) {
                $removeHandler(window, 'scroll', this._scrollHandler);
            }
            if (this._resizeHandler) {
                $removeHandler(window, 'resize', this._resizeHandler);
            }
            this._windowHandlersAttached = false;
        }
        
        if (this._dragBehavior) {
            this._dragBehavior.dispose();
            this._dragBehavior = null;
        }       
        
        if (this._dropShadowBehavior) {
            this._dropShadowBehavior.dispose();
            this._dropShadowBehavior = null;
        }
    },

    _onShow : function(e) {
        /// <summary>
        /// Handler for the target's click event
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        if (!this.get_element().disabled) {
            this.show();
            e.preventDefault();
            return false;
        }
    },

    _onOk : function(e) {
        /// <summary>
        /// Handler for the modal dialog's OK button click
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        var element = $get(this._OkControlID);
        if (element && !element.disabled) {
            if (this.hide() && this._OnOkScript) {
                window.setTimeout(this._OnOkScript, 0);
            }
            e.preventDefault();
            return false;
        }
    },

    _onCancel : function(e) {
        /// <summary>
        /// Handler for the modal dialog's Cancel button click
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        var element = $get(this._CancelControlID);
        if (element && !element.disabled) {
            if (this.hide() && this._OnCancelScript) {
                window.setTimeout(this._OnCancelScript, 0);
            }
            e.preventDefault();
            return false;
        }
    },

    _onLayout : function(e) {
        /// <summary>
        /// Handler for scrolling and resizing events that would require a repositioning of the modal dialog
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>
        var positioning = this.get_repositionMode();
        if (((positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowScroll) ||
            (positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResizeAndScroll)) && (e.type === 'scroll')) {
            this._layout();
        } else if (((positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResize) ||
            (positioning === AjaxControlToolkit.ModalPopupRepositionMode.RepositionOnWindowResizeAndScroll)) && (e.type === 'resize')) {
            this._layout();
        } else {
            // Layout background element again to make sure it covers the whole background.
            // This needs to be called separately since _layout will not be always called
            // to reposition the popup depending on the RepositionMode but the background needs 
            // to handle the resize/scroll every time.
            this._layoutBackgroundElement();
        }
    },

    show : function() {
        /// <summary>
        /// Display the element referenced by PopupControlID as a modal dialog
        /// </summary>
        
        var eventArgs = new Sys.CancelEventArgs();
        this.raiseShowing(eventArgs);
        if (eventArgs.get_cancel()) {
            return;
        }
        
        this.populate();
        this._attachPopup();

        this._backgroundElement.style.display = '';
        this._foregroundElement.style.display = '';
        this._popupElement.style.display = '';
        if (this._isIE6) {
            this._foregroundElement.style.position = 'absolute';
            this._backgroundElement.style.position = 'absolute'; 
            // find the relative or absolute parent
            var tempRelativeOrAbsoluteParent = this._foregroundElement.parentNode;
            while (tempRelativeOrAbsoluteParent && (tempRelativeOrAbsoluteParent != document.documentElement)) {
                if((tempRelativeOrAbsoluteParent.style.position != 'relative') && (tempRelativeOrAbsoluteParent.style.position != 'absolute')) {
                    tempRelativeOrAbsoluteParent = tempRelativeOrAbsoluteParent.parentNode;
                } else {
                    this._relativeOrAbsoluteParentElement = tempRelativeOrAbsoluteParent;
                    break;
                }
            }                       
        }        


        // Disable TAB
        this.disableTab();

        this._layout();
        // On pages that don't need scrollbars, Firefox and Safari act like
        // one or both are present the first time the layout code runs which
        // obviously leads to display issues - run the layout code a second
        // time to work around this problem
        this._layout();
        
        this.raiseShown(Sys.EventArgs.Empty);
    },

    disableTab : function() {
        /// <summary>
        /// Change the tab indices so we only tab through the modal popup
        /// (and hide SELECT tags in IE6)
        /// </summary>

        var i = 0;
        var tagElements;
        var tagElementsInPopUp = new Array();
        Array.clear(this._saveTabIndexes);

        //Save all popup's tag in tagElementsInPopUp
        for (var j = 0; j < this._tagWithTabIndex.length; j++) {
            tagElements = this._foregroundElement.getElementsByTagName(this._tagWithTabIndex[j]);
            for (var k = 0 ; k < tagElements.length; k++) {
                tagElementsInPopUp[i] = tagElements[k];
                i++;
            }
        }

        i = 0;
        for (var j = 0; j < this._tagWithTabIndex.length; j++) {
            tagElements = document.getElementsByTagName(this._tagWithTabIndex[j]);
            for (var k = 0 ; k < tagElements.length; k++) {
                if (Array.indexOf(tagElementsInPopUp, tagElements[k]) == -1)  {
                    this._saveTabIndexes[i] = {tag: tagElements[k], index: tagElements[k].tabIndex};
                    tagElements[k].tabIndex="-1";
                    i++;
                }
            }
        }

        //IE6 Bug with SELECT element always showing up on top
        i = 0;
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version < 7)) {
            //Save SELECT in PopUp
            var tagSelectInPopUp = new Array();
            for (var j = 0; j < this._tagWithTabIndex.length; j++) {
                tagElements = this._foregroundElement.getElementsByTagName('SELECT');
                for (var k = 0 ; k < tagElements.length; k++) {
                    tagSelectInPopUp[i] = tagElements[k];
                    i++;
                }
            }

            i = 0;
            Array.clear(this._saveDesableSelect);
            tagElements = document.getElementsByTagName('SELECT');
            for (var k = 0 ; k < tagElements.length; k++) {
                if (Array.indexOf(tagSelectInPopUp, tagElements[k]) == -1)  {
                    this._saveDesableSelect[i] = {tag: tagElements[k], visib: $common.getCurrentStyle(tagElements[k], 'visibility')} ;
                    tagElements[k].style.visibility = 'hidden';
                    i++;
                }
            }
        }
    },

    restoreTab : function() {
        /// <summary>
        /// Restore the tab indices so we tab through the page like normal
        /// (and restore SELECT tags in IE6)
        /// </summary>

        for (var i = 0; i < this._saveTabIndexes.length; i++) {
            this._saveTabIndexes[i].tag.tabIndex = this._saveTabIndexes[i].index;
        }
        Array.clear(this._saveTabIndexes);

        //IE6 Bug with SELECT element always showing up on top
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version < 7)) {
            for (var k = 0 ; k < this._saveDesableSelect.length; k++) {
                this._saveDesableSelect[k].tag.style.visibility = this._saveDesableSelect[k].visib;
            }
            Array.clear(this._saveDesableSelect);
        }
    },

    hide : function() {
        /// <summary>
        /// Hide the modal dialog
        /// </summary>
        /// <returns type="Boolean" mayBeNull="false">
        /// Whether or not the dialog was hidden
        /// </returns>

        var eventArgs = new Sys.CancelEventArgs();
        this.raiseHiding(eventArgs);
        if (eventArgs.get_cancel()) {
            return false;
        }

        this._hideImplementation();

        this.raiseHidden(Sys.EventArgs.Empty);
        return true;
    },

    _hideImplementation : function() {
        /// <summary>
        /// Internal implementation to hide the modal dialog
        /// </summary>

        this._backgroundElement.style.display = 'none';
        this._foregroundElement.style.display = 'none';

        this.restoreTab();

        this._detachPopup();
    },

    _layout : function() {
        /// <summary>
        /// Position the modal dialog 
        /// </summary>
        var scrollLeft = (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        var scrollTop = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
               
        var clientBounds = $common.getClientBounds();
        var clientWidth = clientBounds.width;
        var clientHeight = clientBounds.height;
        
        // Setup the location of the background element
        this._layoutBackgroundElement();

        var xCoord = 0;
        var yCoord = 0;
        if(this._xCoordinate < 0) {
            var foregroundelementwidth = this._foregroundElement.offsetWidth? this._foregroundElement.offsetWidth: this._foregroundElement.scrollWidth;
            xCoord = ((clientWidth-foregroundelementwidth)/2);
            // workaround for drag behavior which calls setlocation which in turn
            // changes the position of the panel to be absolute and requiring us
            // to add the scrollLeft so that it is positioned correctly.
            if (this._foregroundElement.style.position == 'absolute') {
                xCoord += scrollLeft;
            }
            this._foregroundElement.style.left = xCoord + 'px';
            
        } else {
            if(this._isIE6) {
                this._foregroundElement.style.left = (this._xCoordinate + scrollLeft) + 'px';
                xCoord = this._xCoordinate + scrollLeft;
            }
            else {
                this._foregroundElement.style.left = this._xCoordinate + 'px';
                xCoord = this._xCoordinate;
            }
        }
        if(this._yCoordinate < 0) {
            var foregroundelementheight = this._foregroundElement.offsetHeight? this._foregroundElement.offsetHeight: this._foregroundElement.scrollHeight;
            yCoord = ((clientHeight-foregroundelementheight)/2);           
            // workaround for drag behavior which calls setlocation which in turn
            // changes the position of the panel to be absolute and requiring us
            // to add the scrollLeft so that it is positioned correctly.
            if (this._foregroundElement.style.position == 'absolute') {
                yCoord += scrollTop;
            }
            this._foregroundElement.style.top = yCoord + 'px';
          
        } else {
            if(this._isIE6) {
                this._foregroundElement.style.top = (this._yCoordinate + scrollTop) + 'px';
                yCoord = this._yCoordinate + scrollTop;
            }
            else {
                this._foregroundElement.style.top = this._yCoordinate + 'px';
                yCoord = this._yCoordinate;
            }
        }

        // make sure get location agrees with the location of the foreground element
        this._layoutForegroundElement(xCoord, yCoord);
        
        if (this._dropShadowBehavior) {
            this._dropShadowBehavior.setShadow();
            window.setTimeout(Function.createDelegate(this, this._fixupDropShadowBehavior), 0);
        }
        
        // layout background element again to make sure it covers the whole background 
        // in case things moved around when laying out the foreground element
        this._layoutBackgroundElement();
    },
    
    _layoutForegroundElement : function(xCoord, yCoord) {
        /// <summary>
        /// Set the correct location of the foreground element to ensure that it is absolutely 
        /// positioned with respect to the browser. This is just a workaround for IE 6 since
        /// elements nested in relative parents cause modal popup positioning issues and 'fixed'
        /// is not supported by IE 6. Hence we manually compute the right location of the popup.
        /// </summary>
        /// <param name="xCoord" type="Number" integer="true" maybenull="false">
        /// <param name="yCoord" type="Number" integer="true" maybenull="false">        
        /// </params>
        
        if (this._isIE6 && this._relativeOrAbsoluteParentElement) {
            var foregroundLocation = $common.getLocation(this._foregroundElement);  
            var relativeParentLocation = $common.getLocation(this._relativeOrAbsoluteParentElement);
            var getLocationXCoord = foregroundLocation.x;
            if (getLocationXCoord != xCoord) {
                // offset it by that amount
                this._foregroundElement.style.left = (xCoord - relativeParentLocation.x) + 'px';
            } 
                        
            var getLocationYCoord = foregroundLocation.y;
            if (getLocationYCoord != yCoord) {
                // offset it by that amount
                this._foregroundElement.style.top = (yCoord - relativeParentLocation.y) + 'px';
            } 
        }
    },
    
    _layoutBackgroundElement : function() {
        /// <summary>
        /// Set the correct location of the background element to ensure that it is absolutely 
        /// positioned with respect to the browser.
        /// </summary>

        // Background element needs to cover the visible client area completely hence its
        // top and left coordinates need to be 0, and if relatively positioned its getlocation
        // value needs to be 0.
        if(this._isIE6) { 
            var backgroundLocation = $common.getLocation(this._backgroundElement);
            var backgroundXCoord = backgroundLocation.x;
            if (backgroundXCoord != 0) {
                // offset it by that amount. This is assuming only one level of nesting. If
                // multiple parents with absolute/relative positioning are setup this may not 
                // cover the whole background.
                this._backgroundElement.style.left = (-backgroundXCoord) + 'px';
            } 
            
            var backgroundYCoord = backgroundLocation.y;
            if (backgroundYCoord != 0) {
                // offset it by that amount. This is assuming only one level of nesting. If
                // multiple parents with absolute/relative positioning are setup this may not 
                // cover the whole background.
                this._backgroundElement.style.top = (-backgroundYCoord) + 'px';
            }         
        }
        var clientBounds = $common.getClientBounds();
        var clientWidth = clientBounds.width;
        var clientHeight = clientBounds.height;
        this._backgroundElement.style.width = Math.max(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), clientWidth)+'px';
        this._backgroundElement.style.height = Math.max(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), clientHeight)+'px';
    },

    _fixupDropShadowBehavior : function() {
        /// <summary>
        /// Some browsers don't update the location values immediately, so
        /// the location of the drop shadow would always be a step behind
        /// without this method
        /// </summary>

        if (this._dropShadowBehavior) {
            this._dropShadowBehavior.setShadow();
        }
    },

    _partialUpdateEndRequest : function(sender, endRequestEventArgs) {
        /// <summary>
        /// Show the popup if requested during a partial postback
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="endRequestEventArgs" type="Sys.WebForms.EndRequestEventArgs">
        /// Event arguments
        /// </param>
        /// <returns />
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, '_partialUpdateEndRequest', [sender, endRequestEventArgs]);

        if (this.get_element()) {
            // Look up result by element's ID
            var action = endRequestEventArgs.get_dataItems()[this.get_element().id];
            if ("show" == action) {
                this.show();
            } else if ("hide" == action) {
                this.hide();
            }
        }

        // Async postback may have added content; re-layout to accomodate it
        this._layout();
    },

    _onPopulated : function(sender, eventArgs) {
        /// <summary>
        /// Re-layout the popup after we've dynamically populated
        /// </summary>
        /// <param name="sender" type="Object">
        /// Sender
        /// </param>
        /// <param name="eventArgs" type="Sys.EventArgs">
        /// Event arguments
        /// </param>
        /// <returns />
        AjaxControlToolkit.ModalPopupBehavior.callBaseMethod(this, '_onPopulated', [sender, eventArgs]);

        // Dynamic populate may have added content; re-layout to accomodate it
        this._layout();
    },
    
    get_PopupControlID : function() {
        /// <value type="String">
        /// The ID of the element to display as a modal popup
        /// </value>
        return this._PopupControlID;
    },
    set_PopupControlID : function(value) {
        if (this._PopupControlID != value) {
            this._PopupControlID = value;
            this.raisePropertyChanged('PopupControlID');
        }
    },

    get_X: function() {
        /// <value type="Number" integer="true">
        /// The number of pixels from the left of the browser to position the modal popup.
        /// </value>
        return this._xCoordinate;
    },
    set_X: function(value) {
        if (this._xCoordinate != value) {
            this._xCoordinate = value;
            this.raisePropertyChanged('X');
        }
    },

    get_Y: function() {
        /// <value type="Number" integer="true">
        /// The number of pixels from the top of the browser to position the modal popup.
        /// </value>
        return this._yCoordinate;
    },
    set_Y: function(value) {
        if (this._yCoordinate != value) {
            this._yCoordinate = value;
            this.raisePropertyChanged('Y');
        }
    },
       
    get_PopupDragHandleControlID : function() {
        /// <value type="String">
        /// The ID of the element to display as the drag handle for the modal popup
        /// </value>
        return this._PopupDragHandleControlID;
    },
    set_PopupDragHandleControlID : function(value) {
        if (this._PopupDragHandleControlID != value) {
            this._PopupDragHandleControlID = value;
            this.raisePropertyChanged('PopupDragHandleControlID');
        }
    },

    get_BackgroundCssClass : function() {
        /// <value type="String">
        /// The CSS class to apply to the background when the modal popup is displayed
        /// </value>
        return this._BackgroundCssClass;
    },
    set_BackgroundCssClass : function(value) {
        if (this._BackgroundCssClass != value) {
            this._BackgroundCssClass = value;
            this.raisePropertyChanged('BackgroundCssClass');
        }
    },

    get_DropShadow : function() {
        /// <value type="Boolean">
        /// Whether or not a drop-shadow should be added to the modal popup
        /// </value>
        return this._DropShadow;
    },
    set_DropShadow : function(value) {
        if (this._DropShadow != value) {
            this._DropShadow = value;
            this.raisePropertyChanged('DropShadow');
        }
    },

    get_Drag : function() {
        /// <value type="Boolean">
        /// Obsolete: Setting the _Drag property is a noop
        /// </value>
        return this._Drag;
    },
    set_Drag : function(value) {
        if (this._Drag != value) {
            this._Drag = value;
            this.raisePropertyChanged('Drag');
        }
    },

    get_OkControlID : function() {
        /// <value type="String">
        /// The ID of the element that dismisses the modal popup
        /// </value>
        return this._OkControlID;
    },
    set_OkControlID : function(value) {
        if (this._OkControlID != value) {
            this._OkControlID = value;
            this.raisePropertyChanged('OkControlID');
        }
    },

    get_CancelControlID : function() {
        /// <value type="String">
        /// The ID of the element that cancels the modal popup
        /// </value>
        return this._CancelControlID;
    },
    set_CancelControlID : function(value) {
        if (this._CancelControlID != value) {
            this._CancelControlID = value;
            this.raisePropertyChanged('CancelControlID');
        }
    },

    get_OnOkScript : function() {
        /// <value type="String">
        /// Script to run when the modal popup is dismissed with the OkControlID
        /// </value>
        return this._OnOkScript;
    },
    set_OnOkScript : function(value) {
        if (this._OnOkScript != value) {
            this._OnOkScript = value;
            this.raisePropertyChanged('OnOkScript');
        }
    },

    get_OnCancelScript : function() {
        /// <value type="String">
        /// Script to run when the modal popup is dismissed with the CancelControlID
        /// </value>
        return this._OnCancelScript;
    },
    set_OnCancelScript : function(value) {
        if (this._OnCancelScript != value) {
            this._OnCancelScript = value;
            this.raisePropertyChanged('OnCancelScript');
        }
    },

    get_repositionMode : function() {
        /// <value type="AjaxControlToolkit.ModalPopupRepositionMode">
        /// Determines if the ModalPopup should be repositioned on window resize/scroll
        /// </value>
        return this._repositionMode;
    },
    set_repositionMode : function(value) {
        if (this._repositionMode !== value) {
            this._repositionMode = value;
            this.raisePropertyChanged('RepositionMode');
        }
    },
    
    add_showing : function(handler) {
        /// <summary>
        /// Add an event handler for the showing event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('showing', handler);
    },
    remove_showing : function(handler) {
        /// <summary>
        /// Remove an event handler from the showing event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('showing', handler);
    },
    raiseShowing : function(eventArgs) {
        /// <summary>
        /// Raise the showing event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the showing event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('showing');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_shown : function(handler) {
        /// <summary>
        /// Add an event handler for the shown event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('shown', handler);
    },
    remove_shown : function(handler) {
        /// <summary>
        /// Remove an event handler from the shown event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('shown', handler);
    },
    raiseShown : function(eventArgs) {
        /// <summary>
        /// Raise the shown event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the shown event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('shown');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_hiding : function(handler) {
        /// <summary>
        /// Add an event handler for the hiding event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('hiding', handler);
    },
    remove_hiding : function(handler) {
        /// <summary>
        /// Remove an event handler from the hiding event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('hiding', handler);
    },
    raiseHiding : function(eventArgs) {
        /// <summary>
        /// Raise the hiding event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the hiding event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hiding');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_hidden : function(handler) {
        /// <summary>
        /// Add an event handler for the hidden event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('hidden', handler);
    },
    remove_hidden : function(handler) {
        /// <summary>
        /// Remove an event handler from the hidden event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('hidden', handler);
    },
    raiseHidden : function(eventArgs) {
        /// <summary>
        /// Raise the hidden event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the hidden event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hidden');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.ModalPopupBehavior.registerClass('AjaxControlToolkit.ModalPopupBehavior', AjaxControlToolkit.DynamicPopulateBehaviorBase);

AjaxControlToolkit.ModalPopupBehavior.invokeViaServer = function(behaviorID, show) {
    /// <summary>
    /// This static function (that is intended to be called from script emitted
    /// on the server) will show or hide the behavior associated with behaviorID
    /// (i.e. to use this, the ModalPopupExtender must have an ID or BehaviorID) and
    /// will either show or hide depending on the show parameter.
    /// </summary>
    /// <param name="behaviorID" type="String">
    /// ID of the modal popup behavior
    /// </param>
    /// <param name="show" type="Boolean">
    /// Whether to show or hide the modal popup
    /// </param>
    var behavior = $find(behaviorID);
    if (behavior) {
        if (show) {
            behavior.show();
        } else {
            behavior.hide();
        }
    }
}

//END AjaxControlToolkit.ModalPopup.ModalPopupBehavior.js
//START AjaxControlToolkit.FilteredTextBox.FilteredTextBoxBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.FilteredTextBoxBehavior = function(element) {
    /// <summary>
    /// The FilteredTextBoxBehavior is used to prevent invalid characters from being entered into a textbox
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement">
    /// The textbox element this behavior is associated with
    /// </param>
    AjaxControlToolkit.FilteredTextBoxBehavior.initializeBase(this, [element]);
    
    this._keypressHandler = null;
    this._changeHandler = null;
    
    this._intervalID = null;
    
    this._filterType =  AjaxControlToolkit.FilterTypes.Custom;
    this._filterMode =  AjaxControlToolkit.FilterModes.ValidChars;
    this._validChars = null;
    this._invalidChars = null;
    this._filterInterval = 250;
    
    this.charTypes = { };
    this.charTypes.LowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
    this.charTypes.UppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.charTypes.Numbers = "0123456789";
}
AjaxControlToolkit.FilteredTextBoxBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the behavior
        /// </summary>
        AjaxControlToolkit.FilteredTextBoxBehavior.callBaseMethod(this, 'initialize');
        
        var element = this.get_element();

        this._keypressHandler = Function.createDelegate(this, this._onkeypress);
        $addHandler(element, 'keypress', this._keypressHandler);
        
        this._changeHandler = Function.createDelegate(this, this._onchange);
        $addHandler(element, 'change', this._changeHandler);

        var callback = Function.createDelegate(this, this._intervalCallback);
        this._intervalID = window.setInterval(callback, this._filterInterval);
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose the behavior
        /// </summary>
        var element = this.get_element();
        
        $removeHandler(element, 'keypress', this._keypressHandler);
        this._keypressHandler = null;
        
        $removeHandler(element, 'change', this._changeHandler);
        this._changeHandler = null;

        window.clearInterval(this._intervalID);
        
        AjaxControlToolkit.FilteredTextBoxBehavior.callBaseMethod(this, 'dispose');
    },
    
    _getValidChars : function() {
        /// <summary>
        /// Get all the valid characters
        /// </summary>
        /// <returns type="String">
        /// All valid characters
        /// </returns>

        if (this._validChars) return this._validChars;
        this._validChars = "";
        
        for (type in this.charTypes) {
            var filterType = AjaxControlToolkit.FilterTypes.toString(this._filterType);
            if (filterType.indexOf(type) != -1) {
                this._validChars += this.charTypes[type];
            }
        }

        return this._validChars;    
    },
    
    _getInvalidChars : function() {
        /// <summary>
        /// Get all the invalid characters (in case of custom filtering and InvalidChars mode)
        /// </summary>
        /// <returns type="String">
        /// All invalid characters
        /// </returns>

        if (!this._invalidChars) {
            this._invalidChars = this.charTypes.Custom;
        }
        return this._invalidChars;
    },

    _onkeypress : function(evt) {
        /// <summary>
        /// Handler for the target textbox's key press event
        /// </summary>
        /// <param name="evt" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>

        // This handler will only get called for valid characters in IE, we use keyCode
        //
        // In FireFox, this will be called for all key presses, with charCode/which
        // being set for keys we should filter (e.g. the chars) and keyCode being
        // set for all other keys.
        //
        // scanCode = event.charCode
        //
        // In Safari, charCode, which, and keyCode will all be filled with the same value,
        // as well as keyIdentifier, which has the string representation either as "end" or "U+00000008"
        //
        // 1) Check for ctrl/alt/meta -> bail if true
        // 2) Check for keyIdentifier.startsWith("U+") -> bail if false
        // 3) Check keyCode < 0x20 -> bail
        // 4) Special case Delete (63272) -> bail
        
        var scanCode;

        if ((evt.charCode == Sys.UI.Key.pageUp) ||
               (evt.charCode == Sys.UI.Key.pageDown) ||
               (evt.charCode == Sys.UI.Key.up) ||
               (evt.charCode == Sys.UI.Key.down) ||
               (evt.charCode == Sys.UI.Key.left) ||
               (evt.charCode == Sys.UI.Key.right) ||
               (evt.charCode == Sys.UI.Key.home) ||
               (evt.charCode == Sys.UI.Key.end) ||
               (evt.charCode == 46 /* Delete */) ||
               (evt.ctrlKey /* Control keys */)) {
            return;
        }

        if (evt.rawEvent.keyIdentifier) {
            // Safari
            // Note (Garbin): used the underlying rawEvent insted of the DomEvent instance.
            if (evt.rawEvent.ctrlKey || evt.rawEvent.altKey || evt.rawEvent.metaKey) {
                return;
            }
            
            if (evt.rawEvent.keyIdentifier.substring(0,2) != "U+") {
                return;
            }
            
            scanCode = evt.rawEvent.charCode; 
            if (scanCode == 63272 /* Delete */) {
                return;
            }
        } else {
            scanCode = evt.charCode;
        }  
            
        if (scanCode && scanCode >= 0x20 /* space */) {
            var c = String.fromCharCode(scanCode);
            if(!this._processKey(c)) {
                evt.preventDefault();
            }
        }
    },
    
    _processKey : function(key) {
        /// <summary>
        /// Determine whether the key is valid or whether it should be filtered out
        /// </summary>
        /// <param name="key" type="String">
        /// Character to be validated
        /// </param>
        /// <returns type="Boolean">
        /// True if the character should be accepted, false if it should be filtered
        /// </returns>

        // Allow anything that's not a printable character,
        // e.g. backspace, arrows, etc.  Everything above 32
        // should be considered allowed, as it may be Unicode, etc.
        
        var filter = "";
        var shouldFilter = false;
        
        if (this._filterMode == AjaxControlToolkit.FilterModes.ValidChars) {
            filter = this._getValidChars();
  
            // Determine if we should accept the character
            shouldFilter = filter && (filter.length > 0) && (filter.indexOf(key) == -1);
        } else {
            filter = this._getInvalidChars();
  
            // Determine if we should accept the character
            shouldFilter = filter && (filter.length > 0) && (filter.indexOf(key) > -1);        
        }
        
        // Raise the processKey event and allow handlers to intercept
        // and decide whether the key should be allowed
        var eventArgs = new AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs(key, AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element()).get_Value(), shouldFilter);
        this.raiseProcessKey(eventArgs);
        
        // If a processKey handler decided the key should be allowed, just
        // return true and pass it through (note that the default value of
        // allowKey is the opposite of shouldFilter so it will work as normal
        // if no one is handling the event)
        if (eventArgs.get_allowKey()) {
            return true;
        }
        
        // Else if it was decided that it shouldn't be allowed,
        // raise the Filtered event and return false to filter the key
        this.raiseFiltered(new AjaxControlToolkit.FilteredTextBoxEventArgs(key));
        return false;
    },
    
    _onchange : function() {
        /// <summary>
        /// Handler for the target textbox's key change event which will filter
        /// the text again (to make sure no text was inserted without keypresses, etc.)
        /// </summary>
        
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var text = wrapper.get_Value() || '';
        var result = new Sys.StringBuilder();
        for (var i = 0; i < text.length; i++) {
            var ch = text.substring(i, i+1);
            if (this._processKey(ch)) {
                result.append(ch);
            }
        }
        // change the value only if it is different
        if (wrapper.get_Value() != result.toString()) {
            wrapper.set_Value(result.toString());
        }
    },
    
    _intervalCallback : function() {
    /// <summary>
    /// Method that is repeatedly called to purge invalid characters from the textbox
    /// </summary>
        
        this._changeHandler();
    },
    
    get_ValidChars : function() {
        /// <value type="String">
        /// A string consisting of all characters considered valid for the textbox, if
        /// "Custom" is specified as the field type. Otherwise this parameter is ignored.
        /// </value>
        return this.charTypes.Custom;
    },
    set_ValidChars : function(value) {
        if (this._validChars != null || this.charTypes.Custom != value) {
            this.charTypes.Custom = value;
            this._validChars = null;
            this.raisePropertyChanged('ValidChars');
        }
    },

    get_InvalidChars : function() {
        /// <value type="String">
        /// A string consisting of all characters considered invalid for the textbox, if "Custom" is specified as the field type. Otherwise this parameter is ignored.
        /// </value>
        return this.charTypes.Custom;
    },
    set_InvalidChars : function(value) {
        if (this._invalidChars != null || this.charTypes.Custom != value) {
            this.charTypes.Custom = value;
            this._invalidChars = null;
            this.raisePropertyChanged('InvalidChars');
        }
    },
    
    get_FilterType : function() {
        /// <value type="AjaxControlToolkit.FilterTypes">
        /// FilterType - A the type of filter to apply, as a comma-separated combination of
        /// Numbers, LowercaseLetters, UppercaseLetters, and Custom. If Custom is specified,
        /// the ValidChars field will be used in addition to other settings such as Numbers.
        /// </value>
        return this._filterType;
    },        
    set_FilterType : function(value) {
        if (this._validChars != null || this._filterType != value) {
            this._filterType = value;
            this._validChars = null;
            this.raisePropertyChanged('FilterType');
        }
    },
    
    get_FilterMode : function() {
        /// <value type="AjaxControlToolkit.FilterModes">
        /// FilterMode - The filter mode to apply when custom filtering is activated; supported values are ValidChars and InvalidChars.
        /// </value>
        return this._filterMode;
    },        
    set_FilterMode : function(value) {
        if (this._validChars != null || this._invalidChars != null || this._filterMode != value) {
            this._filterMode = value;
            this._validChars = null;
            this._invalidChars = null;
            this.raisePropertyChanged('FilterMode');
        }
    },

    get_FilterInterval : function() {
        /// <value type="int">
        /// An integer containing the interval (in milliseconds) in which 
        /// the field's contents are filtered
        /// </value>
        return this._filterInterval;
    },
    set_FilterInterval : function(value) {
        if (this._filterInterval != value) {
            this._filterInterval = value;
            this.raisePropertyChanged('FilterInterval');
        }
    },
    
    add_processKey : function(handler) {
        /// <summary>
        /// Add an event handler for the processKey event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('processKey', handler);
    },
    remove_processKey : function(handler) {
        /// <summary>
        /// Remove an event handler from the processKey event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('processKey', handler);
    },
    raiseProcessKey : function(eventArgs) {
        /// <summary>
        /// Raise the processKey event
        /// </summary>
        /// <param name="eventArgs" type="AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs" mayBeNull="false">
        /// Event arguments for the processKey event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('processKey');
        if (handler) {
            handler(this, eventArgs);
        }
    },

    add_filtered : function(handler) {
        /// <summary>
        /// Add an event handler for the filtered event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('filtered', handler);
    },
    remove_filtered : function(handler) {
        /// <summary>
        /// Remove an event handler from the filtered event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('filtered', handler);
    },
    raiseFiltered : function(eventArgs) {
        /// <summary>
        /// Raise the filtered event
        /// </summary>
        /// <param name="eventArgs" type="AjaxControlToolkit.FilteredTextBoxEventArgs" mayBeNull="false">
        /// Event arguments for the filtered event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('filtered');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.FilteredTextBoxBehavior.registerClass('AjaxControlToolkit.FilteredTextBoxBehavior', AjaxControlToolkit.BehaviorBase);


AjaxControlToolkit.FilterTypes = function() {
    /// <summary>
    /// Character filter to be applied to a textbox
    /// </summary>
    /// <field name="Custom" type="Number" integer="true">
    /// Custom Characters
    /// </field>
    /// <field name="Numbers" type="Number" integer="true">
    /// Numbers (0123456789)
    /// </field>
    /// <field name="UppercaseLetters" type="Number" integer="true">
    /// Uppercase Letters (ABCDEFGHIJKLMNOPQRSTUVWXYZ)
    /// </field>
    /// <field name="LowercaseLetters" type="Number" integer="true">
    /// Lowercase Letters (abcdefghijklmnopqrstuvwxyz)
    /// </field>
    throw Error.invalidOperation();
}
AjaxControlToolkit.FilterTypes.prototype = {
    Custom           :  0x1,
    Numbers          :  0x2,
    UppercaseLetters :  0x4,
    LowercaseLetters :  0x8
}
AjaxControlToolkit.FilterTypes.registerEnum('AjaxControlToolkit.FilterTypes', true);

AjaxControlToolkit.FilterModes = function() {
    /// <summary>
    /// Filter mode to be applied to a textbox
    /// </summary>
    /// <field name="ValidChars" type="Number" integer="true">
    /// Provide a list of valid characters
    /// </field>
    /// <field name="InvalidChars" type="Number" integer="true">
    /// Provide a list of invalid characters
    /// </field>
    throw Error.invalidOperation();
}
AjaxControlToolkit.FilterModes.prototype = {
    ValidChars   :  0x1,
    InvalidChars :  0x2
}
AjaxControlToolkit.FilterModes.registerEnum('AjaxControlToolkit.FilterModes', true);

AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs = function(key, text, shouldFilter) {
    /// <summary>
    /// Event arguments used when the processKey event is raised
    /// </summary>
    /// <param name="key" type="String" mayBeNull="False">
    /// Key to be processed
    /// </param>
    /// <param name="text" type="String" mayBeNull="True">
    /// Current text in the textbox
    /// </param>
    /// <param name="shouldFilter" type="Boolean" mayBeNull="False">
    /// Whether the character should be filtered given the current
    /// FilteredTextBox settings
    /// </param>
    AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs.initializeBase(this);
    
    this._key = key;
    this._text = text;
    this._shouldFilter = shouldFilter;
    this._allowKey = !shouldFilter;
}
AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs.prototype = {
    get_key : function() {
        /// <value type="String" mayBeNull="False">
        /// Key to be processed
        /// </value>
        return this._key;
    },
    
    get_text : function() {
        /// <value type="String" mayBeNull="True">
        /// Current text in the textbox
        /// </value>
        return this._text;
    },
    
    get_shouldFilter : function() {
        /// <value type="Boolean" mayBeNull="False">
        /// Whether the character should be filtered given the current
        /// FilteredTextBox settings
        /// </value>
        return this._shouldFilter;
    },
    
    get_allowKey : function() {
        /// <value type="Boolean" mayBeNull="False">
        /// Whether or not the key will be filtered.  It defaults to the opposite of
        /// shouldFilter and should be set by handlers of the processKey event.
        /// </value>
        return this._allowKey;
    },
    set_allowKey : function(value) {
        this._allowKey = value;
    }
}
AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs.registerClass('AjaxControlToolkit.FilteredTextBoxProcessKeyEventArgs', Sys.EventArgs);

AjaxControlToolkit.FilteredTextBoxEventArgs = function(key) {
    /// <summary>
    /// Event arguments used when the filtered event is raised
    /// </summary>
    /// <param name="key" type="String" mayBeNull="False">
    /// Key that was filtered
    /// </param>
    AjaxControlToolkit.FilteredTextBoxEventArgs.initializeBase(this);

    this._key = key;
}
AjaxControlToolkit.FilteredTextBoxEventArgs.prototype = {
    get_key : function() {
        /// <value type="String" mayBeNull="False">
        /// Key that was filtered
        /// </value>
        return this._key;
    }
}
AjaxControlToolkit.FilteredTextBoxEventArgs.registerClass('AjaxControlToolkit.FilteredTextBoxEventArgs', Sys.EventArgs);
//END AjaxControlToolkit.FilteredTextBox.FilteredTextBoxBehavior.js
//START AjaxControlToolkit.Common.DateTime.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace("AjaxControlToolkit");

AjaxControlToolkit.TimeSpan = function() {
    /// <summary>
    /// Represents a period of time
    /// </summary>
    
    if (arguments.length == 0) this._ctor$0.apply(this, arguments);
    else if (arguments.length == 1) this._ctor$1.apply(this, arguments);
    else if (arguments.length == 3) this._ctor$2.apply(this, arguments);
    else if (arguments.length == 4) this._ctor$3.apply(this, arguments);
    else if (arguments.length == 5) this._ctor$4.apply(this, arguments);
    else throw Error.parameterCount();
}
AjaxControlToolkit.TimeSpan.prototype = {

    _ctor$0 : function() {
        /// <summary>
        /// Initializes a new TimeSpan
        /// </summary>
        
        this._ticks = 0;
    }, 
    _ctor$1 : function(ticks) {
        /// <summary>
        /// Initializes a new TimeSpan
        /// </summary>
        /// <param name="ticks" type="Number" integer="true">The number of ticks in the TimeSpan</param>

        this._ctor$0();
        this._ticks = ticks;
    },
    _ctor$2 : function(hours, minutes, seconds) {
        /// <summary>
        /// Initializes a new TimeSpan
        /// </summary>
        /// <param name="hours" type="Number">The number of hours in the TimeSpan</param>
        /// <param name="minutes" type="Number">The number of minutes in the TimeSpan</param>
        /// <param name="seconds" type="Number">The number of seconds in the TimeSpan</param>
        
        this._ctor$0();
        this._ticks = 
            (hours * AjaxControlToolkit.TimeSpan.TicksPerHour) +
            (minutes * AjaxControlToolkit.TimeSpan.TicksPerMinute) +
            (seconds * AjaxControlToolkit.TimeSpan.TicksPerSecond); 
    },
    _ctor$3 : function(days, hours, minutes, seconds) {
        /// <summary>
        /// Initializes a new TimeSpan
        /// </summary>
        /// <param name="days" type="Number">The number of days in the TimeSpan</param>
        /// <param name="hours" type="Number">The number of hours in the TimeSpan</param>
        /// <param name="minutes" type="Number">The number of minutes in the TimeSpan</param>
        /// <param name="seconds" type="Number">The number of seconds in the TimeSpan</param>

        this._ctor$0();
        this._ticks = 
            (days * AjaxControlToolkit.TimeSpan.TicksPerDay) +
            (hours * AjaxControlToolkit.TimeSpan.TicksPerHour) +
            (minutes * AjaxControlToolkit.TimeSpan.TicksPerMinute) +
            (seconds * AjaxControlToolkit.TimeSpan.TicksPerSecond); 
    },
    _ctor$4 : function(days, hours, minutes, seconds, milliseconds) {
        /// <summary>
        /// Initializes a new TimeSpan
        /// </summary>
        /// <param name="days" type="Number">The number of days in the TimeSpan</param>
        /// <param name="hours" type="Number">The number of hours in the TimeSpan</param>
        /// <param name="minutes" type="Number">The number of minutes in the TimeSpan</param>
        /// <param name="seconds" type="Number">The number of seconds in the TimeSpan</param>
        /// <param name="milliseconds" type="Number">The number of milliseconds in the TimeSpan</param>

        this._ctor$0();
        this._ticks = 
            (days * AjaxControlToolkit.TimeSpan.TicksPerDay) +
            (hours * AjaxControlToolkit.TimeSpan.TicksPerHour) +
            (minutes * AjaxControlToolkit.TimeSpan.TicksPerMinute) +
            (seconds * AjaxControlToolkit.TimeSpan.TicksPerSecond) +
            (milliseconds * AjaxControlToolkit.TimeSpan.TicksPerMillisecond); 
    },

    getDays : function() { 
        /// <summary>
        /// Gets the days part of the TimeSpan
        /// </summary>
        /// <returns type="Number" />
        
        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerDay); 
    },
    getHours : function() { 
        /// <summary>
        /// Gets the hours part of the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerHour) % 24; 
    },
    getMinutes : function() { 
        /// <summary>
        /// Gets the minutes part of the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerMinute) % 60; 
    },
    getSeconds : function() { 
        /// <summary>
        /// Gets the seconds part of the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerSecond) % 60; 
    },
    getMilliseconds : function() { 
        /// <summary>
        /// Gets the milliseconds part of the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerMillisecond) % 1000; 
    },
    getDuration : function() { 
        /// <summary>
        /// Gets the total duration of a TimeSpan
        /// </summary>
        /// <returns type="AjaxControlToolkit.TimeSpan" />

        return new AjaxControlToolkit.TimeSpan(Math.abs(this._ticks)); 
    },
    getTicks : function() { 
        /// <summary>
        /// Gets the ticks in the TimeSpan
        /// </summary>
        /// <returns type="Number" />
    
        return this._ticks; 
    },
    getTotalDays : function() { 
        /// <summary>
        /// Gets the total number of days in the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerDay); 
    },
    getTotalHours : function() { 
        /// <summary>
        /// Gets the total hours in the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerHour); 
    },
    getTotalMinutes : function() { 
        /// <summary>
        /// Gets the total minutes in the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerMinute); 
    },
    getTotalSeconds : function() { 
        /// <summary>
        /// Gets the total seconds in the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerSecond); 
    },
    getTotalMilliseconds : function() { 
        /// <summary>
        /// Gets the total milliseconds in the TimeSpan
        /// </summary>
        /// <returns type="Number" />

        return Math.floor(this._ticks / AjaxControlToolkit.TimeSpan.TicksPerMillisecond); 
    },
    add : function(value) { 
        /// <summary>
        /// Adds the supplied TimeSpan to this TimeSpan
        /// </summary>
        /// <param name="value" type="AjaxControlToolkit.TimeSpan">The TimeSpan to add</param>
        /// <returns type="AjaxControlToolkit.TimeSpan" />

        return new AjaxControlToolkit.TimeSpan(this._ticks + value.getTicks()); 
    },
    subtract : function(value) { 
        /// <summary>
        /// Subtracts the supplied TimeSpan to this TimeSpan
        /// </summary>
        /// <param name="value" type="AjaxControlToolkit.TimeSpan">The TimeSpan to subtract</param>
        /// <returns type="AjaxControlToolkit.TimeSpan" />

        return new AjaxControlToolkit.TimeSpan(this._ticks - value.getTicks()); 
    },
    negate : function() { 
        /// <summary>
        /// Negates the TimeSpan
        /// </summary>
        /// <returns type="AjaxControlToolkit.TimeSpan" />

        return new AjaxControlToolkit.TimeSpan(-this._ticks); 
    },
    equals : function(value) { 
        /// <summary>
        /// Whether this TimeSpan equals another TimeSpan
        /// </summary>
        /// <param name="value" type="AjaxControlToolkit.TimeSpan">The TimeSpan to test</param>
        /// <returns type="AjaxControlToolkit.TimeSpan" />

        return this._ticks == value.getTicks(); 
    },
    compareTo : function(value) { 
        /// <summary>
        /// Whether this TimeSpan greater or less than another TimeSpan
        /// </summary>
        /// <param name="value" type="AjaxControlToolkit.TimeSpan">The TimeSpan to test</param>
        /// <returns type="AjaxControlToolkit.TimeSpan" />

        if(this._ticks > value.getTicks()) 
            return 1; 
        else if(this._ticks < value.getTicks()) 
            return -1; 
        else 
            return 0; 
    },
    toString : function() { 
        /// <summary>
        /// Gets the string representation of the TimeSpan
        /// </summary>
        /// <returns type="String" />

        return this.format("F"); 
    },
    format : function(format) {    
        /// <summary>
        /// Gets the string representation of the TimeSpan
        /// </summary>
        /// <param name="format" type="String" mayBeNull="true">The format specifier used to format the TimeSpan</param>
        /// <returns type="String" />

        if (!format) {
            format = "F";
        }
        if (format.length == 1) {
            switch (format) {
                case "t": format = AjaxControlToolkit.TimeSpan.ShortTimeSpanPattern; break;
                case "T": format = AjaxControlToolkit.TimeSpan.LongTimeSpanPattern; break;
                case "F": format = AjaxControlToolkit.TimeSpan.FullTimeSpanPattern; break;
                default: throw Error.createError(String.format(AjaxControlToolkit.Resources.Common_DateTime_InvalidTimeSpan, format));
            }
        }
        var regex = /dd|d|hh|h|mm|m|ss|s|nnnn|nnn|nn|n/g;
        var builder = new Sys.StringBuilder();
        var ticks = this._ticks;
        if (ticks < 0) {
            builder.append("-");            
            ticks = -ticks;
        }
        for (;;) {
            var index = regex.lastIndex;
            var ar = regex.exec(format);
            builder.append(format.slice(index, ar ? ar.index : format.length));
            if (!ar) break;
            switch (ar[0]) {
                case "dd":
                case "d":
                    builder.append($common.padLeft(Math.floor(ticks / AjaxControlToolkit.TimeSpan.TicksPerDay, ar[0].length, '0')));
                    break;
                case "hh":
                case "h":
                    builder.append($common.padLeft(Math.floor(ticks / AjaxControlToolkit.TimeSpan.TicksPerHour) % 24, ar[0].length, '0'));
                    break;
                case "mm":
                case "m":
                    builder.append($common.padLeft(Math.floor(ticks / AjaxControlToolkit.TimeSpan.TicksPerMinute) % 60, ar[0].length, '0'));
                    break;
                case "ss":
                case "s":
                    builder.append($common.padLeft(Math.floor(ticks / AjaxControlToolkit.TimeSpan.TicksPerSecond) % 60, ar[0].length, '0'));
                    break;
                case "nnnn":
                case "nnn":
                case "nn":
                case "n":
                    builder.append($common.padRight(Math.floor(ticks / AjaxControlToolkit.TimeSpan.TicksPerMillisecond) % 1000, ar[0].length, '0', true));
                    break;
                default:
                    Sys.Debug.assert(false);
            }
        }
        return builder.toString();
    }
}
AjaxControlToolkit.TimeSpan.parse = function(text) {
    /// <summary>
    /// Parses a text value into a TimeSpan
    /// </summary>
    /// <param name="text" type="String">The text to parse</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    var parts = text.split(":");
    var d = 0;
    var h = 0;
    var m = 0;
    var s = 0;
    var n = 0;
    var ticks = 0;    
    switch(parts.length) {
        case 1:
            if (parts[0].indexOf(".") != -1) {
                var parts2 = parts[0].split(".");
                s = parseInt(parts2[0]);
                n = parseInt(parts2[1]);
            } else {
                ticks = parseInt(parts[0]);
            }
            break;
        case 2:
            h = parseInt(parts[0]);
            m = parseInt(parts[1]);
            break;
        case 3:
            h = parseInt(parts[0]);
            m = parseInt(parts[1]);
            if (parts[2].indexOf(".") != -1) {
                var parts2 = parts[2].split(".");
                s = parseInt(parts2[0]);
                n = parseInt(parts2[1]);
            } else {
                s = parseInt(parts[2]);
            }
            break;
        case 4:
            d = parseInt(parts[0]);
            h = parseInt(parts[1]);
            m = parseInt(parts[2]);
            if (parts[3].indexOf(".") != -1) {
                var parts2 = parts[3].split(".");
                s = parseInt(parts2[0]);
                n = parseInt(parts2[1]);
            } else {
                s = parseInt(parts[3]);
            }
            break;
    }
    ticks += (d * AjaxControlToolkit.TimeSpan.TicksPerDay) +
             (h * AjaxControlToolkit.TimeSpan.TicksPerHour) +
             (m * AjaxControlToolkit.TimeSpan.TicksPerMinute) +
             (s * AjaxControlToolkit.TimeSpan.TicksPerSecond) +
             (n * AjaxControlToolkit.TimeSpan.TicksPerMillisecond);
    if(!isNaN(ticks)) {
        return new AjaxControlToolkit.TimeSpan(ticks);
    }    
    throw Error.create(AjaxControlToolkit.Resources.Common_DateTime_InvalidFormat);
}
AjaxControlToolkit.TimeSpan.fromTicks = function(ticks) { 
    /// <summary>
    /// Creates a TimeSpan for the specified number of ticks
    /// </summary>
    /// <param name="ticks" type="Number" integer="true">The ticks for the TimeSpan instance</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(ticks); 
}
AjaxControlToolkit.TimeSpan.fromDays = function(days) { 
    /// <summary>
    /// Creates a TimeSpan for the specified number of days
    /// </summary>
    /// <param name="days" type="Number">The days for the TimeSpan instance</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(days * AjaxControlToolkit.TimeSpan.TicksPerDay); 
}
AjaxControlToolkit.TimeSpan.fromHours = function(hours) { 
    /// <summary>
    /// Creates a TimeSpan for the specified number of hours
    /// </summary>
    /// <param name="hours" type="Number">The hours for the TimeSpan instance</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(hours * AjaxControlToolkit.TimeSpan.TicksPerHour); 
}
AjaxControlToolkit.TimeSpan.fromMinutes = function(minutes) { 
    /// <summary>
    /// Creates a TimeSpan for the specified number of minutes
    /// </summary>
    /// <param name="minutes" type="Number">The minutes for the TimeSpan instance</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(minutes * AjaxControlToolkit.TimeSpan.TicksPerMinute); 
}
AjaxControlToolkit.TimeSpan.fromSeconds = function(seconds) { 
    /// <summary>
    /// Creates a TimeSpan for the specified number of seconds
    /// </summary>
    /// <param name="seconds" type="Number">The seconds for the TimeSpan instance</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(minutes * AjaxControlToolkit.TimeSpan.TicksPerSecond); 
}
AjaxControlToolkit.TimeSpan.fromMilliseconds = function(milliseconds) { 
    /// <summary>
    /// Creates a TimeSpan for the specified number of milliseconds
    /// </summary>
    /// <param name="days" type="Number">The milliseconds for the TimeSpan instance</param>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(minutes * AjaxControlToolkit.TimeSpan.TicksPerMillisecond); 
}
AjaxControlToolkit.TimeSpan.TicksPerDay = 864000000000;
AjaxControlToolkit.TimeSpan.TicksPerHour = 36000000000;
AjaxControlToolkit.TimeSpan.TicksPerMinute = 600000000;
AjaxControlToolkit.TimeSpan.TicksPerSecond = 10000000;
AjaxControlToolkit.TimeSpan.TicksPerMillisecond = 10000;
AjaxControlToolkit.TimeSpan.FullTimeSpanPattern = "dd:hh:mm:ss.nnnn";
AjaxControlToolkit.TimeSpan.ShortTimeSpanPattern = "hh:mm";
AjaxControlToolkit.TimeSpan.LongTimeSpanPattern = "hh:mm:ss";

Date.prototype.getTimeOfDay = function Date$getTimeOfDay() {
    /// <summary>
    /// Gets a TimeSpan representing the current time of the Date
    /// </summary>
    /// <returns type="AjaxControlToolkit.TimeSpan" />

    return new AjaxControlToolkit.TimeSpan(
        0, 
        this.getHours(), 
        this.getMinutes(), 
        this.getSeconds(), 
        this.getMilliseconds());
}
Date.prototype.getDateOnly = function Date$getDateOnly() {
    /// <summary>
    /// Gets a Date representing the Date only part of the Date
    /// </summary>
    /// <returns type="Date" />

    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}
Date.prototype.add = function Date$add(span) {
    /// <summary>
    /// Adds a TimeSpan to the current Date
    /// </summary>
    /// <param name="span" type="AjaxControlToolkit.TimeSpan">The amount of time to add to the date</param>
    /// <returns type="Date" />

    return new Date(this.getTime() + span.getTotalMilliseconds());
}
Date.prototype.subtract = function Date$subtract(span) {
    /// <summary>
    /// Subtracts a TimeSpan to the current Date
    /// </summary>
    /// <param name="span" type="AjaxControlToolkit.TimeSpan">The amount of time to subtract from the date</param>
    /// <returns type="Date" />

    return this.add(span.negate());
}
Date.prototype.getTicks = function Date$getTicks() {
    /// <summary>
    /// Gets the number of ticks in the date
    /// </summary>
    /// <returns type="Number" />

    return this.getTime() * AjaxControlToolkit.TimeSpan.TicksPerMillisecond;
}

AjaxControlToolkit.FirstDayOfWeek = function() {
    /// <summary>
    /// Represents the first day of the week in a calendar
    /// </summary>
}
AjaxControlToolkit.FirstDayOfWeek.prototype = {
    Sunday : 0,
    Monday : 1,
    Tuesday : 2,
    Wednesday : 3,
    Thursday : 4,
    Friday : 5,
    Saturday : 6,
    Default : 7
}
AjaxControlToolkit.FirstDayOfWeek.registerEnum("AjaxControlToolkit.FirstDayOfWeek");

//END AjaxControlToolkit.Common.DateTime.js
//START AjaxControlToolkit.Animation.Animations.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Common/Common.js" />


Type.registerNamespace('AjaxControlToolkit.Animation');

// Create an alias for the namespace to save 25 chars each time it's used since
// this is a very long script and will take awhile to download
var $AA = AjaxControlToolkit.Animation;

$AA.registerAnimation = function(name, type) {
    /// <summary>
    /// Register an animation with the AJAX Control Toolkit animation framework. This serves a dual purpose:
    /// 1) to add standard utility methods to the animation type (such as a <code>play</code> method that creates
    /// an animation, plays it, and disposes it when the animation is over), and 2) to associate a name with the
    /// type that will be used when creating animations from a JSON description.  This method can also be called
    /// by other animation libraries to seamlessly interoperate with the AJAX Control Toolkit's animation
    /// framework.
    /// </summary>
    /// <param name="name" type="String">
    /// Name of the animation that will be used as the XML tag name in the XML animation description.  It
    /// should be a valid XML tag (i.e. an alpha-numeric sequence with no spaces, special characters, etc.).
    /// </param>
    /// <param name="type" type="Type">
    /// The type of the new animation must inherit from <see cref="AjaxControlToolkit.Animation.Animation" />.
    /// </param>
    /// <returns />

    // Make sure the type inherits from AjaxControlToolkit.Animation.Animation
    if (type && ((type === $AA.Animation) || (type.inheritsFrom && type.inheritsFrom($AA.Animation)))) {
        // We'll store the animation name/type mapping in a "static" object off of
        // AjaxControlToolkit.Animation.  If this __animations object hasn't been
        // created yet, demand create it on the first registration.
        if (!$AA.__animations) {
            $AA.__animations = { };
        }
        
        // Add the current type to the collection of animations
        $AA.__animations[name.toLowerCase()] = type;
        
        // Add a play function that will make it very easy to create, play, and
        // dispose of an animation.  This is effectively a "static" function on
        // each animation and will take the same parameters as that animation's
        // constructor.
        type.play = function() {
            /// <summary>
            /// Create an animation, play it immediately, and dispose it when finished.
            /// </summary>
            /// <param parameterArray="true" elementType="Object">
            /// The play function takes the same parameters as the type's constructor
            /// </param>
            /// <returns />
        
            // Create and initialize a new animation of the right type and pass in
            // any arguments given to the play function
            var animation = new type();
            type.apply(animation, arguments);
            animation.initialize();
            
            // Add an event handler to dispose the animation when it's finished
            var handler = Function.createDelegate(animation,
                function() {
                    /// <summary>
                    /// Dispose the animation after playing
                    /// </summary>
                    /// <returns />
                    animation.remove_ended(handler);
                    handler = null;
                    animation.dispose();
                });
            animation.add_ended(handler);
            
            // Once the animation has been created and initialized, play it and
            // dispose it as soon as it's finished
            animation.play();            
        }
    } else {
        // Raise an error if someone registers an animation that doesn't inherit
        // from our base Animation class
        throw Error.argumentType('type', type, $AA.Animation, AjaxControlToolkit.Resources.Animation_InvalidBaseType);
    }
}

$AA.buildAnimation = function(json, defaultTarget) {
    /// <summary>
    /// The <code>buildAnimation</code> function is used to turn a JSON animation description
    /// into an actual animation object that can be played.
    /// </summary>
    /// <param name="json" type="String" mayBeNull="true">
    /// JSON description of the animation in the format expected by createAnimation
    /// </param>
    /// <param name="defaultTarget" type="Sys.UI.DomElement" mayBeNull="true" domElement="true">
    /// Target of the animation if none is specified in the JSON description.  The semantics of
    /// target assignment are provided in more detail in createAnimation.
    /// </param>
    /// <returns type="AjaxControlToolkit.Animation.Animation" mayBeNull="true">
    /// Animation created from the JSON description
    /// </returns>
    
    // Ensure we have a description to create an animation with
    if (!json || json === '') {
        return null;
    }

    // "Parse" the JSON so we can easily manipulate it
    // (we don't wrap it in a try/catch when debugging to raise any errors)
    var obj;
    json = '(' + json + ')';
    if (! Sys.Debug.isDebug) {
        try { obj = Sys.Serialization.JavaScriptSerializer.deserialize(json); } catch (ex) { } 
    } else {
        obj = Sys.Serialization.JavaScriptSerializer.deserialize(json);
    }
    
    // Create a new instance of the animation
    return $AA.createAnimation(obj, defaultTarget);    
}

$AA.createAnimation = function(obj, defaultTarget) {
    /// <summary>
    /// The <code>createAnimation</code> function builds a new
    /// <see cref="AjaxControlToolkit.Animation.Animation" /> instance from an object
    /// that describes it.
    /// </summary>
    /// <param name="obj" type="Object">
    /// The object provides a description of the animation to be be generated in
    /// a very specific format. It has two special properties: <code>AnimationName</code>
    /// and <code>AnimationChildren</code>.  The <code>AnimationName</code> is required
    /// and used to find the type of animation to create (this name should map to
    /// one of the animation names supplied to <code>registerAnimation</code>).  The
    /// <code>AnimationChildren</code> property supplies an optional array for
    /// animations that use child animations (such as
    /// <see cref="AjaxControlToolkit.Animation.ParallelAnimation" /> and
    /// <see cref="AjaxControlToolkit.Animation.SequenceAnimation" />). The elements of
    /// the <code>AnimationChildren</code> array are valid
    /// <see cref="AjaxControlToolkit.Animation.Animation" /> objects that meet these same
    /// requirements.  In order for an animation to support child animations, it must
    /// derive from the <see cref="AjaxControlToolkit.Animation.ParentAnimation" /> class
    /// which provides common methods like <code>add</code>, <code>clear</code>, etc. The
    /// remaining properties of the object are used to set parameters specific to the type
    /// of animation being created (e.g. <code>duration</code>, <code>minimumOpacity</code>,
    /// <code>startValue</code>, etc.) and should have a corresponding property on the
    /// animation.  You can also assign an arbitrary JavaScript expression to any property
    /// by adding 'Script' to the end of its name (i.e., Height="70" can be replaced by
    /// HeightScript="$get('myElement').offsetHeight") and have the property set to the
    /// result of evaluating the expression before the animation is played each time.
    /// </param>
    /// <param name="defaultTarget" type="Sys.UI.DomElement" mayBeNull="true" domElement="true">
    /// The function also takes a <code>defaultTarget</code> parameter that is used as the
    /// target of the animation if the object does not specify one.  This parameter should be
    /// an instance of <see cref="Sys.UI.DomElement" /> and not just the name of an element.
    /// </param>
    /// <returns type="AjaxControlToolkit.Animation.Animation">
    /// <see cref="AjaxControlToolkit.Animation.Animation" /> created from the description
    /// </returns>
    /// <remarks>
    /// Exceptions are thrown when the <code>AnimationName</code> cannot be found.  Also,
    /// any exceptions raised by setting properties or providing properties with invalid
    /// names will only be raised when debugging.
    /// </remarks>

    // Create a default instance of the animation by looking up the AnimationName
    // in the global __animations object.
    if (!obj || !obj.AnimationName) {
        throw Error.argument('obj', AjaxControlToolkit.Resources.Animation_MissingAnimationName);
    }
    var type = $AA.__animations[obj.AnimationName.toLowerCase()];
    if (!type) {
        throw Error.argument('type', String.format(AjaxControlToolkit.Resources.Animation_UknownAnimationName, obj.AnimationName));
    }
    var animation = new type();
    
    // Set the animation's target if provided via defaultTarget (note that setting
    // it via AnimationTarget will happen during the regular property setting phase)
    if (defaultTarget) {
        animation.set_target(defaultTarget);
    }
    
    // If there is an AnimationChildren array and the animation inherits from
    // ParentAnimation, then we will recusively build the child animations.  It is
    // important that we create the child animations before setting the animation's
    // properties or initializing (because some properties and initialization may be
    // propogated down from parent to child).
    if (obj.AnimationChildren && obj.AnimationChildren.length) {
        if ($AA.ParentAnimation.isInstanceOfType(animation)) {
            for (var i = 0; i < obj.AnimationChildren.length; i++) {
                var child = $AA.createAnimation(obj.AnimationChildren[i]);
                if (child) {
                    animation.add(child);
                }
            }
        } else {
            throw Error.argument('obj', String.format(AjaxControlToolkit.Resources.Animation_ChildrenNotAllowed, type.getName()));
        }
    }
    
    // Get the list of all properties available to set on the current animation's
    // type.  We create a mapping from the property's lowercase friendly name
    // (i.e., "duration") to the name of its setter (i.e., "set_duration").  This is
    // essentialy in setting properties so we only copy over valid values.
    var properties = type.__animationProperties;
    if (!properties) {
        // Get the properties for this type by walking its prototype - by doing
        // this we'll effectively ignore anything not defined in the prototype
        type.__animationProperties = { };
        type.resolveInheritance();
        for (var name in type.prototype) {
            if (name.startsWith('set_')) {
                type.__animationProperties[name.substr(4).toLowerCase()] = name;
            }
        }
        
        // Remove the 'id' property as it shouldn't be set by the animation
        // (NOTE: the 'target' proeprty shouldn't be set to a string value, but it
        // isn't removed because it can be used as a valid dynamic property - i.e.
        // Target="myElement" *DOES NOT WORK*, but it's OKAY to use
        // TargetScript="$get('myElement')".  Validation for this scenario will be
        // handled automatically by _validateParams when debugging as Target is required
        // to be a dom element.)
        delete type.__animationProperties['id'];
        properties = type.__animationProperties;
    }
    
    // Loop through each of the properties in the object and check if it's in the list
    // of valid property names.  We will check the type of the propertyName to make sure
    // it's a String (as other types can be added by the ASP.NET AJAX compatability
    // layers to all objects and cause errors if you don't exclude them).  We will first
    // try to set a property with the same name if it exists.  If we can't find one but
    // the name of the property ends in 'script', then we will try to set a corresponding
    // dynamic property.  If no matches can be found at all, we'll raise an error when
    // debugging.
    for (var property in obj) {
        // Ignore the special properties in the object that don't correspond
        // to any actual properties on the animation
        var prop = property.toLowerCase();
        if (prop == 'animationname' || prop == 'animationchildren') {
            continue;
        }
        
        var value = obj[property];
        
        // Try to directly set the value of this property
        var setter = properties[prop];
        if (setter && String.isInstanceOfType(setter) && animation[setter]) {
            // Ignore any exceptions raised by setting the property
            // unless we're debugging
            if (! Sys.Debug.isDebug) {
                try { animation[setter](value); } catch (ex) { }
            } else {
                animation[setter](value);
            }
        } else {
            // Try to set the value of a dynamic property
            if (prop.endsWith('script')) {
                setter = properties[prop.substr(0, property.length - 6)];
                if (setter && String.isInstanceOfType(setter) && animation[setter]) {
                    animation.DynamicProperties[setter] = value;
                } else if ( Sys.Debug.isDebug) {
                    // Raise an error when debugging if we could not find a matching property
                    throw Error.argument('obj', String.format(AjaxControlToolkit.Resources.Animation_NoDynamicPropertyFound, property, property.substr(0, property.length - 5)));
                }
            } else if ( Sys.Debug.isDebug) {
                // Raise an error when debugging if we could not find a matching property
                throw Error.argument('obj', String.format(AjaxControlToolkit.Resources.Animation_NoPropertyFound, property));
            }
        }
    }
    
    return animation;
}


// In the Xml comments for each of the animations below, there is a special <animation /> tag
// that describes how the animation is referenced from a generic XML animation description


$AA.Animation = function(target, duration, fps) {
    /// <summary>
    /// <code>Animation</code> is an abstract base class used as a starting point for all the other animations.
    /// It provides the basic mechanics for the animation (playing, pausing, stopping, timing, etc.)
    /// and leaves the actual animation to be done in the abstract methods <code>getAnimatedValue</code>
    /// and <code>setValue</code>.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <field name="DynamicProperties" type="Object">
    /// The DynamicProperties collection is used to associate JavaScript expressions with
    /// properties.  The expressions are evaluated just before the animation is played
    /// everytime (in the base onStart method).  The object itself maps strings with the
    /// names of property setters (like "set_verticalOffset") to JavaScript expressions
    /// (like "$find('MyBehavior').get_element().offsetHeight").  Note specifically that
    /// the dynamic properties are JavaScript expressions and not abitrary statements (i.e.
    /// you can't include things like "return foo;"), although you can include anything
    /// inside an anonymous function definition that you immediately invoke (i.e.,
    /// "(function() { return foo; })()").  A dynamic property can be set in the generic
    /// XML animation description by appending Script onto any legitimate property name
    /// (for example, instead of Height="70" we could use
    /// HeightScript="$find('MyBehavior').get_element().offsetHeight").  Any exceptions
    /// raised when setting dynamic properties (including both JavaScript evaluation errors
    /// and other exceptions raised by property setters) will only be propogated when
    /// debugging.
    /// </field>
    /// <remarks>
    /// Animations need to be as fast as possible - even in debug mode.  Don't add validation code to
    /// methods involved in every step of the animation.
    /// </remarks>
    /// <animation>Animation</animation>
    $AA.Animation.initializeBase(this);
    
    // Length of the animation in seconds
    this._duration = 1;
    
    // Number of steps per second
    this._fps = 25;
    
    // Target Sys.UI.DomElement of the animation
    this._target = null;
    
    // Tick event handler
    this._tickHandler = null;
    
    // Animation timer
    this._timer = null;
    
    // Percentage of the animation already played
    this._percentComplete = 0;
    
    // Percentage of the animation to play on each step
    this._percentDelta = null;
    
    // Reference to the animation that owns this animation (currently only set in 
    // ParallelAnimation.add).  This concept of ownership allows an entire animation
    // subtree to be driven off a single timer so all the operations are properly
    // synchronized.
    this._owner = null;
    
    // Reference to the animation that contains this as a child (this is set
    // in ParentAnimation.add).  The primary use of the parent animation is in
    // resolving the animation target when one isn't specified.
    this._parentAnimation = null;
    
    // The DynamicProperties collection is used to associate JavaScript expressions with
    // properties.  The expressions are evaluated just before the animation is played
    // everytime (in the base onStart method).  See the additional information in the
    // XML <field> comment above.
    this.DynamicProperties = { };
    
    // Set the target, duration, and fps if they were provided in the constructor
    if (target) {
        this.set_target(target);
    }
    if (duration) {
        this.set_duration(duration);
    }
    if (fps) { 
        this.set_fps(fps);
    }
}
$AA.Animation.prototype = {
    dispose : function() {
        /// <summary>
        /// Dispose the animation
        /// </summary>
        /// <returns />
        
        if (this._timer) {
            this._timer.dispose();
            this._timer = null;
        }
        
        this._tickHandler = null;
        this._target = null;
        
        $AA.Animation.callBaseMethod(this, 'dispose');
    },
    
    play : function() {
        /// <summary>
        /// Play the animation from the beginning or where it was left off when paused.
        /// </summary>
        /// <returns />
        /// <remarks>
        /// If this animation is the child of another, you must call <code>play</code> on its parent instead.
        /// </remarks>
        
        // If ownership of this animation has been claimed, then we'll require the parent to
        // handle playing the animation (this is very important because then the entire animation
        // tree runs on the same timer and updates consistently)
        if (!this._owner) {
            var resume = true;
            if (!this._timer) {
                resume = false;
                
                if (!this._tickHandler) {
                    this._tickHandler = Function.createDelegate(this, this._onTimerTick);
                }

                this._timer = new Sys.Timer();
                this._timer.add_tick(this._tickHandler);
               
                this.onStart();
                
                this._timer.set_interval(1000 / this._fps);
                this._percentDelta = 100 / (this._duration * this._fps);
                this._updatePercentComplete(0, true);
            }

            this._timer.set_enabled(true);
            
            this.raisePropertyChanged('isPlaying');
            if (!resume) {
                this.raisePropertyChanged('isActive');
            }
        }
    },
    
    pause : function() {
        /// <summary>
        /// Pause the animation if it is playing.  Calling <code>play</code> will resume where
        /// the animation left off.
        /// </summary>
        /// <returns />
        /// <remarks>
        /// If this animation is the child of another, you must call <code>pause</code> on its parent instead.
        /// </remarks>
        
        if (!this._owner) {
            if (this._timer) {
                this._timer.set_enabled(false);
                
                this.raisePropertyChanged('isPlaying');
            }
        }
    },
    
    stop : function(finish) {
        /// <summary>
        /// Stop playing the animation.
        /// </summary>
        /// <param name="finish" type="Boolean" mayBeNull="true" optional="true">
        /// Whether or not stopping the animation should leave the target element in a state
        /// consistent with the animation playing completely by performing the last step.
        /// The default value is true.
        /// </param>
        /// <returns />
        /// <remarks>
        /// If this animation is the child of another, you must call <code>stop</code> on
        /// its parent instead.
        /// </remarks>
        
        if (!this._owner) {
            var t = this._timer;
            this._timer = null;
            if (t) {
                t.dispose();
                
                if (this._percentComplete !== 100) {
                    this._percentComplete = 100;
                    this.raisePropertyChanged('percentComplete');
                    if (finish || finish === undefined) {
                        this.onStep(100);
                    }
                }
                this.onEnd();
                
                this.raisePropertyChanged('isPlaying');
                this.raisePropertyChanged('isActive');
            }
        }
    },
    
    onStart : function() {
        /// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time.
        /// </summary>
        /// <returns />
        
        this.raiseStarted();
        
        // Initialize any dynamic properties
        for (var property in this.DynamicProperties) {
            try {
                // Invoke the property's setter on the evaluated expression
                this[property](eval(this.DynamicProperties[property]));
            } catch(ex) {
                // Propogate any exceptions if we're debugging, otherwise eat them
                if ( Sys.Debug.isDebug) {
                    throw ex;
                }
            }
        }
    },
    
    onStep : function(percentage) {
        /// <summary>
        /// The <code>onStep</code> method is called repeatedly to progress the animation through each frame
        /// </summary>
        /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
        /// <returns />
        
        this.setValue(this.getAnimatedValue(percentage));
    },
    
    onEnd : function() {
        /// <summary>
        /// The <code>onEnd</code> method is called just after the animation is played each time.
        /// </summary>
        /// <returns />
        
        this.raiseEnded();
    },
    
    getAnimatedValue : function(percentage) {
        /// <summary>
        /// Determine the state of the animation after the given percentage of its duration has elapsed
        /// </summary>
        /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
        /// <returns type="Object">
        /// State of the animation after the given percentage of its duration has elapsed that will
        /// be passed to <code>setValue</code>
        /// </returns>
        throw Error.notImplemented();
    },
    
    setValue : function(value) {
        /// <summary>
        /// Set the current state of the animation
        /// </summary>
        /// <param name="value" type="Object">Current state of the animation (as retreived from <code>getAnimatedValue</code>)</param>
        /// <returns />
        throw Error.notImplemented();
    },
    
    interpolate : function(start, end, percentage) {
        /// <summary>
        /// The <code>interpolate</code> function is used to find the appropriate value between starting and
        /// ending values given the current percentage.
        /// </summary>
        /// <param name="start" type="Number">
        /// Start of the range to interpolate
        /// </param>
        /// <param name="end" type="Number">
        /// End of the range to interpolate
        /// </param>
        /// <param name="percentage" type="Number">
        /// Percentage completed in the range to interpolate
        /// </param>
        /// <returns type="Number">
        /// Value the desired percentage between the start and end values
        /// </returns>
        /// <remarks>
        /// In the future, we hope to make several implementations of this available so we can dynamically
        /// change the apparent speed of the animations, although it may make more sense to modify the
        /// <code>_updatePercentComplete</code> function instead.
        /// </remarks>
        return start + (end - start) * (percentage / 100);
    },
    
    _onTimerTick : function() {
        /// <summary>
        /// Handler for the tick event to move the animation along through its duration
        /// </summary>
        /// <returns />
        this._updatePercentComplete(this._percentComplete + this._percentDelta, true);
    },
    
    _updatePercentComplete : function(percentComplete, animate) {
        /// <summary>
        /// Update the animation and its target given the current percentage of its duration that
        /// has already elapsed
        /// </summary>
        /// <param name="percentComplete" type="Number">
        /// Percentage of the animation duration that has already elapsed
        /// </param>
        /// <param name="animate" type="Boolean" mayBeNull="true" optional="true">
        /// Whether or not updating the animation should visually modify the animation's target
        /// </param>
        /// <returns />
        
        if (percentComplete > 100) {
            percentComplete = 100;
        }
        
        this._percentComplete = percentComplete;
        this.raisePropertyChanged('percentComplete');
        
        if (animate) {
            this.onStep(percentComplete);
        }
        
        if (percentComplete === 100) {
            this.stop(false);
        }
    },
    
    setOwner : function(owner) {
        /// <summary>
        /// Make this animation the child of another animation
        /// </summary>
        /// <param name="owner" type="AjaxControlToolkit.Animation.Animation">
        /// Parent animation
        /// </param>
        /// <returns />
        this._owner = owner;
    },
    
    raiseStarted : function() {
        /// <summary>
        /// Raise the <code>started</code> event
        /// </summary>
        /// <returns />
        var handlers = this.get_events().getHandler('started');
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },
    
    add_started : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>started</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />
        this.get_events().addHandler("started", handler);
    },
    
    remove_started : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>started</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />
        this.get_events().removeHandler("started", handler);
    },
    
    raiseEnded : function() {
        /// <summary>
        /// Raise the <code>ended</code> event
        /// </summary>
        /// <returns />
        var handlers = this.get_events().getHandler('ended');
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },
    
    add_ended : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>ended</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />
        this.get_events().addHandler("ended", handler);
    },
    
    remove_ended : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>ended</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />
        this.get_events().removeHandler("ended", handler);
    },
    
    get_target : function() {
        /// <value type="Sys.UI.DomElement" domElement="true" mayBeNull="true">
        /// Target of the animation.  If the target of this animation is null and
        /// the animation has a parent, then it will recursively use the target of
        /// the parent animation instead.
        /// </value>
        /// <remarks>
        /// Do not set this property in a generic Xml animation description. It should be set
        /// using either the extender's TargetControlID or the AnimationTarget property (the latter
        /// maps to AjaxControlToolkit.Animation.set_animationTarget).  The only valid way to
        /// set this property in the generic Xml animation description is to use the dynamic
        /// property TargetScript="$get('myElement')".
        /// <remarks>
        if (!this._target && this._parentAnimation) {
            return this._parentAnimation.get_target();
        }
        return this._target;
    },
    set_target : function(value) {
        if (this._target != value) {
            this._target = value;
            this.raisePropertyChanged('target');
        }
    },
    
    set_animationTarget : function(id) {
        /// <value type="string" mayBeNull="false">
        /// ID of a Sys.UI.DomElement or Sys.UI.Control to use as the target of the animation
        /// </value>
        /// <remarks>
        /// If no Sys.UI.DomElement or Sys.UI.Control can be found for the given ID, an
        /// argument exception will be thrown.
        /// <remarks>
        
        // Try to find a Sys.UI.DomElement
        var target = null;
        var element = $get(id);
        if (element) {
            target = element;
        } else {
            // Try to find the control in the AJAX controls collection
            var ctrl = $find(id);
            if (ctrl) {
                element = ctrl.get_element();
                if (element) {
                    target = element;
                }
            }
        }
        
        // Use the new target if we have one, or raise an error if not
        if (target) { 
            this.set_target(target);
        } else {
            throw Error.argument('id', String.format(AjaxControlToolkit.Resources.Animation_TargetNotFound, id));
        }
    },
    
    get_duration : function() {
        /// <value type="Number">
        /// Length of the animation in seconds.  The default is 1.
        /// </value>
        return this._duration;
    },
    set_duration : function(value) {
        value = this._getFloat(value);
        if (this._duration != value) {
            this._duration = value;
            this.raisePropertyChanged('duration');
        }
    },
    
    get_fps : function() {
        /// <value type="Number" integer="true">
        /// Number of steps per second.  The default is 25.
        /// </value>
        return this._fps;
    },
    set_fps : function(value) {
        value = this._getInteger(value);
        if (this.fps != value) {
            this._fps = value;
            this.raisePropertyChanged('fps');
        }
    },
    
    get_isActive : function() {
        /// <value type="Boolean">
        /// <code>true</code> if animation is active, <code>false</code> if not.
        /// </value>
        return (this._timer !== null);
    },
    
    get_isPlaying : function() {
        /// <value type="Boolean">
        /// <code>true</code> if animation is playing, <code>false</code> if not.
        /// </value>
        return (this._timer !== null) && this._timer.get_enabled();
    },
    
    get_percentComplete : function() {
        /// <value type="Number">
        /// Percentage of the animation already played.
        /// </value>
        return this._percentComplete;
    },
    
    _getBoolean : function(value) {
        /// <summary>
        /// Helper to convert strings to booleans for property setters
        /// </summary>
        /// <param name="value" type="Object">
        /// Value to convert if it's a string
        /// </param>
        /// <returns type="Object">
        /// Value that has been converted if it was a string
        /// </returns>
        if (String.isInstanceOfType(value)) {
            return Boolean.parse(value);
        }
        return value;
    },
    
    _getInteger : function(value) {
        /// <summary>
        /// Helper to convert strings to integers for property setters
        /// </summary>
        /// <param name="value" type="Object">Value to convert if it's a string</param>
        /// <returns type="Object">Value that has been converted if it was a string</returns>
        if (String.isInstanceOfType(value)) {
            return parseInt(value);
        }
        return value;
    },
    
    _getFloat : function(value) {
        /// <summary>
        /// Helper to convert strings to floats for property setters
        /// </summary>
        /// <param name="value" type="Object">Value to convert if it's a string</param>
        /// <returns type="Object">Value that has been converted if it was a string</returns>
        if (String.isInstanceOfType(value)) {
            return parseFloat(value);
        }
        return value;
    },
    
    _getEnum : function(value, type) {
        /// <summary>
        /// Helper to convert strings to enum values for property setters
        /// </summary>
        /// <param name="value" type="Object">Value to convert if it's a string</param>
        /// <param name="type" type="Type">Type of the enum to convert to</param>
        /// <returns type="Object">Value that has been converted if it was a string</returns>
        if (String.isInstanceOfType(value) && type && type.parse) {
            return type.parse(value);
        }
        return value;
    }
}
$AA.Animation.registerClass('AjaxControlToolkit.Animation.Animation', Sys.Component);
$AA.registerAnimation('animation', $AA.Animation);


$AA.ParentAnimation = function(target, duration, fps, animations) {
    /// <summary>
    /// The <code>ParentAnimation</code> serves as a base class for all animations that contain children (such as
    /// <see cref="AjaxControlToolkit.Animation.ParallelAnimation" />, <see cref="AjaxControlToolkit.SequenceAnimation" />,
    /// etc.).  It does not actually play the animations, so any classes that inherit from it must do so.  Any animation
    /// that requires nested child animations must inherit from this class, although it will likely want to inherit off of
    /// <see cref="AjaxControlToolkit.Animation.ParallelAnimation" /> or <see cref="AjaxControlToolkit.SequenceAnimation" />
    /// which will actually play their child animations.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations to be played
    /// </param>
    /// <animation>Parent</animation>
    $AA.ParentAnimation.initializeBase(this, [target, duration, fps]);
    
    // Array of child animations (there are no assumptions placed on order because
    // it will matter for some derived animations like SequenceAnimation, but not
    // for others like ParallelAnimation) that is demand created in add
    this._animations = [];
    
    // Add any child animations passed into the constructor
    if (animations && animations.length) {
        for (var i = 0; i < animations.length; i++) {
            this.add(animations[i]);
        }
    }
}
$AA.ParentAnimation.prototype = {
    initialize : function() {
    	/// <summary>
        /// Initialize the parent along with any child animations that have not yet been initialized themselves
    	/// </summary>
    	/// <returns />
        $AA.ParentAnimation.callBaseMethod(this, 'initialize');
        
        // Initialize all the uninitialized child animations
        if (this._animations) {
            for (var i = 0; i < this._animations.length; i++) {
                var animation = this._animations[i];
                if (animation && !animation.get_isInitialized) {
                    animation.initialize();
                }
            }
        }
    },
    
    dispose : function() {
    	/// <summary>
        /// Dispose of the child animations
    	/// </summary>
    	/// <returns />

        this.clear();
        this._animations = null;
        $AA.ParentAnimation.callBaseMethod(this, 'dispose');
    },
    
    get_animations : function() {
    	/// <value elementType="AjaxControlToolkit.Animation.Animation">
        /// Array of child animations to be played (there are no assumptions placed on order because it will matter for some
        /// derived animations like <see cref="AjaxControlToolkit.Animation.SequenceAnimation" />, but not for
        /// others like <see cref="AjaxControlToolkit.Animation.ParallelAnimation" />).  To manipulate the child
        /// animations, use the functions <code>add</code>, <code>clear</code>, <code>remove</code>, and <code>removeAt</code>.
    	/// </value>
        return this._animations;
    },
    
    add : function(animation) {
    	/// <summary>
        /// Add an animation as a child of this animation.
    	/// </summary>
    	/// <param name="animation" type="AjaxControlToolkit.Animation.Animation">Child animation to add</param>
    	/// <returns />

        if (this._animations) {
            if (animation) {
                animation._parentAnimation = this;
            }
            Array.add(this._animations, animation);
            this.raisePropertyChanged('animations');
        }
    },
    
    remove : function(animation) {
        /// <summary>
        /// Remove the animation from the array of child animations.
        /// </summary>
        /// <param name="animation" type="AjaxControlToolkit.Animation.Animation">
        /// Child animation to remove
        /// </param>
        /// <returns />
        /// <remarks>
        /// This will dispose the removed animation.
        /// </remarks>

        if (this._animations) {
            if (animation) {
                animation.dispose();
            }
            Array.remove(this._animations, animation);
            this.raisePropertyChanged('animations');
        }
    },
    
    removeAt : function(index) {
        /// <summary>
        /// Remove the animation at a given index from the array of child animations.
        /// </summary>
        /// <param name="index" type="Number" integer="true">
        /// Index of the child animation to remove
        /// </param>
        /// <returns />
        
        if (this._animations) {
            var animation = this._animations[index];
            if (animation) {
                animation.dispose();
            }
            Array.removeAt(this._animations, index);
            this.raisePropertyChanged('animations');
        }
    },
    
    clear : function() {
    	/// <summary>
        /// Clear the array of child animations.
    	/// </summary>
    	/// <remarks>
    	/// This will dispose the cleared child animations.
    	/// </remarks>
    	/// <returns />

        if (this._animations) {
            for (var i = this._animations.length - 1; i >= 0; i--) {
                this._animations[i].dispose();
                this._animations[i] = null;
            }
            Array.clear(this._animations);
            this._animations = [];
            this.raisePropertyChanged('animations');
        }
    }
}
$AA.ParentAnimation.registerClass('AjaxControlToolkit.Animation.ParentAnimation', $AA.Animation);
$AA.registerAnimation('parent', $AA.ParentAnimation);


$AA.ParallelAnimation = function(target, duration, fps, animations) {
    /// <summary>
    /// The <code>ParallelAnimation</code> plays several animations simultaneously.  It inherits from
    /// <see cref="AjaxControlToolkit.Animation.ParentAnimation" />, but makes itself the owner of all
    /// its child animations to allow the use a single timer and syncrhonization mechanisms shared with
    /// all the children (in other words, the <code>duration</code> properties of any child animations
    /// are ignored in favor of the parent's <code>duration</code>).  It is very useful in creating
    /// sophisticated effects through combination of simpler animations.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations
    /// </param>
    /// <animation>Parallel</animation>
    $AA.ParallelAnimation.initializeBase(this, [target, duration, fps, animations]);
}
$AA.ParallelAnimation.prototype = {
    add : function(animation) {
    	/// <summary>
        /// Add an animation as a child of this animation and make ourselves its owner.
    	/// </summary>
    	/// <param name="animation" type="AjaxControlToolkit.Animation.Animation">Child animation to add</param>
    	/// <returns />
        $AA.ParallelAnimation.callBaseMethod(this, 'add', [animation]);
        animation.setOwner(this);
    },
    
    onStart : function() {
        /// <summary>
        /// Get the child animations ready to play
        /// </summary>
        /// <returns />

        $AA.ParallelAnimation.callBaseMethod(this, 'onStart');
        var animations = this.get_animations();
        for (var i = 0; i < animations.length; i++) {
            animations[i].onStart();
        }
    },
    
    onStep : function(percentage) {
        /// <summary>
        /// Progress the child animations through each frame
        /// </summary>
        /// <param name="percentage" type="Number">
        /// Percentage of the animation already complete
        /// </param>
        /// <returns />

        var animations = this.get_animations();
        for (var i = 0; i < animations.length; i++) {
            animations[i].onStep(percentage);
        }
    },
    
    onEnd : function() {
        /// <summary>
        /// Finish playing all of the child animations
        /// </summary>
        /// <returns />

        var animations = this.get_animations();
        for (var i = 0; i < animations.length; i++) {
            animations[i].onEnd();
        }
        $AA.ParallelAnimation.callBaseMethod(this, 'onEnd');
    }
}
$AA.ParallelAnimation.registerClass('AjaxControlToolkit.Animation.ParallelAnimation', $AA.ParentAnimation);
$AA.registerAnimation('parallel', $AA.ParallelAnimation);


$AA.SequenceAnimation = function(target, duration, fps, animations, iterations) {
    /// <summary>
    /// The <code>SequenceAnimation</code> runs several animations one after the other.  It can also
    /// repeat the sequence of animations for a specified number of iterations (which defaults to a
    /// single iteration, but will repeat forever if you specify zero or less iterations).  Also, the
    /// <code>SequenceAnimation</code> cannot be a child of a <see cref="AjaxControlToolkit.Animation.ParallelAnimation" />
    /// (or any animation inheriting from it).
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations
    /// </param>
    /// <param name="iterations" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of times to repeatedly play the sequence.  If zero or less iterations are specified, the sequence
    /// will repeat forever.  The default value is 1 iteration.
    /// </param>
    /// <remarks>
    /// The <code>SequenceAnimation</code> ignores the <code>duration</code> and <code>fps</code>
    /// properties, and will let each of its child animations use any settings they please.
    /// </remarks>
    /// <animation>Sequence</animation>
    $AA.SequenceAnimation.initializeBase(this, [target, duration, fps, animations]);

    // Handler used to determine when an animation has finished
    this._handler = null;
    
    // Flags to note whether we're playing, paused, or stopped
    this._paused = false;
    this._playing = false;
    
    // Index of the currently executing animation in the sequence
    this._index = 0;
    
    // Counter used when playing the animation to determine the remaining number of times to play the entire sequence
    this._remainingIterations = 0;
    
    // Number of iterations
    this._iterations = (iterations !== undefined) ? iterations : 1;
}
$AA.SequenceAnimation.prototype = {
    dispose : function() {
    	/// <summary>
        /// Dispose the animation
        /// </summary>
        /// <returns />
        this._handler = null;
        $AA.SequenceAnimation.callBaseMethod(this, 'dispose');
    },
    
    stop : function() {
        /// <summary>
        /// Stop playing the entire sequence of animations
        /// </summary>
        /// <returns />
        /// <remarks>
        /// Stopping this animation will perform the last step of each child animation, thereby leaving their
        /// target elements in a state consistent with the animation playing completely. If this animation is
        /// the child of another, you must call <code>stop</code> on its parent instead.
        /// </remarks>

        if (this._playing) {
            var animations = this.get_animations();
            if (this._index < animations.length) {
                // Remove the handler from the currently running animation
                animations[this._index].remove_ended(this._handler);
                // Call stop on all remaining animations to ensure their
                // effects will be seen
                for (var i = this._index; i < animations.length; i++) {
                    animations[i].stop();
                }
            }
            this._playing = false;
            this._paused = false;
            this.raisePropertyChanged('isPlaying');
            this.onEnd();
        }
    },
    
    pause : function() {
        /// <summary>
        /// Pause the animation if it is playing.  Calling <code>play</code> will resume where
        /// the animation left off.
        /// </summary>
        /// <returns />
        /// <remarks>
        /// If this animation is the child of another, you must call <code>pause</code> on its parent instead.
        /// </remarks>

        if (this.get_isPlaying()) {
            var current = this.get_animations()[this._index];
            if (current != null) {
                current.pause();
            }
            this._paused = true;
            this.raisePropertyChanged('isPlaying');
        }
    },
    
    play : function() {
        /// <summary>
        /// Play the sequence of animations from the beginning or where it was left off when paused
        /// </summary>
        /// <returns />
        /// <remarks>
        /// If this animation is the child of another, you must call <code>play</code> on its parent instead
        /// </remarks>

        var animations = this.get_animations();
        if (!this._playing) {
            this._playing = true;
            if (this._paused) {
                this._paused = false;
                var current = animations[this._index];
                if (current != null) {
                    current.play();
                    this.raisePropertyChanged('isPlaying');
                }
            } else {
                this.onStart();
                // Reset the index and attach the handler to the first
                this._index = 0;
                var first = animations[this._index];
                if (first) {
                    first.add_ended(this._handler);
                    first.play();
                    this.raisePropertyChanged('isPlaying');
                } else {
                    this.stop();
                }
            }
        }
    },
    
    onStart : function() {
        /// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time
        /// </summary>
        /// <returns />
        $AA.SequenceAnimation.callBaseMethod(this, 'onStart');
        this._remainingIterations = this._iterations - 1;
        
        // Create the handler we attach to each animation as it plays to determine when we've finished with it
        if (!this._handler) {
            this._handler = Function.createDelegate(this, this._onEndAnimation);
        }
    },
    
    _onEndAnimation : function() {
    	/// <summary>
        /// Wait for the end of each animation, and then continue by playing the other animations remaining
        /// in the sequence.  Stop when it reaches the last animation and there are no remaining iterations.
    	/// </summary>
    	/// <returns />

        // Remove the handler from the current animation
        var animations = this.get_animations();
        var current = animations[this._index++];
        if (current) {
            current.remove_ended(this._handler);
        }
        
        // Keep running animations and stop when we're out
        if (this._index < animations.length) {
            var next = animations[this._index];
            next.add_ended(this._handler);
            next.play();
        } else if (this._remainingIterations >= 1 || this._iterations <= 0) {
            this._remainingIterations--;
            this._index = 0;
            var first = animations[0];
            first.add_ended(this._handler);
            first.play();
        } else {
            this.stop();
        }
    },
    
    onStep : function(percentage) {
        /// <summary>
        /// Raises an invalid operation exception because this will only be called if a <code>SequenceAnimation</code>
        /// has been nested inside an <see cref="AjaxControlToolkit.Animation.ParallelAnimation" /> (or a derived type).
        /// </summary>
        /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
        /// <returns />
        throw Error.invalidOperation(AjaxControlToolkit.Resources.Animation_CannotNestSequence);
    },
    
    onEnd : function() {
        /// <summary>
        /// The <code>onEnd</code> method is called just after the animation is played each time.
        /// </summary>
        /// <returns />
        this._remainingIterations = 0;
        $AA.SequenceAnimation.callBaseMethod(this, 'onEnd');
    },
    
    get_isActive : function() {
    	/// <value type="Boolean">
        /// <code>true</code> if animation is active, <code>false</code> if not.
        /// </value>
        return true;
    },
    
    get_isPlaying : function() {
    	/// <value type="Boolean">
        /// <code>true</code> if animation is playing, <code>false</code> if not.
        /// </value>
        return this._playing && !this._paused;
    },
    
    get_iterations : function() {
        /// <value type="Number" integer="true">
        /// Number of times to repeatedly play the sequence.  If zero or less iterations are specified, the sequence
        /// will repeat forever.  The default value is 1 iteration.
        /// </value>
        return this._iterations;
    },
    set_iterations : function(value) {
        value = this._getInteger(value);
        if (this._iterations != value) {
            this._iterations = value;
            this.raisePropertyChanged('iterations');
        }
    },
    
    get_isInfinite : function() {
    	/// <value type="Boolean">
        /// <code>true</code> if this animation will repeat forever, <code>false</code> otherwise.
    	/// </value>
        return this._iterations <= 0;
    }
}
$AA.SequenceAnimation.registerClass('AjaxControlToolkit.Animation.SequenceAnimation', $AA.ParentAnimation);
$AA.registerAnimation('sequence', $AA.SequenceAnimation);


$AA.SelectionAnimation = function(target, duration, fps, animations) {
    /// <summary>
    /// The <code>SelectionAnimation</code> will run a single animation chosen from of its child animations. It is
    /// important to note that the <code>SelectionAnimation</code> ignores the <code>duration</code> and <code>fps</code>
    /// properties, and will let each of its child animations use any settings they please.  This is a base class with no
    /// functional implementation, so consider using <see cref="AjaxControlToolkit.Animation.ConditionAnimation" /> or
    /// <see cref="AjaxControlToolkit.Animation.CaseAnimation" /> instead.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations
    /// </param>
    /// <animation>Selection</animation>
    $AA.SelectionAnimation.initializeBase(this, [target, duration, fps, animations]);
    
    // Index of the animation selected to play
    this._selectedIndex = -1;
    
    // Reference to the animation selected to play
    this._selected = null;
}
$AA.SelectionAnimation.prototype = {    
    getSelectedIndex : function() {
        /// <summary>
        /// Get the index of the animation that is selected to be played.  If this returns an index outside the bounds of
        /// the child animations array, then nothing is played.
        /// </summary>
        /// <returns type="Number" integer="true">
        /// Index of the selected child animation to play
        /// </returns>
        throw Error.notImplemented();
    },
    
    onStart : function() {
    	/// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time.
        /// </summary>
        /// <returns />
	    $AA.SelectionAnimation.callBaseMethod(this, 'onStart');
	    
	    var animations = this.get_animations();
	    this._selectedIndex = this.getSelectedIndex();
	    if (this._selectedIndex >= 0 && this._selectedIndex < animations.length) {
	        this._selected = animations[this._selectedIndex];
	        if (this._selected) {
	            this._selected.setOwner(this);
	            this._selected.onStart();
	        }
	    }
    },
    
    onStep : function(percentage) {
    	/// <summary>
        /// The <code>onStep</code> method is called repeatedly to progress the animation through each frame
        /// </summary>
        /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
        /// <returns />

        if (this._selected) {
    	    this._selected.onStep(percentage);
    	}
    },
    
    onEnd : function() {
    	/// <summary>
        /// The <code>onEnd</code> method is called just after the animation is played each time.
        /// </summary>
        /// <returns />

        if (this._selected) {
    	    this._selected.onEnd();
    	    this._selected.setOwner(null);
    	}
    	this._selected = null;
    	this._selectedIndex = null;
	    $AA.SelectionAnimation.callBaseMethod(this, 'onEnd');
    }
}
$AA.SelectionAnimation.registerClass('AjaxControlToolkit.Animation.SelectionAnimation', $AA.ParentAnimation);
$AA.registerAnimation('selection', $AA.SelectionAnimation);


$AA.ConditionAnimation = function(target, duration, fps, animations, conditionScript) {
    /// <summary>
    /// The <code>ConditionAnimation</code> is used as a control structure to play a specific child animation
    /// depending on the result of executing the <code>conditionScript</code>.  If the <code>conditionScript</code>
    /// evaluates to <code>true</code>, the first child animation is played.  If it evaluates to <code>false</code>,
    /// the second child animation is played (although nothing is played if a second animation is not present).
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations
    /// </param>
    /// <param name="conditionScript" type="String" mayBeNull="true" optional="true">
    /// JavaScript that should evaluate to <code>true</code> or <code>false</code> to determine which child
    /// animation to play.
    /// </param>
    /// <animation>Condition</animation>
    $AA.ConditionAnimation.initializeBase(this, [target, duration, fps, animations]);
    
    // Condition to determine which index we will play
    this._conditionScript = conditionScript;   
}
$AA.ConditionAnimation.prototype = {    
   getSelectedIndex : function() {
       /// <summary>
       /// Get the index of the animation that is selected to be played.  If this returns an index outside the bounds of
       /// the child animations array, then nothing is played.
       /// </summary>
       /// <returns type="Number" integer="true">
       /// Index of the selected child animation to play
       /// </returns>

        var selected = -1;
        if (this._conditionScript && this._conditionScript.length > 0) {
            try {
                selected = eval(this._conditionScript) ? 0 : 1;
            } catch(ex) {
            }
        }
        return selected;
    },
    
    get_conditionScript : function() {
    	/// <value type="String">
        /// JavaScript that should evaluate to <code>true</code> or <code>false</code> to determine which
        /// child animation to play.
    	/// </value>
        return this._conditionScript;
    },
    set_conditionScript : function(value) {
        if (this._conditionScript != value) {
            this._conditionScript = value;
            this.raisePropertyChanged('conditionScript');
        }
    }
}
$AA.ConditionAnimation.registerClass('AjaxControlToolkit.Animation.ConditionAnimation', $AA.SelectionAnimation);
$AA.registerAnimation('condition', $AA.ConditionAnimation);


$AA.CaseAnimation = function(target, duration, fps, animations, selectScript) {
    /// <summary>
    /// The <code>CaseAnimation</code> is used as a control structure to play a specific child animation depending on
    /// the result of executing the <code>selectScript</code>, which should return the index of the child animation to
    /// play (this is similar to the <code>case</code> or <code>select</code> statements in C#/VB, etc.).  If the provided
    /// index is outside the bounds of the child animations array (or if nothing was returned) then we will not play anything.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="animations" mayBeNull="true" optional="true" parameterArray="true" elementType="AjaxControlToolkit.Animation.Animation">
    /// Array of child animations
    /// </param>
    /// <param name="selectScript" type="String" mayBeNull="true" optional="true">
    /// JavaScript that should evaluate to the index of the appropriate child animation to play.  If this returns an index outside the bounds of the child animations array, then nothing is played.
    /// </param>
    /// <animation>Case</animation>
    $AA.CaseAnimation.initializeBase(this, [target, duration, fps, animations]);

    // Condition to determine which index we will play
    this._selectScript = selectScript;
}
$AA.CaseAnimation.prototype = {
    getSelectedIndex : function() {
        /// <summary>
        /// Get the index of the animation that is selected to be played.  If this returns an index outside the bounds of
        /// the child animations array, then nothing is played.
        /// </summary>
        /// <returns type="Number" integer="true">
        /// Index of the selected child animation to play
        /// </returns>

        var selected = -1;
        if (this._selectScript && this._selectScript.length > 0) {
            try {
                var result = eval(this._selectScript)
                if (result !== undefined)
                    selected = result;
            } catch (ex) {
            }
        }
        return selected;
    },
    
    get_selectScript : function() {
        /// <value type="String">
        /// JavaScript that should evaluate to the index of the appropriate child animation to play.  If this returns an index outside the bounds of the child animations array, then nothing is played.
        /// </value>
        return this._selectScript;
    },
    set_selectScript : function(value) {
        if (this._selectScript != value) {
            this._selectScript = value;
            this.raisePropertyChanged('selectScript');
        }
    }
}
$AA.CaseAnimation.registerClass('AjaxControlToolkit.Animation.CaseAnimation', $AA.SelectionAnimation);
$AA.registerAnimation('case', $AA.CaseAnimation);


$AA.FadeEffect = function() {
    /// <summary>
    /// The FadeEffect enumeration determines whether a fade animation is used to fade in or fade out.
    /// </summary>
    /// <field name="FadeIn" type="Number" integer="true" />
    /// <field name="FadeOut" type="Number" integer="true" />
    throw Error.invalidOperation();
}
$AA.FadeEffect.prototype = {
    FadeIn : 0,
    FadeOut : 1
}
$AA.FadeEffect.registerEnum("AjaxControlToolkit.Animation.FadeEffect", false);


$AA.FadeAnimation = function(target, duration, fps, effect, minimumOpacity, maximumOpacity, forceLayoutInIE) {
    /// <summary>
    /// The <code>FadeAnimation</code> is used to fade an element in or out of view, depending on the
    /// provided <see cref="AjaxControlToolkit.Animation.FadeEffect" />, by settings its opacity.
    /// The minimum and maximum opacity values can be specified to precisely control the fade.
    /// You may also consider using <see cref="AjaxControlToolkit.Animation.FadeInAnimation" /> or
    /// <see cref="AjaxControlToolkit.Animation.FadeOutAnimation" /> if you know the only direction you
    /// are fading.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="effect" type="AjaxControlToolkit.Animation.FadeEffect" mayBeNull="true" optional="true">
    /// Determine whether to fade the element in or fade the element out.  The possible values are <code>FadeIn</code>
    /// and <code>FadeOut</code>.  The default value is <code>FadeOut</code>.
    /// </param>
    /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
    /// </param>
    /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
    /// </param>
    /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
    /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
    /// This is obviously ignored when working in other browsers.
    /// </param>
    /// <animation>Fade</animation>
    $AA.FadeAnimation.initializeBase(this, [target, duration, fps]);

    // The effect determines whether or not we fade in or out
    this._effect = (effect !== undefined) ? effect : $AA.FadeEffect.FadeIn;
    
    // Maximum and minimum opacities default to 100% and 0%
    this._max = (maximumOpacity !== undefined) ? maximumOpacity : 1;
    this._min = (minimumOpacity !== undefined) ? minimumOpacity : 0;
    
    // Starting and ending opacities
    this._start = this._min;
    this._end = this._max;
    
    // Whether the a layout has already been created (to work around IE problems)
    this._layoutCreated = false;

    // Whether or not we should force a layout to be created for IE by giving it a width
    // and setting its background color (the latter is required in case the user has ClearType enabled).
    // http://msdn.microsoft.com/library/default.asp?url=/workshop/author/filter/reference/filters/alpha.asp
    this._forceLayoutInIE = (forceLayoutInIE === undefined || forceLayoutInIE === null) ? true : forceLayoutInIE;
    
    // Current target of the animation that is cached before the animation plays (since looking up
    // the target could mean walking all the way up to the root of the animation's tree, which we don't
    // want to do for every step of the animation)
    this._currentTarget = null;
    
    // Properly set up the min/max values provided by the constructor
    this._resetOpacities();
}
$AA.FadeAnimation.prototype = {
    _resetOpacities : function() {
    	/// <summary>
        /// Set the starting and ending opacity values based on the effect (i.e. when we're fading
        /// in we go from <code>_min</code> to <code>_max</code>, but we go <code>_max</code> to
        /// <code>_min</code> when fading out)
    	/// </summary>
    	/// <returns />

        if (this._effect == $AA.FadeEffect.FadeIn) {
            this._start = this._min;
            this._end = this._max;
        } else {
            this._start = this._max;
            this._end = this._min;
        }
    },
    
    _createLayout : function() {
    	/// <summary>
        /// Create a layout when using Internet Explorer (which entails setting a width and also
        /// a background color if it currently has neither)
    	/// </summary>
    	/// <returns />

        var element = this._currentTarget;
        if (element) {
            // Get the original width/height/back color
            var originalWidth = $common.getCurrentStyle(element, 'width');
            var originalHeight = $common.getCurrentStyle(element, 'height');
            var originalBackColor = $common.getCurrentStyle(element, 'backgroundColor');

            // Set the width which will force the creation of a layout
            if ((!originalWidth || originalWidth == '' || originalWidth == 'auto') &&
                (!originalHeight || originalHeight == '' || originalHeight == 'auto')) {
                element.style.width = element.offsetWidth + 'px';
            }
            
            // Set the back color to avoid ClearType problems
            if (!originalBackColor || originalBackColor == '' || originalBackColor == 'transparent' || originalBackColor == 'rgba(0, 0, 0, 0)') {
                element.style.backgroundColor = $common.getInheritedBackgroundColor(element);
            }
            
            // Mark that we've created the layout so we only do it once
            this._layoutCreated = true;
        }
    },
    
    onStart : function() {
    	/// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time.
        /// </summary>
        /// <returns />       
        $AA.FadeAnimation.callBaseMethod(this, 'onStart');
        
        this._currentTarget = this.get_target();
        this.setValue(this._start);
        
        // Force the creation of a layout in IE if we're supposed to and the current browser is Internet Explorer
        if (this._forceLayoutInIE && !this._layoutCreated && Sys.Browser.agent == Sys.Browser.InternetExplorer) {
            this._createLayout();
        }
    },
    
    getAnimatedValue : function(percentage) {
    	/// <summary>
        /// Determine the current opacity after the given percentage of its duration has elapsed
        /// </summary>
        /// <param name="percentage" type="Number">Percentage of the animation already complete</param>
        /// <returns type="Number">
        /// Current opacity after the given percentage of its duration has elapsed that will
        /// be passed to <code>setValue</code>
        /// </returns>
        return this.interpolate(this._start, this._end, percentage);
    },
    
    setValue : function(value) {
        /// <summary>
        /// Set the current opacity of the element.
        /// </summary>
        /// <param name="value" type="Number">
        /// Current opacity (as retreived from <code>getAnimatedValue</code>)
        /// </param>
        /// <returns />
        /// <remarks>
        /// This method will be replaced by a dynamically generated function that requires no logic
        /// to determine whether it should use filters or the style's opacity.
        /// </remarks>
        if (this._currentTarget) {
            $common.setElementOpacity(this._currentTarget, value);
        }
    },
    
//    set_target : function(value) {
//        /// <value type="Sys.UI.DomElement">
//        /// Override the <code>target</code> property to dynamically create the setValue function.
//        /// </value>
//        /// <remarks>
//        /// Do not set this property in a generic Xml animation description. It will be set automatically
//        /// using either the extender's TargetControlID or the AnimationTarget property.
//        /// <remarks>
//        $AA.FadeAnimation.callBaseMethod(this, 'set_target', [value]);
//        
//        var element = value;
//        if (element) {
//            var filters = element.filters;
//            if (filters) {
//                var alphaFilter = null;
//                if (filters.length !== 0) {
//                    alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
//                }
//                if (!alphaFilter) {
//                    element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (this._start * 100) + ')';
//                    alphaFilter = filters['DXImageTransform.Microsoft.Alpha'];
//                }
//                if (alphaFilter) {
//                    this.setValue = function(val) { alphaFilter.opacity = val * 100; }
//                } else {
//                    this.setValue = function(val) {
//                        element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + (val * 100) + ')';
//                    };
//                }
//            }
//            else {
//                this.setValue = function(val) { element.style.opacity = val; };
//            }
//        }
//    },
    
    get_effect : function() {
    	/// <value type="AjaxControlToolkit.Animation.FadeEffect">
        /// Determine whether to fade the element in or fade the element out.  The possible values are
        /// <code>FadeIn</code> and <code>FadeOut</code>.  The default value is <code>FadeOut</code>.
    	/// </value>
        return this._effect;
    },
    set_effect : function(value) {
        value = this._getEnum(value, $AA.FadeEffect);
        if (this._effect != value) {
            this._effect = value;
            this._resetOpacities();
            this.raisePropertyChanged('effect');
        }
    },
    
    get_minimumOpacity : function() {
        /// <value type="Number">
        /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1.
        /// The default value is 0.
        /// </value>
	    return this._min;
    },
    set_minimumOpacity : function(value) {
        value = this._getFloat(value);
        if (this._min != value) {
            this._min = value;
            this._resetOpacities();
            this.raisePropertyChanged('minimumOpacity');
        }
    },
    
    get_maximumOpacity : function() {
        /// <value type="Number">
        /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1.
        /// The default value is 1.
        /// </value>
        return this._max;
    },
    set_maximumOpacity : function(value) {
        value = this._getFloat(value);
        if (this._max != value) {
            this._max = value;
            this._resetOpacities();
            this.raisePropertyChanged('maximumOpacity');
        }
    },
    
    get_forceLayoutInIE : function() {
        /// <value type="Boolean">
        /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
        /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
        /// This is obviously ignored when working in other browsers.
        /// </value>
        return this._forceLayoutInIE;
    },
    set_forceLayoutInIE : function(value) {
        value = this._getBoolean(value);
        if (this._forceLayoutInIE != value) {
            this._forceLayoutInIE = value;
            this.raisePropertyChanged('forceLayoutInIE');
        }
    },
    
    set_startValue : function(value) {
        /// <value type="Number">
        /// Set the start value (so that child animations can set the current opacity as the start value when fading in or out)
        /// </value>
        value = this._getFloat(value);
        this._start = value;
    }
}
$AA.FadeAnimation.registerClass('AjaxControlToolkit.Animation.FadeAnimation', $AA.Animation);
$AA.registerAnimation('fade', $AA.FadeAnimation);


$AA.FadeInAnimation = function(target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE) {
    /// <summary>
    /// The <code>FadeInAnimation</code> will fade the target in by moving from hidden to visible.
    /// It starts the animation the target's current opacity.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
    /// </param>
    /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
    /// </param>
    /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
    /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
    /// This is obviously ignored when working in other browsers.
    /// </param>
    /// <animation>FadeIn</animation>
    $AA.FadeInAnimation.initializeBase(this, [target, duration, fps, $AA.FadeEffect.FadeIn, minimumOpacity, maximumOpacity, forceLayoutInIE]);
}
$AA.FadeInAnimation.prototype = {
    onStart : function() {
    	/// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time.
        /// </summary>
        /// <returns />
        $AA.FadeInAnimation.callBaseMethod(this, 'onStart');
        
        if (this._currentTarget) {
            this.set_startValue($common.getElementOpacity(this._currentTarget));
        }
    }
}
$AA.FadeInAnimation.registerClass('AjaxControlToolkit.Animation.FadeInAnimation', $AA.FadeAnimation);
$AA.registerAnimation('fadeIn', $AA.FadeInAnimation);


$AA.FadeOutAnimation = function(target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE) {
    /// <summary>
    /// The FadeInAnimation will fade the element out by moving from visible to hidden. It starts the animation
    /// at the element's current opacity.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
    /// </param>
    /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
    /// </param>
    /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
    /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
    /// This is obviously ignored when working in other browsers.
    /// </param>
    /// <animation>FadeOut</animation>
    $AA.FadeOutAnimation.initializeBase(this, [target, duration, fps, $AA.FadeEffect.FadeOut, minimumOpacity, maximumOpacity, forceLayoutInIE]);
}
$AA.FadeOutAnimation.prototype = {
    onStart : function() {
    	/// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time.
        /// </summary>
        /// <returns />
        $AA.FadeOutAnimation.callBaseMethod(this, 'onStart');

        if (this._currentTarget) {
            this.set_startValue($common.getElementOpacity(this._currentTarget));
        }
    }
}
$AA.FadeOutAnimation.registerClass('AjaxControlToolkit.Animation.FadeOutAnimation', $AA.FadeAnimation);
$AA.registerAnimation('fadeOut', $AA.FadeOutAnimation);


$AA.PulseAnimation = function(target, duration, fps, iterations, minimumOpacity, maximumOpacity, forceLayoutInIE) {
    /// <summary>
    /// The PulseAnimation fades an element in and our repeatedly to create a pulsating
    /// effect.  The iterations determines how many pulses there will be (which defaults
    /// to three, but it will repeat infinitely if given zero or less).  The duration
    /// property defines the duration of each fade in or fade out, not the duration of
    /// the animation as a whole.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="iterations" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of times to repeatedly play the sequence.  If zero or less iterations are specified, the sequence
    /// will repeat forever.  The default value is 1 iteration.
    /// </param>
    /// <param name="minimumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
    /// </param>
    /// <param name="maximumOpacity" type="Number" mayBeNull="true" optional="true">
    /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
    /// </param>
    /// <param name="forceLayoutInIE" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
    /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
    /// This is obviously ignored when working in other browsers.
    /// </param>
    /// <animation>Pulse</animation>
    $AA.PulseAnimation.initializeBase(this, [target, duration, fps, null, ((iterations !== undefined) ? iterations : 3)]);

    // Create the FadeOutAnimation
    this._out = new $AA.FadeOutAnimation(target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE);
    this.add(this._out);
    
    // Create the FadeInAnimation
    this._in = new $AA.FadeInAnimation(target, duration, fps, minimumOpacity, maximumOpacity, forceLayoutInIE);
    this.add(this._in);
}
$AA.PulseAnimation.prototype = {
   
    get_minimumOpacity : function() {
        /// <value type="Number">
        /// Minimum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 0.
        /// </value>
        return this._out.get_minimumOpacity();
    },
    set_minimumOpacity : function(value) {
        value = this._getFloat(value);
        this._out.set_minimumOpacity(value);
        this._in.set_minimumOpacity(value);
        this.raisePropertyChanged('minimumOpacity');
    },
    
    get_maximumOpacity : function() {
        /// <value type="Number">
        /// Maximum opacity to use when fading in or out. Its value can range from between 0 to 1. The default value is 1.
        /// </value>
        return this._out.get_maximumOpacity();
    },
    set_maximumOpacity : function(value) {
        value = this._getFloat(value);
        this._out.set_maximumOpacity(value);
        this._in.set_maximumOpacity(value);
        this.raisePropertyChanged('maximumOpacity');
    },
    
    get_forceLayoutInIE : function() {
        /// <value type="Boolean">
        /// Whether or not we should force a layout to be created for Internet Explorer by giving it a width and setting its
        /// background color (the latter is required in case the user has ClearType enabled). The default value is <code>true</code>.
        /// This is obviously ignored when working in other browsers.
        /// </value>
        return this._out.get_forceLayoutInIE();
    },
    set_forceLayoutInIE : function(value) {
        value = this._getBoolean(value);
        this._out.set_forceLayoutInIE(value);
        this._in.set_forceLayoutInIE(value);
        this.raisePropertyChanged('forceLayoutInIE');
    },
    
    set_duration : function(value) {
        /// <value type="Number">
        /// Override the <code>duration</code> property
        /// </value>
        value = this._getFloat(value);
        $AA.PulseAnimation.callBaseMethod(this, 'set_duration', [value]);
        this._in.set_duration(value);
        this._out.set_duration(value);
    },
    
    set_fps : function(value) {
        /// <value type="Number" integer="true">
        /// Override the <code>fps</code> property
        /// </value>
        value = this._getInteger(value);
        $AA.PulseAnimation.callBaseMethod(this, 'set_fps', [value]);
        this._in.set_fps(value);
        this._out.set_fps(value);
    }
    
}
$AA.PulseAnimation.registerClass('AjaxControlToolkit.Animation.PulseAnimation', $AA.SequenceAnimation);
$AA.registerAnimation('pulse', $AA.PulseAnimation);


$AA.PropertyAnimation = function(target, duration, fps, property, propertyKey) {
    /// <summary>
    /// The <code>PropertyAnimation</code> is a useful base animation that will assign the value from
    /// <code>getAnimatedValue</code> to a specified <code>property</code>. You can provide the name of
    /// a <code>property</code> alongside an optional <code>propertyKey</code> (which indicates the value
    /// <code>property[propertyKey]</code>, like <code>style['backgroundColor']</code>).
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="property" type="String" mayBeNull="true" optional="true">
    /// Property of the <code>target</code> element to set when animating
    /// </param>
    /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
    /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
    /// </param>
    /// <animation>Property</animation>
    $AA.PropertyAnimation.initializeBase(this, [target, duration, fps]);

    // Name of the property to set
    this._property = property;
    
    // Optional Key of the property to set (i.e., if the property were "style" then
    // this might be "backgroundColor")
    this._propertyKey = propertyKey;
    
    // Current target of the animation that is cached before the animation plays (since looking up
    // the target could mean walking all the way up to the root of the animation's tree, which we don't
    // want to do for every step of the animation)
    this._currentTarget = null;
}
$AA.PropertyAnimation.prototype = {
    onStart : function() {
    	/// <summary>
        /// The <code>onStart</code> method is called just before the animation is played each time.
        /// </summary>
        /// <returns />
        $AA.PropertyAnimation.callBaseMethod(this, 'onStart');

        this._currentTarget = this.get_target();
    },

    setValue : function(value) {
        /// <summary>
        /// Set the current value of the property
        /// </summary>
        /// <param name="value" type="Object" mayBeNull="true">
        /// Value to assign
        /// </param>
        /// <returns />

        var element = this._currentTarget;
        if (element && this._property && this._property.length > 0) { 
            if (this._propertyKey && this._propertyKey.length > 0 && element[this._property]) {
                element[this._property][this._propertyKey] = value;
            } else {
                element[this._property] = value;
            }
        }
        // Sys.TypeDescriptor.setProperty(this.get_target(), this._property, value, this._propertyKey);
    },
    
    getValue : function() {
        /// <summary>
        /// Get the current value from the property
        /// </summary>
        /// <returns type="Object" mayBeNull="true">
        /// Current value of the property
        /// </returns>

        var element = this.get_target();
        if (element && this._property && this._property.length > 0) { 
            var property = element[this._property];
            if (property) {
                if (this._propertyKey && this._propertyKey.length > 0) {
                    return property[this._propertyKey];
                }
                return property;
            }
        }
        return null;
        // return Sys.TypeDescriptor.getProperty(this.get_target(), this._property, this._propertyKey);
    },
    
    get_property : function() {
        /// <value type="String">
        /// Property of the <code>target</code> element to set when animating
        /// </value>
        return this._property;
    },
    set_property : function(value) {
        if (this._property != value) {
            this._property = value;
            this.raisePropertyChanged('property');
        }
    },
    
    get_propertyKey : function() {
        /// <value type="String" mayBeNull="true" optional="true">
        /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
        /// </value>
        return this._propertyKey;
    },
    set_propertyKey : function(value) {
        if (this._propertyKey != value) {
            this._propertyKey = value;
            this.raisePropertyChanged('propertyKey');
        }
    }
}
$AA.PropertyAnimation.registerClass('AjaxControlToolkit.Animation.PropertyAnimation', $AA.Animation);
$AA.registerAnimation('property', $AA.PropertyAnimation);


$AA.DiscreteAnimation = function(target, duration, fps, property, propertyKey, values) {
    /// <summary>
    /// The <code>DiscreteAnimation</code> inherits from <see cref="AjaxControlToolkit.Animation.PropertyAnimation" />
    /// and sets the value of the <code>property</code> to the elements in a provided array of <code>values</code>.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="property" type="String" mayBeNull="true" optional="true">
    /// Property of the <code>target</code> element to set when animating
    /// </param>
    /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
    /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
    /// </param>
    /// <param name="values" mayBeNull="true" optional="true" parameterArray="true" elementType="Object">
    /// Array of possible values of the property that will be iterated over as the animation is played
    /// </param>
    /// <animation>Discrete</animation>
    $AA.DiscreteAnimation.initializeBase(this, [target, duration, fps, property, propertyKey]);

    // Values to assign to the property
    this._values = (values && values.length) ? values : [];
}
$AA.DiscreteAnimation.prototype = {
    getAnimatedValue : function(percentage) {
        /// <summary>
        /// Assign the value whose index corresponds to the current percentage
        /// </summary>
        /// <param name="percentage" type="Number">
        /// Percentage of the animation already complete
        /// </param>
        /// <returns type="Object">
        /// State of the animation after the given percentage of its duration has elapsed that will
        /// be passed to <code>setValue</code>
        /// </returns>
        var index = Math.floor(this.interpolate(0, this._values.length - 1, percentage));
        return this._values[index];
    },
    
    get_values : function() {
        /// <value parameterArray="true" elementType="Object">
        /// Array of possible values of the property that will be iterated over as the animation is played
        /// </value>
        return this._values;
    },
    set_values : function(value) {
        if (this._values != value) {
            this._values = value;
            this.raisePropertyChanged('values');
        }
    }
}
$AA.DiscreteAnimation.registerClass('AjaxControlToolkit.Animation.DiscreteAnimation', $AA.PropertyAnimation);
$AA.registerAnimation('discrete', $AA.DiscreteAnimation);


$AA.InterpolatedAnimation = function(target, duration, fps, property, propertyKey, startValue, endValue) {
    /// <summary>
    /// The <code>InterpolatedAnimation</code> assigns a range of values between <code>startValue</code>
    /// and <code>endValue</code> to the designated property.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="property" type="String" mayBeNull="true" optional="true">
    /// Property of the <code>target</code> element to set when animating.  The default value is 'style'.
    /// </param>
    /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
    /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
    /// </param>
    /// <param name="startValue" type="Number" mayBeNull="true" optional="true">
    /// Start of the range of values
    /// </param>
    /// <param name="endValue" type="Number" mayBeNull="true" optional="true">
    /// End of the range of values
    /// </param>
    /// <animation>Interpolated</animation>
    $AA.InterpolatedAnimation.initializeBase(this, [target, duration, fps, ((property !== undefined) ? property : 'style'), propertyKey]);

    // Start and end values
    this._startValue = startValue;
    this._endValue = endValue;
}
$AA.InterpolatedAnimation.prototype = {
    get_startValue : function() {
        /// <value type="Number">
        /// Start of the range of values
        /// </value>
        return this._startValue;
    },
    set_startValue : function(value) {
        value = this._getFloat(value);
        if (this._startValue != value) {
            this._startValue = value;
            this.raisePropertyChanged('startValue');
        }
    },
    
    get_endValue : function() {
        /// <value type="Number">
        /// End of the range of values
        /// </value>
        return this._endValue;
    },
    set_endValue : function(value) {
        value = this._getFloat(value);
        if (this._endValue != value) {
            this._endValue = value;
            this.raisePropertyChanged('endValue');
        }
    }   
}
$AA.InterpolatedAnimation.registerClass('AjaxControlToolkit.Animation.InterpolatedAnimation', $AA.PropertyAnimation);
$AA.registerAnimation('interpolated', $AA.InterpolatedAnimation);


$AA.ColorAnimation = function(target, duration, fps, property, propertyKey, startValue, endValue) {
    /// <summary>
    /// The <code>ColorAnimation</code> transitions the value of the <code>property</code> between
    /// two colors (although it does ignore the alpha channel). The colors must be 7-character hex strings
    /// (like <code>#246ACF</code>).
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="property" type="String" mayBeNull="true" optional="true">
    /// Property of the <code>target</code> element to set when animating.  The default value is 'style'.
    /// </param>
    /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
    /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
    /// </param>
    /// <param name="startValue" type="String" mayBeNull="true" optional="true">
    /// Start of the range of colors
    /// </param>
    /// <param name="endValue" type="String" mayBeNull="true" optional="true">
    /// End of the range of colors
    /// </param>
    /// <animation>Color</animation>
    $AA.ColorAnimation.initializeBase(this, [target, duration, fps, property, propertyKey, startValue, endValue]);
    
    // Cached start/end RBG triplets
    this._start = null;
    this._end = null;
    
    // Flags indicating whether each dimension of color will be interpolated
    this._interpolateRed = false;
    this._interpolateGreen = false;
    this._interpolateBlue = false;
}
$AA.ColorAnimation.prototype = {
    onStart : function() {
        /// <summary>
        /// Determine which dimensions of color will be animated
        /// </summary>
        /// <returns />
        $AA.ColorAnimation.callBaseMethod(this, 'onStart');
       
        this._start = $AA.ColorAnimation.getRGB(this.get_startValue());
        this._end = $AA.ColorAnimation.getRGB(this.get_endValue());
        
        this._interpolateRed = (this._start.Red != this._end.Red);
        this._interpolateGreen = (this._start.Green != this._end.Green);
        this._interpolateBlue = (this._start.Blue != this._end.Blue);
    },
    
    getAnimatedValue : function(percentage) {
        /// <summary>
        /// Get the interpolated color values
        /// </summary>
        /// <param name="percentage" type="Number">
        /// Percentage of the animation already complete
        /// </param>
        /// <returns type="String">
        /// Current color formatted as a 7-character hex string (like <code>#246ACF</code>).
        /// </returns>

        var r = this._start.Red;
        var g = this._start.Green;
        var b = this._start.Blue;
        
        if (this._interpolateRed)
            r = Math.round(this.interpolate(r, this._end.Red, percentage));
        
        if (this._interpolateGreen)
            g = Math.round(this.interpolate(g, this._end.Green, percentage));
        
        if (this._interpolateBlue)
            b = Math.round(this.interpolate(b, this._end.Blue, percentage));
        
        return $AA.ColorAnimation.toColor(r, g, b);
    },
    
    set_startValue : function(value) {
        /// <value type="String">
        /// Starting color of the transition formatted as a 7-character hex string (like <code>#246ACF</code>).
        /// </value>

        if (this._startValue != value) {
            this._startValue = value;
            this.raisePropertyChanged('startValue');
        }
    },
    
    set_endValue : function(value) {
        /// <value type="String">
        /// Ending color of the transition formatted as a 7-character hex string (like <code>#246ACF</code>).
        /// </value>

        if (this._endValue != value) {
            this._endValue = value;
            this.raisePropertyChanged('endValue');
        }
    }   
}
$AA.ColorAnimation.getRGB = function(color) {
    /// <summary>
    /// Convert the color to an RGB triplet
    /// </summary>
    /// <param name="color" type="String">
    /// Color formatted as a 7-character hex string (like <code>#246ACF</code>)
    /// </param>
    /// <returns type="Object">
    /// Object representing the color with <code>Red</code>, <code>Green</code>, and <code>Blue</code> properties.
    /// </returns>

    if (!color || color.length != 7) {
        throw String.format(AjaxControlToolkit.Resources.Animation_InvalidColor, color);
    }
    return { 'Red': parseInt(color.substr(1,2), 16),
             'Green': parseInt(color.substr(3,2), 16),
             'Blue': parseInt(color.substr(5,2), 16) };
}
$AA.ColorAnimation.toColor = function(red, green, blue) {
    /// <summary>
    /// Convert an RBG triplet into a 7-character hex string (like <code>#246ACF</code>)
    /// </summary>
    /// <param name="red" type="Number" integer="true">
    /// Value of the color's red dimension
    /// </param>
    /// <param name="green" type="Number" integer="true">
    /// Value of the color's green dimension
    /// </param>
    /// <param name="blue" type="Number" integer="true">
    /// Value of the color's blue dimension
    /// </param>
    /// <returns type="String">
    /// Color as a 7-character hex string (like <code>#246ACF</code>)
    /// </returns>

    var r = red.toString(16);
    var g = green.toString(16);
    var b = blue.toString(16);
    if (r.length == 1) r = '0' + r;
    if (g.length == 1) g = '0' + g;
    if (b.length == 1) b = '0' + b;
    return '#' + r + g + b;
}
$AA.ColorAnimation.registerClass('AjaxControlToolkit.Animation.ColorAnimation', $AA.InterpolatedAnimation);
$AA.registerAnimation('color', $AA.ColorAnimation);


$AA.LengthAnimation = function(target, duration, fps, property, propertyKey, startValue, endValue, unit) {
    /// <summary>
    /// The <code>LengthAnimation</code> is identical to <see cref="AjaxControlToolkit.Animation.InterpolatedAnimation" />
    /// except it adds a <code>unit</code> to the value before assigning it to the <code>property</code>.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="property" type="String" mayBeNull="true" optional="true">
    /// Property of the <code>target</code> element to set when animating.  The default value is 'style'.
    /// </param>
    /// <param name="propertyKey" type="String" mayBeNull="true" optional="true">
    /// Optional key of the property to be set (which indicates the value property[propertyKey], like style['backgroundColor']). Note that for the style property, the key must be in a JavaScript friendly format (i.e. backgroundColor instead of background-color).
    /// </param>
    /// <param name="startValue" type="Number" mayBeNull="true" optional="true">
    /// Start of the range of values
    /// </param>
    /// <param name="endValue" type="Number" mayBeNull="true" optional="true">
    /// End of the range of values
    /// </param>
    /// <param name="unit" type="String" mayBeNull="true" optional="true">
    /// Unit of the interpolated values.  The default value is <code>'px'</code>.
    /// </param>
    /// <animation>Length</animation>
    $AA.LengthAnimation.initializeBase(this, [target, duration, fps, property, propertyKey, startValue, endValue]);
    
    // Unit of length (which defaults to px)
    this._unit = (unit != null) ? unit : 'px';
}
$AA.LengthAnimation.prototype = {

    getAnimatedValue : function(percentage) {
        /// <summary>
        /// Get the interpolated length value
        /// </summary>
        /// <param name="percentage" type="Number">
        /// Percentage of the animation already complete
        /// </param>
        /// <returns type="String">
        /// Interpolated length
        /// </returns>

        var value = this.interpolate(this.get_startValue(), this.get_endValue(), percentage);
        return Math.round(value) + this._unit;
    },
    
    get_unit : function() {
        /// <value type="String">
        /// Unit of the interpolated values.  The default value is <code>'px'</code>.
        /// </value>
        return this._unit;
    },
    set_unit : function(value) {
        if (this._unit != value) {
            this._unit = value;
            this.raisePropertyChanged('unit');
        }
    }
}
$AA.LengthAnimation.registerClass('AjaxControlToolkit.Animation.LengthAnimation', $AA.InterpolatedAnimation);
$AA.registerAnimation('length', $AA.LengthAnimation);


$AA.MoveAnimation = function(target, duration, fps, horizontal, vertical, relative, unit) {
    /// <summary>
    /// The <code>MoveAnimation</code> is used to move the <code>target</code> element. If the
    /// <code>relative</code> flag is set to <code>true</code>, then it treats the <code>horizontal</code>
    /// and <code>vertical</code> properties as offsets to move the element. If the <code>relative</code>
    /// flag is <code>false</code>, then it will treat the <code>horizontal</code> and <code>vertical</code>
    /// properties as coordinates on the page where the <code>target</code> element should be moved. It is
    /// important to note that the <code>target</code> must be positioned (i.e. <code>absolutely</code>) so
    /// that settings its <code>top</code>/<code>left<code> style attributes will change its location.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="horizontal" type="Number" mayBeNull="true" optional="true">
    /// If <code>relative</code>  is <code>true</code>, this is the offset to move horizontally. Otherwise this is the x
    /// coordinate on the page where the <code>target</code> should be moved.
    /// </param>
    /// <param name="vertical" type="Number" mayBeNull="true" optional="true">
    /// If <code>relative</code> is <code>true</code>, this is the offset to move vertically. Otherwise this is the y
    /// coordinate on the page where the <code>target</code> should be moved.
    /// </param>
    /// <param name="relative" type="Boolean" mayBeNull="true" optional="true">
    /// <code>true</code> if we are moving relative to the current position, <code>false</code> if we are moving absolutely
    /// </param>
    /// <param name="unit" type="String" mayBeNull="true" optional="true">
    /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
    /// </param>
    /// <animation>Move</animation>
    $AA.MoveAnimation.initializeBase(this, [target, duration, fps, null]);

    // Distance to move horizontally and vertically
    this._horizontal = horizontal ? horizontal : 0;
    this._vertical = vertical ? vertical : 0;
    this._relative = (relative === undefined) ? true : relative;
    
    // Length animations representing the movememnts
    this._horizontalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'left', null, null, unit);
    this._verticalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'top', null, null, unit);
    this.add(this._verticalAnimation);
    this.add(this._horizontalAnimation);
}
$AA.MoveAnimation.prototype = {
    
    onStart : function() {
        /// <summary>
        /// Use the <code>target</code>'s current position as the starting point for the animation
        /// </summary>
        /// <returns />
        $AA.MoveAnimation.callBaseMethod(this, 'onStart');
        
        // Set the start and end values of the animations by getting
        // the element's current position and applying the offsets
        var element = this.get_target();
        this._horizontalAnimation.set_startValue(element.offsetLeft);
        this._horizontalAnimation.set_endValue(this._relative ? element.offsetLeft + this._horizontal : this._horizontal);
        this._verticalAnimation.set_startValue(element.offsetTop); 
        this._verticalAnimation.set_endValue(this._relative ? element.offsetTop + this._vertical : this._vertical);
    },
    
    get_horizontal : function() {
        /// <value type="Number">
        /// If <code>relative</code>  is <code>true</code>, this is the offset to move horizontally. Otherwise this is the x
        /// coordinate on the page where the <code>target</code> should be moved.
        /// </value>
        return this._horizontal;
    },
    set_horizontal : function(value) {
        value = this._getFloat(value);
        if (this._horizontal != value) {
            this._horizontal = value;
            this.raisePropertyChanged('horizontal');
        }
    },
    
    get_vertical : function() {
        /// <value type="Number">
        /// If <code>relative</code> is <code>true</code>, this is the offset to move vertically. Otherwise this is the y
        /// coordinate on the page where the <code>target</code> should be moved.
        /// </value>
        return this._vertical;
    },
    set_vertical : function(value) {
        value = this._getFloat(value);
        if (this._vertical != value) {
            this._vertical = value;
            this.raisePropertyChanged('vertical');
        }
    },
    
    get_relative : function() {
        /// <value type="Boolean">
        /// <code>true</code> if we are moving relative to the current position, <code>false</code> if we are moving absolutely
        /// </value>
        return this._relative;
    },
    set_relative : function(value) {
        value = this._getBoolean(value);
        if (this._relative != value) {
            this._relative = value;
            this.raisePropertyChanged('relative');
        }
    },
    
    get_unit : function() {
        /// <value type="String" mayBeNull="true">
        /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
        /// </value>
        this._horizontalAnimation.get_unit();
    },
    set_unit : function(value) {
        var unit = this._horizontalAnimation.get_unit();
        if (unit != value) {
            this._horizontalAnimation.set_unit(value);
            this._verticalAnimation.set_unit(value);
            this.raisePropertyChanged('unit');
        }
    }
}
$AA.MoveAnimation.registerClass('AjaxControlToolkit.Animation.MoveAnimation', $AA.ParallelAnimation);
$AA.registerAnimation('move', $AA.MoveAnimation);


$AA.ResizeAnimation = function(target, duration, fps, width, height, unit) {
    /// <summary>
    /// The <code>ResizeAnimation</code> changes the size of the <code>target</code> from its
    /// current value to the specified <code>width</code> and <code>height</code>.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="width" type="Number" mayBeNull="true" optional="true">
    /// New width of the <code>target</code>
    /// </param>
    /// <param name="height" type="Number" mayBeNull="true" optional="true">
    /// New height of the <code>target</code>
    /// </param>
    /// <param name="unit" type="String" mayBeNull="true" optional="true">
    /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
    /// </param>
    /// <animation>Resize</animation>
    $AA.ResizeAnimation.initializeBase(this, [target, duration, fps, null]);

    // New size of the element
    this._width = width;
    this._height = height;
    
    // Animations to set the size across both dimensions
    this._horizontalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'width', null, null, unit);
    this._verticalAnimation = new $AA.LengthAnimation(target, duration, fps, 'style', 'height', null, null, unit);
    this.add(this._horizontalAnimation);
    this.add(this._verticalAnimation);
}
$AA.ResizeAnimation.prototype = {
    
    onStart : function() {
        /// <summary>
        /// Use the <code>target</code>'s current size as the starting point for the animation
        /// </summary>
        /// <returns />

        $AA.ResizeAnimation.callBaseMethod(this, 'onStart');
        
        // Set the start and end values of the animations by getting
        // the element's current width and height
        var element = this.get_target();
        this._horizontalAnimation.set_startValue(element.offsetWidth);
        this._verticalAnimation.set_startValue(element.offsetHeight);
        this._horizontalAnimation.set_endValue((this._width !== null && this._width !== undefined) ?
            this._width : element.offsetWidth);
        this._verticalAnimation.set_endValue((this._height !== null && this._height !== undefined) ?
            this._height : element.offsetHeight);
    },
    
    get_width : function() {
        /// <value type="Number">
        /// New width of the <code>target</code>
        /// </value>

        return this._width;
    },
    set_width : function(value) {
        value = this._getFloat(value);
        if (this._width != value) {
            this._width = value;
            this.raisePropertyChanged('width');
        }
    },
    
    get_height : function() {
        /// <value type="Number">
        /// New height of the <code>target</code>
        /// </value>

        return this._height;
    },
    set_height : function(value) {
        value = this._getFloat(value);
        if (this._height != value) {
            this._height = value;   
            this.raisePropertyChanged('height');
        }
    },
    
    get_unit : function() {
        /// <value type="String">
        /// Length unit for the size of the <code>target</code>. The default value is <code>'px'</code>.
        /// </value>

        this._horizontalAnimation.get_unit();
    },
    set_unit : function(value) {
        var unit = this._horizontalAnimation.get_unit();
        if (unit != value) {
            this._horizontalAnimation.set_unit(value);
            this._verticalAnimation.set_unit(value);
            this.raisePropertyChanged('unit');
        }
    }
}
$AA.ResizeAnimation.registerClass('AjaxControlToolkit.Animation.ResizeAnimation', $AA.ParallelAnimation);
$AA.registerAnimation('resize', $AA.ResizeAnimation);









$AA.ScaleAnimation = function(target, duration, fps, scaleFactor, unit, center, scaleFont, fontUnit) {
    /// <summary>
    /// The <code>ScaleAnimation</code> scales the size of the <code>target</code> element by the given <code>scaleFactor</code>
    /// (i.e. a <code>scaleFactor</code> of <code>.5</code> will shrink it in half and a <code>scaleFactor</code> of <code>2.0</code>
    /// will double it).  If <code>scaleFont</code> is <code>true</code>, the size of the font will also scale with the element.  If
    /// <code>center</code> is <code>true</code>, then the element's center will not move as it is scaled.  It is important to note that
    /// the target must be positioned (i.e. absolutely) so that setting its <code>top</code>/<code>left</code> properties will change
    /// its location in order for <code>center</code> to have an effect.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 1.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="scaleFactor" type="Number" mayBeNull="true" optional="true">
    /// The amount to scale the <code>target</code> (a <code>scaleFactor</code> of <code>.5</code> will
    /// shrink it in half and a <code>scaleFactor</code> of <code>2.0</code> will double it). The default value is
    /// <code>1</code>, which does no scaling.
    /// </param>
    /// <param name="unit" type="String" mayBeNull="true" optional="true">
    /// Length unit for the size of the <code>target</code>.  The default value is <code>'px'</code>.
    /// </param>
    /// <param name="center" type="Boolean" mayBeNull="true" optional="true">
    /// Whether the <code>target</code> should stay centered while scaling
    /// </param>
    /// <param name="scaleFont" type="Boolean" mayBeNull="true" optional="true">
    /// Whether the font should be scaled along with the size
    /// </param>
    /// <param name="fontUnit" type="String" mayBeNull="true" optional="true">
    /// Unit of the font, which is only used if <code>scaleFont</code> is <code>true</code>.
    /// The default value is <code>'pt'</code>.
    /// </param>
    /// <animation>Scale</animation>
    $AA.ScaleAnimation.initializeBase(this, [target, duration, fps]);

    // Percentage to scale
    this._scaleFactor = (scaleFactor !== undefined) ? scaleFactor : 1;
    this._unit = (unit !== undefined) ? unit : 'px';
    
    // Center the content while scaling
    this._center = center;
    
    // Scale the font size as well
    this._scaleFont = scaleFont;
    this._fontUnit = (fontUnit !== undefined) ? fontUnit : 'pt';
    
    // Initial values
    this._element = null;
    this._initialHeight = null;
    this._initialWidth = null;
    this._initialTop = null;
    this._initialLeft = null;
    this._initialFontSize = null;
}
$AA.ScaleAnimation.prototype = {    
    getAnimatedValue : function(percentage) {
        /// <summary>
        /// Get the amount to scale the <code>target</code>
        /// </summary>
        /// <param name="percentage" type="Number">
        /// Percentage of the animation already complete
        /// </param>
        /// <returns type="Number">
        /// Percentage to scale the <code>target</code>
        /// </returns>
        return this.interpolate(1.0, this._scaleFactor, percentage);
    },
    
    onStart : function() {
        /// <summary>
        /// Cache the initial size because it will be used to determine how much to scale the element at each step of the animation
        /// </summary>
        /// <returns />
        $AA.ScaleAnimation.callBaseMethod(this, 'onStart');
        
        this._element = this.get_target();
        if (this._element) {
            this._initialHeight = this._element.offsetHeight;
            this._initialWidth = this._element.offsetWidth;
            if (this._center) {
                this._initialTop = this._element.offsetTop;
                this._initialLeft = this._element.offsetLeft;
            }
            if (this._scaleFont) {
                // Note: we're assuming this is in the same units as fontUnit
                this._initialFontSize = parseFloat(
                    $common.getCurrentStyle(this._element, 'fontSize'));
            }
        }
    },
    
    setValue : function(scale) {
        /// <summary>
        /// Scale the <code>target</code> by the given percentage
        /// </summary>
        /// <param name="scale" type="Number">
        /// Percentage to scale the <code>target</code>
        /// </param>
        /// <returns />

        if (this._element) {
            var width = Math.round(this._initialWidth * scale);
            var height = Math.round(this._initialHeight * scale);
            this._element.style.width = width + this._unit; 
            this._element.style.height = height + this._unit;
            
            if (this._center) {
                this._element.style.top = (this._initialTop +
                    Math.round((this._initialHeight - height) / 2)) + this._unit;
                this._element.style.left = (this._initialLeft +
                    Math.round((this._initialWidth - width) / 2)) + this._unit;
            }
            
            if (this._scaleFont) {
                var size = this._initialFontSize * scale;
                if (this._fontUnit == 'px' || this._fontUnit == 'pt') {
                    size = Math.round(size);
                }
                this._element.style.fontSize = size + this._fontUnit;
            }
        }
    },
    
    onEnd : function() {
        /// <summary>
        /// Wipe the cached values after the animation completes
        /// </summary>
        /// <returns />

        this._element = null;
        this._initialHeight = null;
        this._initialWidth = null;
        this._initialTop = null;
        this._initialLeft = null;
        this._initialFontSize = null;
        $AA.ScaleAnimation.callBaseMethod(this, 'onEnd');
    },
    
    get_scaleFactor : function() {
        /// <value type="Number">
        /// The amount to scale the <code>target</code> (a <code>scaleFactor</code> of <code>.5</code> will
        /// shrink it in half and a <code>scaleFactor</code> of <code>2.0</code> will double it). The default value is
        /// <code>1</code>, which does no scaling.
        /// </value>

        return this._scaleFactor;
    },
    set_scaleFactor : function(value) {
        value = this._getFloat(value);
        if (this._scaleFactor != value) {
            this._scaleFactor = value;
            this.raisePropertyChanged('scaleFactor');
        }
    },
    
    get_unit : function() {
        /// <value type="String">
        /// Length unit for the size of the <code>target</code>.  The default value is <code>'px'</code>.
        /// </value>
        return this._unit;
    },
    set_unit : function(value) {
        if (this._unit != value) {
            this._unit = value;
            this.raisePropertyChanged('unit');
        }
    },
    
    get_center : function() {
        /// <value type="Boolean">
        /// Whether the <code>target</code> should stay centered while scaling
        /// </value>
        return this._center;
    },
    set_center : function(value) {
        value = this._getBoolean(value);
        if (this._center != value) {
            this._center = value;
            this.raisePropertyChanged('center');
        }
    },
    
    get_scaleFont : function() {
        /// <value type="Boolean">
        /// Whether the font should be scaled along with the size
        /// </value>
        return this._scaleFont;
    },
    set_scaleFont : function(value) {
        value = this._getBoolean(value);
        if (this._scaleFont != value) {
            this._scaleFont = value;
            this.raisePropertyChanged('scaleFont');
        }
    },
    
    get_fontUnit : function() {
        /// <value type="String">
        /// Unit of the font, which is only used if <code>scaleFont</code> is <code>true</code>.
        /// The default value is <code>'pt'</code>.
        /// </value>
        return this._fontUnit;
    },
    set_fontUnit : function(value) {
        if (this._fontUnit != value) { 
            this._fontUnit = value; 
            this.raisePropertyChanged('fontUnit');
        }
    }
}
$AA.ScaleAnimation.registerClass('AjaxControlToolkit.Animation.ScaleAnimation', $AA.Animation);
$AA.registerAnimation('scale', $AA.ScaleAnimation);


$AA.Action = function(target, duration, fps) {
    /// <summary>
    /// <code>Action</code> is a base class for all "non-animating" animations that provides empty implementations
    /// for abstract methods and adds a <code>doAction</code> method that will be called to perform the action's
    /// operation.  While regular animations perform an operation in a sequence of small steps spread over an interval,
    /// the actions perform a single operation instantaneously.  By default, all actions have a <code>duration</code>
    /// of zero.  The actions are very useful for defining complex animations.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 0.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <animation>Action</animation>
    $AA.Action.initializeBase(this, [target, duration, fps]);

    // Set the duration to 0 if it wasn't specified
    if (duration === undefined) {
        this.set_duration(0);
    }
}
$AA.Action.prototype = {
    
    onEnd : function() {
        /// <summary>
        /// Call the <code>doAction</code> method when the animation completes
        /// </summary>
        /// <returns />
        this.doAction();
        $AA.Action.callBaseMethod(this, 'onEnd');
    },
    
    doAction : function() {
        /// <summary>
        /// The <code>doAction</code> method must be implemented by all actions
        /// </summary>
        /// <returns />
        throw Error.notImplemented();
    },
    
    getAnimatedValue : function() {
        /// <summary>
        /// Empty implementation of required abstract method
        /// </summary>
    },
    setValue : function() {
        /// <summary>
        /// Empty implementation of required abstract method
        /// </summary>
    }
}
$AA.Action.registerClass('AjaxControlToolkit.Animation.Action', $AA.Animation);
$AA.registerAnimation('action', $AA.Action);


$AA.EnableAction = function(target, duration, fps, enabled) {
    /// <summary>
    /// The <code>EnableAction</code> changes whether or not the <code>target</code> is disabled.
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 0.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="enabled" type="Boolean" mayBeNull="true" optional="true">
    /// Whether or not the <code>target</code> is disabled. The default value is <code>true</code>.
    /// </param>
    /// <animation>EnableAction</animation>
    $AA.EnableAction.initializeBase(this, [target, duration, fps]);

    // Whether to enable or disable
    this._enabled = (enabled !== undefined) ? enabled : true;
}
$AA.EnableAction.prototype = {
    doAction : function() {
    	/// <summary>
        /// Set the enabled property of the <code>target</code>
    	/// </summary>
    	/// <returns />
    	
        var element = this.get_target();
        if (element) {
            element.disabled = !this._enabled;
        }
    },
    
    get_enabled : function() {
        /// <value type="Boolean">
        /// Whether or not the <code>target</code> is disabled. The default value is <code>true</code>.
        /// </value>
        return this._enabled;
    },
    set_enabled : function(value) {
        value = this._getBoolean(value);
        if (this._enabled != value) {
            this._enabled = value;
            this.raisePropertyChanged('enabled');
        }
    }
}
$AA.EnableAction.registerClass('AjaxControlToolkit.Animation.EnableAction', $AA.Action);
$AA.registerAnimation('enableAction', $AA.EnableAction);


$AA.HideAction = function(target, duration, fps, visible) {
    /// <summary>
    /// The <code>HideAction</code> simply hides the <code>target</code> from view
    /// (by setting its style's <code>display</code> attribute to <code>'none'</code>)
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 0.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="visible" type="Boolean" mayBeNull="False">
    /// True to show the target, false to hide it.  The default value is false.
    /// </param>
    /// <animation>HideAction</animation>
    $AA.HideAction.initializeBase(this, [target, duration, fps]);

    this._visible = visible;
}
$AA.HideAction.prototype = {
    doAction : function() {
        /// <summary>
        /// Hide the <code>target</code>
        /// </summary>
        /// <returns />
        var element = this.get_target();
        if (element) {
            $common.setVisible(element, this._visible);
        }
    },
    
    get_visible : function() {
        /// <value type="Boolean" mayBeNull="False">
        /// True to show the target, false to hide it.  The default value is false.
        /// </value>
        return this._visible;
    },
    set_visible : function(value) {
        if (this._visible != value) {
            this._visible = value;
            this.raisePropertyChanged('visible');
        }
    }
}
$AA.HideAction.registerClass('AjaxControlToolkit.Animation.HideAction', $AA.Action);
$AA.registerAnimation('hideAction', $AA.HideAction);


$AA.StyleAction = function(target, duration, fps, attribute, value) {
    /// <summary>
    /// The <code>StyleAction<code> is used to set a particular <code>attribute</code> of the <code>target</code>'s style
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 0.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="attribute" type="String" mayBeNull="true" optional="true">
    /// Style attribute to set (this must be in a JavaScript friendly format, i.e. <code>backgroundColor</code>
    /// instead of <code>background-color</code>)
    /// </param>
    /// <param name="value" type="String" mayBeNull="true" optional="true">
    /// Value to set the <code>attribute</code>
    /// </param>
    /// <animation>StyleAction</animation>
    $AA.StyleAction.initializeBase(this, [target, duration, fps]);

    // Style attribute (like "backgroundColor" or "borderWidth"
    this._attribute = attribute;
    
    // Value to assign to the style attribute
    this._value = value;
    
}
$AA.StyleAction.prototype = {
    doAction : function() {
    	/// <summary>
        /// Assign the <code>value</code> to the style's <code>attribute</code>
    	/// </summary>
    	/// <returns />
        var element = this.get_target();
        if (element) {
            element.style[this._attribute] = this._value;
        }
    },
    
    get_attribute : function() {
        /// <value type="String">
        /// Style attribute to set (this must be in a JavaScript friendly format, i.e. <code>backgroundColor</code>
        /// instead of <code>background-color</code>)
        /// </value>
        return this._attribute;
    },
    set_attribute : function(value) {
        if (this._attribute != value) {
            this._attribute = value;
            this.raisePropertyChanged('attribute');
        }
    },
    
    get_value : function() {
        /// <value type="String">
        /// Value to set the <code>attribute</code>
        /// </value>
        return this._value;
    },
    set_value : function(value) {
        if (this._value != value) {
            this._value = value;
            this.raisePropertyChanged('value');
        }
    }
}
$AA.StyleAction.registerClass('AjaxControlToolkit.Animation.StyleAction', $AA.Action);
$AA.registerAnimation('styleAction', $AA.StyleAction);


$AA.OpacityAction = function(target, duration, fps, opacity) {
    /// <summary>
    /// <code>OpacityAction</code> allows you to set the <code>opacity</code> of the <code>target</code>
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 0.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="opacity" type="Number" mayBeNull="true" optional="true">
    /// Opacity to set the <code>target</code>
    /// </param>
    /// <animation>OpacityAction</animation>
    $AA.OpacityAction.initializeBase(this, [target, duration, fps]);
    
    // Opacity
    this._opacity = opacity;
}
$AA.OpacityAction.prototype = {
    doAction : function() {
    	/// <summary>
        /// Set the opacity
    	/// </summary>
    	/// <returns />
        var element = this.get_target();
        if (element) {
            $common.setElementOpacity(element, this._opacity);
        }
    },
    
    get_opacity : function() {
        /// <value type="Number">
        /// Opacity to set the <code>target</code>
        /// </value>
        return this._opacity;
    },
    set_opacity : function(value) {
        value = this._getFloat(value);
        if (this._opacity != value) {
            this._opacity = value;
            this.raisePropertyChanged('opacity');
        }
    }
}
$AA.OpacityAction.registerClass('AjaxControlToolkit.Animation.OpacityAction', $AA.Action);
$AA.registerAnimation('opacityAction', $AA.OpacityAction);


$AA.ScriptAction = function(target, duration, fps, script) {
    /// <summary>
    /// The <code>ScriptAction</code> is used to execute arbitrary JavaScript
    /// </summary>
    /// <param name="target" type="Sys.UI.DomElement" mayBeNull="true" optional="true" domElement="true">
    /// Target of the animation
    /// </param>
    /// <param name="duration" type="Number" mayBeNull="true" optional="true">
    /// Length of the animation in seconds.  The default is 0.
    /// </param>
    /// <param name="fps" type="Number" mayBeNull="true" optional="true" integer="true">
    /// Number of steps per second.  The default is 25.
    /// </param>
    /// <param name="script" type="String" mayBeNull="true" optional="true">
    /// JavaScript to execute
    /// </param>
    /// <animation>ScriptAction</animation>
    $AA.ScriptAction.initializeBase(this, [target, duration, fps]);

    // Script to execute
    this._script = script;
}
$AA.ScriptAction.prototype = {
    doAction : function() {
    	/// <summary>
        /// Execute the script
    	/// </summary>
    	/// <returns />
        try {
            eval(this._script);
        } catch (ex) {
        }
    },
    
    get_script : function() {
        /// <value type="String">
        /// JavaScript to execute
        /// </value>
        return this._script;
    },
    set_script : function(value) {
        if (this._script != value) {
            this._script = value;
            this.raisePropertyChanged('script');
        }
    }
}
$AA.ScriptAction.registerClass('AjaxControlToolkit.Animation.ScriptAction', $AA.Action);
$AA.registerAnimation('scriptAction', $AA.ScriptAction);

//END AjaxControlToolkit.Animation.Animations.js
//START AjaxControlToolkit.Animation.AnimationBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Animation/Animations.js" />


Type.registerNamespace('AjaxControlToolkit.Animation');

AjaxControlToolkit.Animation.AnimationBehavior = function(element) {
    /// <summary>
    /// The AnimationBehavior allows us to associate animations (described by JSON) with events and
    /// have them play when the events are fired.  It relies heavily on the AJAX Control Toolkit
    /// animation framework provided in Animation.js, and the GenericAnimationBehavior defined below.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.Animation.AnimationBehavior.initializeBase(this, [element]);
    
    // Generic animation behaviors that automatically build animations from JSON descriptions
    this._onLoad = null;
    this._onClick = null;
    this._onMouseOver = null;
    this._onMouseOut = null;
    this._onHoverOver = null;
    this._onHoverOut = null;
    
    // Handlers for the events
    this._onClickHandler = null;
    this._onMouseOverHandler = null;
    this._onMouseOutHandler = null;
}
AjaxControlToolkit.Animation.AnimationBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Setup the animations/handlers
        /// </summary>
        /// <returns />
        AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'initialize');
        
        // Wireup the event handlers
        var element = this.get_element();
        if (element) {
            this._onClickHandler = Function.createDelegate(this, this.OnClick);
            $addHandler(element, 'click', this._onClickHandler);
            this._onMouseOverHandler = Function.createDelegate(this, this.OnMouseOver);
            $addHandler(element, 'mouseover', this._onMouseOverHandler);
            this._onMouseOutHandler = Function.createDelegate(this, this.OnMouseOut);
            $addHandler(element, 'mouseout', this._onMouseOutHandler);
        }
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose of the animations/handlers
        /// </summary>
        /// <returns />
        
        // Remove the event handlers
        var element = this.get_element();
        if (element) {
            if (this._onClickHandler) {
                $removeHandler(element, 'click', this._onClickHandler);
                this._onClickHandler = null;
            }
            if (this._onMouseOverHandler) {
                $removeHandler(element, 'mouseover', this._onMouseOverHandler);
                this._onMouseOverHandler = null;
            }
            if (this._onMouseOutHandler) {
                $removeHandler(element, 'mouseout', this._onMouseOutHandler);
                this._onMouseOutHandler = null;
            }
        }
        
        // Wipe the behaviors (we don't need to dispose them because
        // that will happen automatically in our base dispose)
        this._onLoad = null;
        this._onClick = null;
        this._onMouseOver = null;
        this._onMouseOut = null;
        this._onHoverOver = null;
        this._onHoverOut = null;
        
        AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'dispose');
    },
    
    
    
    get_OnLoad : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnLoad Animation's JSON definition
        /// </value>
        /// <remarks>
        /// Setting the OnLoad property will cause it to be played immediately
        /// </remarks>
        return this._onLoad ? this._onLoad.get_json() : null;
    },
    set_OnLoad : function(value) {
        if (!this._onLoad) {
            this._onLoad = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onLoad.initialize();
        }
        this._onLoad.set_json(value);
        this.raisePropertyChanged('OnLoad');
        this._onLoad.play();
    },
    
    get_OnLoadBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnLoad Animation's behavior
        /// </value>
        return this._onLoad;
    },
    
    
    
    get_OnClick : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnClick Animation's JSON definition
        /// </value>
        return this._onClick ? this._onClick.get_json() : null;
    },
    set_OnClick : function(value) {
        if (!this._onClick) {
            this._onClick = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onClick.initialize();
        }
        this._onClick.set_json(value);
        this.raisePropertyChanged('OnClick');
    },
    
    get_OnClickBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnClick Animation's behavior
        /// </value>
        return this._onClick;
    },
    
    OnClick : function() {
        /// <summary>
        /// Play the OnClick animation
        /// </summary>
        /// <returns />
        if (this._onClick) {
            this._onClick.play();
        }
    },
    
    
    
    get_OnMouseOver : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnMouseOver Animation's JSON definition
        /// </value>
        return this._onMouseOver ? this._onMouseOver.get_json() : null;
    },
    set_OnMouseOver : function(value) {
        if (!this._onMouseOver) {
            this._onMouseOver = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onMouseOver.initialize();
        }
        this._onMouseOver.set_json(value);
        this.raisePropertyChanged('OnMouseOver');
    },
    
    get_OnMouseOverBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnMouseOver Animation's behavior
        /// </value>
        return this._onMouseOver;
    },
    
    OnMouseOver : function() {
        /// <summary>
        /// Play the OnMouseOver/OnHoverOver animations
        /// </summary>
        /// <returns />
        if (this._onMouseOver) {
            this._onMouseOver.play();
        }
        if (this._onHoverOver) {
            if (this._onHoverOut) {
                this._onHoverOut.quit();
            }
            this._onHoverOver.play();
        }
    },
    
    
    
    get_OnMouseOut : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnMouseOut Animation's JSON definition
        /// </value>
        return this._onMouseOut ? this._onMouseOut.get_json() : null;
    },
    set_OnMouseOut : function(value) {
        if (!this._onMouseOut) {
            this._onMouseOut = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onMouseOut.initialize();
        }
        this._onMouseOut.set_json(value);
        this.raisePropertyChanged('OnMouseOut');
    },
    
    get_OnMouseOutBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnMouseOut Animation's behavior
        /// </value>
        return this._onMouseOut;
    },
    
    OnMouseOut : function() {
        /// <summary>
        /// Play the OnMouseOver/OnHoverOver animations
        /// </summary>
        /// <returns />
        if (this._onMouseOut) {
            this._onMouseOut.play();
        }
        if (this._onHoverOut) {
            if (this._onHoverOver) {
                this._onHoverOver.quit();
            }
            this._onHoverOut.play();
        }
    },
    
    
    
    get_OnHoverOver : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnHoverOver Animation's JSON definition
        /// </value>
        return this._onHoverOver ? this._onHoverOver.get_json() : null;
    },
    set_OnHoverOver : function(value) {
        if (!this._onHoverOver) {
            this._onHoverOver = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onHoverOver.initialize();
        }
        this._onHoverOver.set_json(value);
        this.raisePropertyChanged('OnHoverOver');
    },
    
    get_OnHoverOverBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnHoverOver Animation's behavior
        /// </value>
        return this._onHoverOver;
    },
    
    
    
    get_OnHoverOut : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnHoverOut Animation's JSON definition
        /// </value>
        return this._onHoverOut ? this._onHoverOut.get_json() : null;
    },
    set_OnHoverOut : function(value) {
        if (!this._onHoverOut) {
            this._onHoverOut = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onHoverOut.initialize();
        }
        this._onHoverOut.set_json(value);
        this.raisePropertyChanged('OnHoverOut');
    },
    
    get_OnHoverOutBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnHoverOut Animation's behavior
        /// </value>
        return this._onHoverOut;
    }
}
AjaxControlToolkit.Animation.AnimationBehavior.registerClass('AjaxControlToolkit.Animation.AnimationBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        /// <summary>
//        /// Create a type descriptor
//        /// </summary>
//        /// <returns type="???">Type descriptor</returns>
//    
//        var descriptor = AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'getDescriptor');
//        descriptor.addProperty('OnLoad', String); 
//        descriptor.addProperty('OnClick', String); 
//        descriptor.addProperty('OnMouseOver', String); 
//        descriptor.addProperty('OnMouseOut', String); 
//        descriptor.addProperty('OnHoverOver', String); 
//        descriptor.addProperty('OnHoverOut', String); 
//        return descriptor;
//    },


AjaxControlToolkit.Animation.GenericAnimationBehavior = function(element) {
    /// <summary>
    /// The GenericAnimationBehavior handles the creation, playing, and disposing of animations
    /// created from a JSON description.  As we intend to expose a lot of generic animations
    /// across the Toolkit, this behavior serves to simplify the amount of work required.
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.Animation.GenericAnimationBehavior.initializeBase(this, [element]);
    
    // JSON description of the animation that will be used to create it
    this._json = null;
    
    // Animation created from the JSON description that will be played
    this._animation = null;
}
AjaxControlToolkit.Animation.GenericAnimationBehavior.prototype = {
    dispose : function() {
        /// <summary>
        /// Dispose the behavior and its animation
        /// </summary>
        /// <returns />
        this.disposeAnimation();
        AjaxControlToolkit.Animation.GenericAnimationBehavior.callBaseMethod(this, 'dispose');
    },
    
    disposeAnimation : function() {
        /// <summary>
        /// Dispose the animation
        /// </summary>
        /// <returns />
        if (this._animation) {
            this._animation.dispose();
        }
        this._animation = null;
    },
    
    play : function() {
        /// <summary>
        /// Play the animation if it isn't already playing.  If it's already playing, this does nothing.
        /// </summary>
        /// <returns />
        if (this._animation && !this._animation.get_isPlaying()) {
            this.stop();
            this._animation.play();
        }
    },
    
    stop : function() {
        /// <summary>
        /// Stop the animation if it's already playing
        /// </summary>
        /// <returns />
        if (this._animation) {
            if (this._animation.get_isPlaying()) {
                this._animation.stop(true);
            }
        }
    },
    
    quit : function() {
        /// <summary>
        /// Quit playing the animation without updating the final state (i.e. if
        /// the animation was moving, this would leave it in the middle of its path).
        /// </summary>
        /// <returns />
        /// <remarks>
        /// This differs from the stop function which will update the final state.  The
        /// quit function is most useful for scenarios where you're toggling back and forth
        /// between two animations (like those used in OnHoverOver/OnHoverOut) and you don't
        /// want to completely finish one animation if its counterpart is triggered.
        /// </remarks>
        if (this._animation) {
            if (this._animation.get_isPlaying()) {
                this._animation.stop(false);
            }
        }
    },
    
    get_json : function() {
        /// <value type="String" mayBeNull="true">
        /// JSON animation description
        /// </value>
        return this._json;
    },
    set_json : function(value) {
        // Only wipe and rebuild if they're changing the value
        if (this._json != value) {
            this._json = value;
            this.raisePropertyChanged('json');
            
            // Build the new animation
            this.disposeAnimation();
            var element = this.get_element();
            if (element) {
                this._animation = AjaxControlToolkit.Animation.buildAnimation(this._json, element);
                if (this._animation) {
                    this._animation.initialize();
                }
                this.raisePropertyChanged('animation');
            }
        }
    },
    
    get_animation : function() {
        /// <value type="AjaxControlToolkit.Animation.Animation">
        /// Animation created from the JSON description
        /// </value>
        return this._animation;
    }
}
AjaxControlToolkit.Animation.GenericAnimationBehavior.registerClass('AjaxControlToolkit.Animation.GenericAnimationBehavior', AjaxControlToolkit.BehaviorBase);
//    getDescriptor : function() {
//        /// <summary>
//        /// Get a type descriptor
//        /// </summary>
//        /// <returns type="???>Type descriptor</returns>
//        
//        var descriptor = AjaxControlToolkit.Animation.AnimationBehavior.callBaseMethod(this, 'getDescriptor');
//        descriptor.addProperty('json', String); 
//        descriptor.addProperty('animation', Object, true); 
//        return descriptor;
//    },

//END AjaxControlToolkit.Animation.AnimationBehavior.js
//START AjaxControlToolkit.PopupExtender.PopupBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Animation/Animations.js" />
/// <reference path="../Animation/AnimationBehavior.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.PopupBehavior = function(element) {
    /// <summary>
    /// The PopupBehavior is used to show/hide an element at a position
    /// relative to another element
    /// </summary>
    /// <param name="element" type="Sys.UI.DomElement" mayBeNull="false" domElement="true">
    /// The DOM element the behavior is associated with
    /// </param>
    AjaxControlToolkit.PopupBehavior.initializeBase(this, [element]);

    this._x = 0;
    this._y = 0;
    this._positioningMode = AjaxControlToolkit.PositioningMode.Absolute;
    this._parentElement = null;
    this._parentElementID = null;
    this._moveHandler = null;
    this._firstPopup = true;    
    this._originalParent = null;
    this._visible = false;
    
    // Generic animation behaviors that automatically build animations
    // from JSON descriptions
    this._onShow = null;
    this._onShowEndedHandler = null;
    this._onHide = null;
    this._onHideEndedHandler = null;
}
AjaxControlToolkit.PopupBehavior.prototype = {
    initialize : function() {
        /// <summary>
        /// Initialize the PopupBehavior
        /// </summary>
        AjaxControlToolkit.PopupBehavior.callBaseMethod(this, 'initialize');
        
        this._hidePopup();
        this.get_element().style.position = "absolute";
        
        // Create handlers for the animation ended events
        this._onShowEndedHandler = Function.createDelegate(this, this._onShowEnded);
        this._onHideEndedHandler = Function.createDelegate(this, this._onHideEnded);
    },
    
    dispose : function() {
        /// <summary>
        /// Dispose the PopupBehavior
        /// </summary>
    
        var element = this.get_element();
        if (element) {
            if (this._visible) {
                this.hide();
            }
            if (this._originalParent) {
                element.parentNode.removeChild(element);
                this._originalParent.appendChild(element);
                this._originalParent = null;
            }
            
            // Remove expando properties
            element._hideWindowedElementsIFrame = null;
        }
        this._parentElement = null;

        // Remove the animation ended events and wipe the animations
        // (we don't need to dispose them because that will happen
        // automatically in our base dispose)
        if (this._onShow && this._onShow.get_animation() && this._onShowEndedHandler) {
            this._onShow.get_animation().remove_ended(this._onShowEndedHandler);
        }
        this._onShowEndedHandler = null;
        this._onShow = null;
        if (this._onHide && this._onHide.get_animation() && this._onHideEndedHandler) {
            this._onHide.get_animation().remove_ended(this._onHideEndedHandler);
        }
        this._onHideEndedHandler = null;
        this._onHide = null;
        
        AjaxControlToolkit.PopupBehavior.callBaseMethod(this, 'dispose');
    },
    
    show : function() {
        /// <summary>
        /// Show the popup
        /// </summary>
        
        // Ignore requests to hide multiple times
        if (this._visible) {
            return;
        }
        
        var eventArgs = new Sys.CancelEventArgs();
        this.raiseShowing(eventArgs);
        if (eventArgs.get_cancel()) {
            return;
        }
        
        // Either show the popup or play an animation that does
        // (note: even if we're animating, we still show and position
        // the popup before hiding it again and playing the animation
        // which makes the animation much simpler)
        this._visible = true;
        var element = this.get_element();
        $common.setVisible(element, true);
        this.setupPopup();
        if (this._onShow) {
            $common.setVisible(element, false);
            this.onShow();
        } else {
            this.raiseShown(Sys.EventArgs.Empty);
        }
    },
    
    hide : function() {
        /// <summary>
        /// Hide the popup
        /// </summary>
        
        // Ignore requests to hide multiple times
        if (!this._visible) {
            return;
        }
        
        var eventArgs = new Sys.CancelEventArgs();
        this.raiseHiding(eventArgs);
        if (eventArgs.get_cancel()) {
            return;
        }

        // Either hide the popup or play an animation that does
        this._visible = false;
        if (this._onHide) {
            this.onHide();
        } else {
            this._hidePopup();
            this._hideCleanup();
        }
    },
    
    getBounds : function() {
        /// <summary>
        /// Get the expected bounds of the popup relative to its parent
        /// </summary>
        /// <returns type="Sys.UI.Bounds" mayBeNull="false">
        /// Bounds of the popup relative to its parent
        /// </returns>
        /// <remarks>
        /// The actual final position can only be calculated after it is
        /// initially set and we can verify it doesn't bleed off the edge
        /// of the screen.
        /// </remarks>
    
        var element = this.get_element();
        
        // offsetParent (doc element if absolutely positioned or no offsetparent available)
        var offsetParent = element.offsetParent || document.documentElement;

        // diff = difference in position between element's offsetParent and the element we will attach popup to.
        // this is basically so we can position the popup in the right spot even though it may not be absolutely positioned
        var diff;
        var parentBounds;
        if (this._parentElement) {
            // we will be positioning the element against the assigned parent
            parentBounds = $common.getBounds(this._parentElement);
            
            var offsetParentLocation = $common.getLocation(offsetParent);
            diff = {x: parentBounds.x - offsetParentLocation.x, y:parentBounds.y - offsetParentLocation.y};
        } else {
            // we will be positioning the element against the offset parent by default, since no parent element given
            parentBounds = $common.getBounds(offsetParent);
            diff = {x:0, y:0};
        }

        // width/height of the element, needed for calculations that involve width like centering
        var width = element.offsetWidth - (element.clientLeft ? element.clientLeft * 2 : 0);
        var height = element.offsetHeight - (element.clientTop ? element.clientTop * 2 : 0);
        
        var position;
        switch (this._positioningMode) {
            case AjaxControlToolkit.PositioningMode.Center:
                position = {
                    x: Math.round(parentBounds.width / 2 - width / 2),
                    y: Math.round(parentBounds.height / 2 - height / 2)
                };
                break;
            case AjaxControlToolkit.PositioningMode.BottomLeft:
                position = {
                    x: 0,
                    y: parentBounds.height
                };
                break;
            case AjaxControlToolkit.PositioningMode.BottomRight:
                position = {
                    x: parentBounds.width - width,
                    y: parentBounds.height
                };
                break;
            case AjaxControlToolkit.PositioningMode.TopLeft:
                position = {
                    x: 0,
                    y: -element.offsetHeight
                };
                break;
            case AjaxControlToolkit.PositioningMode.TopRight:
                position = {
                    x: parentBounds.width - width,
                    y: -element.offsetHeight
                };
                break;
            default:
                position = {x: 0, y: 0};
        }
        position.x += this._x + diff.x;
        position.y += this._y + diff.y;
        
        return new Sys.UI.Bounds(position.x, position.y, width, height);
    },

    adjustPopupPosition : function(bounds) {
        /// <summary>
        /// Adjust the position of the popup after it's originally bet set
        /// to make sure that it's visible on the page.
        /// </summary>
        /// <param name="bounds" type="Sys.UI.Bounds" mayBeNull="true" optional="true">
        /// Original bounds of the parent element
        /// </param>

        var element = this.get_element();
        if (!bounds) {
            bounds = this.getBounds();
        }

        // 23098: Setting the width causes the element to grow by border+passing every
        // time.  But not setting it causes strange behavior in safari. Just set it once.
        if (this._firstPopup) {
            element.style.width = bounds.width + "px";
            this._firstPopup = false;
        }

        // Get the new bounds now that we've shown the popup
        var newPosition = $common.getBounds(element);
        var updateNeeded = false;

        if (newPosition.x < 0) {
            bounds.x -= newPosition.x;
            updateNeeded = true;
        }
        if (newPosition.y < 0) {
            bounds.y -= newPosition.y;
            updateNeeded = true;
        }

        // If the popup was off the screen, reposition it
        if (updateNeeded) {
            $common.setLocation(element, bounds);
        }
    },
    
    addBackgroundIFrame : function() {
        /// <summary>
        /// Add an empty IFRAME behind the popup (for IE6 only) so that SELECT, etc., won't
        /// show through the popup.
        /// </summary>
    
        // Get the child frame
        var element = this.get_element();
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version < 7)) {
            var childFrame = element._hideWindowedElementsIFrame;
            
            // Create the child frame if it wasn't found
            if (!childFrame) {
                childFrame = document.createElement("iframe");
                childFrame.src = "javascript:'<html></html>';";
                childFrame.style.position = "absolute";
                childFrame.style.display = "none";
                childFrame.scrolling = "no";
                childFrame.frameBorder = "0";
                childFrame.tabIndex = "-1";
                childFrame.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)";
                element.parentNode.insertBefore(childFrame, element);
                element._hideWindowedElementsIFrame = childFrame;
                this._moveHandler = Function.createDelegate(this, this._onMove);
                Sys.UI.DomEvent.addHandler(element, "move", this._moveHandler);
            }
            
            // Position the frame exactly behind the element
            $common.setBounds(childFrame, $common.getBounds(element));
            childFrame.style.display = element.style.display;
            if (element.currentStyle && element.currentStyle.zIndex) {
                childFrame.style.zIndex = element.currentStyle.zIndex;
            } else if (element.style.zIndex) {
                childFrame.style.zIndex = element.style.zIndex;
            }
        }
    },
    
    setupPopup : function() {
        /// <summary>
        /// Position the popup relative to its parent
        /// </summary>
        
        var element = this.get_element();
        var bounds = this.getBounds();
        $common.setLocation(element, bounds);

        // Tweak the position, set the zIndex, and add the background iframe in IE6
        this.adjustPopupPosition(bounds);
        element.zIndex = 1000;
        this.addBackgroundIFrame();
    },
    
    _hidePopup : function() {
        /// <summary>
        /// Internal hide implementation
        /// </summary>
        
        var element = this.get_element();
        $common.setVisible(element, false);
        if (element.originalWidth) {
            element.style.width = element.originalWidth + "px";
            element.originalWidth = null;
        }
    },
    
    _hideCleanup : function() {
        /// <summary>
        /// Perform cleanup after hiding the element
        /// </summary>
    
        var element = this.get_element();
        
        // Remove the tracking handler
        if (this._moveHandler) {
            Sys.UI.DomEvent.removeHandler(element, "move", this._moveHandler);
            this._moveHandler = null;
        }
        
        // Hide the child frame
        if (Sys.Browser.agent === Sys.Browser.InternetExplorer) {
            var childFrame = element._hideWindowedElementsIFrame;
            if (childFrame) {
                childFrame.style.display = "none";
            }
        }
        
        this.raiseHidden(Sys.EventArgs.Empty);
    },
    
    _onMove : function() {
        /// <summary>
        /// Track the popup's movements so the hidden IFrame (IE6 only) can
        /// be moved along with it
        /// </summary>
        
        var element = this.get_element();
        if (element._hideWindowedElementsIFrame) {
            element.parentNode.insertBefore(element._hideWindowedElementsIFrame, element);
            element._hideWindowedElementsIFrame.style.top = element.style.top;
            element._hideWindowedElementsIFrame.style.left = element.style.left;
        }
    },
    
    get_onShow : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnShow Animation's JSON definition
        /// </value>
        return this._onShow ? this._onShow.get_json() : null;
    },
    set_onShow : function(value) {
        if (!this._onShow) {
            this._onShow = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onShow.initialize();
        }
        this._onShow.set_json(value);
        var animation = this._onShow.get_animation();
        if (animation) {
            animation.add_ended(this._onShowEndedHandler);
        }
        this.raisePropertyChanged('onShow');
    },
    get_onShowBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnShow Animation's behavior
        /// </value>
        return this._onShow;
    },
    onShow : function() {
        /// <summary>
        /// Play the OnShow animation
        /// </summary>
        /// <returns />
        if (this._onShow) {
            if (this._onHide) {
                this._onHide.quit();
            }
            this._onShow.play();
        }
    },
    _onShowEnded : function() {
        /// <summary>
        /// Handler for the OnShow Animation's Ended event
        /// </summary>
        
        // Make sure the popup is where it belongs
        this.adjustPopupPosition();
        this.addBackgroundIFrame();
        
        this.raiseShown(Sys.EventArgs.Empty);
    },
    
    get_onHide : function() {
        /// <value type="String" mayBeNull="true">
        /// Generic OnHide Animation's JSON definition
        /// </value>
        return this._onHide ? this._onHide.get_json() : null;
    },
    set_onHide : function(value) {
        if (!this._onHide) {
            this._onHide = new AjaxControlToolkit.Animation.GenericAnimationBehavior(this.get_element());
            this._onHide.initialize();
        }
        this._onHide.set_json(value);
        var animation = this._onHide.get_animation();
        if (animation) {
            animation.add_ended(this._onHideEndedHandler);
        }
        this.raisePropertyChanged('onHide');
    },
    get_onHideBehavior : function() {
        /// <value type="AjaxControlToolkit.Animation.GenericAnimationBehavior">
        /// Generic OnHide Animation's behavior
        /// </value>
        return this._onHide;
    },
    onHide : function() {
        /// <summary>
        /// Play the OnHide animation
        /// </summary>
        /// <returns />
        if (this._onHide) {
            if (this._onShow) {
                this._onShow.quit();
            }
            this._onHide.play();
        }
    },
    _onHideEnded : function() {
        /// <summary>
        /// Handler for the OnHide Animation's Ended event
        /// </summary>
        
        this._hideCleanup();
    },
    
    get_parentElement : function() {
        /// <value type="Sys.UI.DomElement" domElement="true">
        /// Parent dom element.
        /// </value>
        
        if (!this._parentElement && this._parentElementID) {
            this.set_parentElement($get(this._parentElementID));
            Sys.Debug.assert(this._parentElement != null, String.format(AjaxControlToolkit.Resources.PopupExtender_NoParentElement, this._parentElementID));
        }        
        return this._parentElement;
    },
    set_parentElement : function(element) {
        this._parentElement = element;
        this.raisePropertyChanged('parentElement');
    },
    
    get_parentElementID : function() {
        /// <value type="String">
        /// Parent dom element.
        /// </value>
        
        if (this._parentElement) {
            return this._parentElement.id
        }
        return this._parentElementID;
    },
    set_parentElementID : function(elementID) {
        this._parentElementID = elementID;
        if (this.get_isInitialized()) {
            this.set_parentElement($get(elementID));
        }
    },
        
    get_positioningMode : function() {
        /// <value type="AjaxControlToolkit.PositioningMode">
        /// Positioning mode.
        /// </value>
        return this._positioningMode;
    },
    set_positioningMode : function(mode) {
        this._positioningMode = mode;
        this.raisePropertyChanged('positioningMode');
    },
    
    get_x : function() {
        /// <value type="Number">
        /// X coordinate.
        /// </value>
        return this._x;
    },
    set_x : function(value) {
        if (value != this._x) {
            this._x = value;
            
            // Reposition the popup if it's already showing
            if (this._visible) {
                this.setupPopup();
            }
            this.raisePropertyChanged('x');
        }
    },
    
    get_y : function() {
        /// <value type="Number">
        /// Y coordinate.
        /// </value>
        return this._y;
    },
    set_y : function(value) {
        if (value != this._y) {
            this._y = value;
            
            // Reposition the popup if it's already showing
            if (this._visible) {
                this.setupPopup();
            }
            this.raisePropertyChanged('y');
        }
    },
    
    get_visible : function() {
        /// <value type="Boolean" mayBeNull="false">
        /// Whether or not the popup is currently visible
        /// </value>
        return this._visible;
    },
    
    add_showing : function(handler) {
        /// <summary>
        /// Add an event handler for the showing event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('showing', handler);
    },
    remove_showing : function(handler) {
        /// <summary>
        /// Remove an event handler from the showing event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('showing', handler);
    },
    raiseShowing : function(eventArgs) {
        /// <summary>
        /// Raise the showing event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the showing event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('showing');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_shown : function(handler) {
        /// <summary>
        /// Add an event handler for the shown event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('shown', handler);
    },
    remove_shown : function(handler) {
        /// <summary>
        /// Remove an event handler from the shown event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('shown', handler);
    },
    raiseShown : function(eventArgs) {
        /// <summary>
        /// Raise the shown event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the shown event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('shown');
        if (handler) {
            handler(this, eventArgs);
        }
    },    
    
    add_hiding : function(handler) {
        /// <summary>
        /// Add an event handler for the hiding event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('hiding', handler);
    },
    remove_hiding : function(handler) {
        /// <summary>
        /// Remove an event handler from the hiding event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('hiding', handler);
    },
    raiseHiding : function(eventArgs) {
        /// <summary>
        /// Raise the hiding event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the hiding event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hiding');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_hidden : function(handler) {
        /// <summary>
        /// Add an event handler for the hidden event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().addHandler('hidden', handler);
    },
    remove_hidden : function(handler) {
        /// <summary>
        /// Remove an event handler from the hidden event
        /// </summary>
        /// <param name="handler" type="Function" mayBeNull="false">
        /// Event handler
        /// </param>
        /// <returns />
        this.get_events().removeHandler('hidden', handler);
    },
    raiseHidden : function(eventArgs) {
        /// <summary>
        /// Raise the hidden event
        /// </summary>
        /// <param name="eventArgs" type="Sys.EventArgs" mayBeNull="false">
        /// Event arguments for the hidden event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hidden');
        if (handler) {
            handler(this, eventArgs);
        }
    }
}
AjaxControlToolkit.PopupBehavior.registerClass('AjaxControlToolkit.PopupBehavior', AjaxControlToolkit.BehaviorBase);
//AjaxControlToolkit.PopupBehavior.descriptor = {
//    properties: [   {name: 'parentElement', attributes: [ Sys.Attributes.Element, true ] },
//                    {name: 'positioningMode', type: AjaxControlToolkit.PositioningMode},
//                    {name: 'x', type: Number},
//                    {name: 'y', type: Number} ],
//    events: [   {name: 'show'},
//                {name: 'hide'} ]
//}

AjaxControlToolkit.PositioningMode = function() {
    /// <summary>
    /// Positioning mode describing how the popup should be positioned
    /// relative to its specified parent
    /// </summary>
    /// <field name="Absolute" type="Number" integer="true" />
    /// <field name="Center" type="Number" integer="true" />
    /// <field name="BottomLeft" type="Number" integer="true" />
    /// <field name="BottomRight" type="Number" integer="true" />
    /// <field name="TopLeft" type="Number" integer="true" />
    /// <field name="TopRight" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.PositioningMode.prototype = {
    Absolute: 0,
    Center: 1,
    BottomLeft: 2,
    BottomRight: 3,
    TopLeft: 4,
    TopRight: 5
}
AjaxControlToolkit.PositioningMode.registerEnum('AjaxControlToolkit.PositioningMode');

//END AjaxControlToolkit.PopupExtender.PopupBehavior.js
//START AjaxControlToolkit.Common.Threading.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />


Type.registerNamespace('AjaxControlToolkit');

AjaxControlToolkit.DeferredOperation = function(delay, context, callback) {
    /// <summary>
    /// Used to define a cancellable async operation
    /// </summary>
    /// <param name="delay" type="Number" integer="true">the number of milliseconds to delay execution</param>
    /// <param name="context" type="Object" mayBeNull="true">an object used as the context for the callback method</param>
    /// <param name="callback" type="Function">The callback method to execute at the end of the delay</param>
    
    this._delay = delay;
    this._context = context;
    this._callback = callback;
    this._completeCallback = null;
    this._errorCallback = null;
    this._timer = null;
    this._callArgs = null;
    this._isComplete = false;
    this._completedSynchronously = false;
    this._asyncResult = null;
    this._exception = null;
    this._throwExceptions = true;
    this._oncomplete$delegate = Function.createDelegate(this, this._oncomplete);
    
    // post to ensure that attaching it always gets the port as its context
    this.post = Function.createDelegate(this, this.post);
}
AjaxControlToolkit.DeferredOperation.prototype = {
    
    get_isPending : function() { 
        /// <summary>
        /// Gets whether there is an asynchronous operation pending
        /// </summary>
        /// <returns type="Boolean" />
        
        return (this._timer != null); 
    },
    
    get_isComplete : function() { 
        /// <summary>
        /// Gets whether the asynchronous operation has completed
        /// </summary>
        /// <returns type="Boolean" />
        
        return this._isComplete; 
    },
    
    get_completedSynchronously : function() {
        /// <summary>
        /// Gets whether the operation completed synchronously
        /// </summary>
        /// <returns type="Boolean" />
        
        return this._completedSynchronously;
    },
    
    get_exception : function() {
        /// <summary>
        /// Gets the current exception if there is one
        /// </summary>
        /// <returns type="Error" />
        
        return this._exception;
    },
    
    get_throwExceptions : function() {
        /// <summary>
        /// Gets whether to throw exceptions
        /// </summary>
        /// <returns type="Boolean" />
        
        return this._throwExceptions;
    },    
    set_throwExceptions : function(value) {
        /// <summary>
        /// Sets whether to throw exceptions
        /// </summary>
        /// <param name="value" type="Boolean">True if exceptions should be thrown, otherwise false</param>
        
        this._throwExceptions = value;
    },
    
    get_delay : function() { 
        /// <summary>
        /// Gets the current delay in milliseconds
        /// </summary>
        /// <returns type="Number" integer="true" />
        
        return this._delay; 
    },
    set_delay : function(value) { 
        /// <summary>
        /// Sets the current delay in milliseconds
        /// </summary>
        /// <param name="value" type="Number" integer="true">The delay in milliseconds</param>
        
        this._delay = value; 
    },
    
    post : function(args) {
        /// <summary>
        /// A method that can be directly attached to a delegate
        /// </summary>
        /// <param name="args" type="Object" parameterArray="true">The arguments to the method</param>
        
        var ar = [];
        for (var i = 0; i < arguments.length; i++) {
            ar[i] = arguments[i];
        }
        this.beginPost(ar, null, null);
    },
    
    beginPost : function(args, completeCallback, errorCallback) {
        /// <summary>
        /// Posts a call to an async operation on this port
        /// </summary>
        /// <param name="args" type="Array">An array of arguments to the method</param>
        /// <param name="completeCallback" type="Function" optional="true" mayBeNull="true">The callback to execute after the delayed function completes</param>
        /// <param name="errorCallback" type="Function" optional="true" mayBeNull="true">The callback to execute in the event of an exception in the delayed function</param>
        
        // cancel any pending post
        this.cancel();
        
        // cache the call arguments
        this._callArgs = Array.clone(args || []);
        this._completeCallback = completeCallback;
        this._errorCallback = errorCallback;
        
        if (this._delay == -1) {            
            // if there is no delay (-1), complete synchronously
            try {
                this._oncomplete();
            } finally {
                this._completedSynchronously = true;
            }
        } else {            
            // complete the post on a seperate call after a delay
            this._timer = setTimeout(this._oncomplete$delegate, this._delay);
        }
    }, 
    
    cancel : function() {
        /// <summary>
        /// Cancels a pending post
        /// </summary>
        
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._callArgs = null;
        this._isComplete = false;
        this._asyncResult = null;
        this._completeCallback = null;
        this._errorCallback = null;
        this._exception = null;
        this._completedSynchronously = false;
    },
    
    call : function(args) {
        /// <summary>
        /// Executes the deferred operation synchronously
        /// </summary>
        /// <param name="args" type="Object" parameterArray="true">The arguments to the method</param>
        
        var ar = [];
        for (var i = 0; i < arguments.length; i++) {
            ar[i] = arguments[i];
        }
        
        // cancel any pending post
        this.cancel();
        
        // cache the call arguments
        this._callArgs = ar;
        this._completeCallback = null;
        this._errorCallback = null;
        
        try {
            this._oncomplete();
        } finally {
            this._completedSynchronously = true;
        }
        if (this._exception) {
            throw this._exception;
        }
        return this._asyncResult;
    },
    
    complete : function() {
        /// <summary>
        /// Completes a pending post synchronously
        /// </summary>        
        
        if (this._timer) {
            try {
                this._oncomplete();
            } finally {
                this._completedSynchronously = true;
            }
            return this._asyncResult;
        } else if (this._isComplete) {
            return this._asyncResult;
        }
    },    
    
    _oncomplete : function() {
        /// <summary>
        /// Completes a pending post asynchronously
        /// </summary>

        var args = this._callArgs;
        var completeCallback = this._completeCallback;
        var errorCallback = this._errorCallback;
        
        // clear the post state
        this.cancel();
        try {
            // call the post callback
            if (args) {
                this._asyncResult = this._callback.apply(this._context, args);
            } else {
                this._asyncResult = this._callback.call(this._context);
            }
            this._isComplete = true;
            this._completedSynchronously = false;
            if (completeCallback) {
                completeCallback(this);
            }
        } catch (e) {
            this._isComplete = true;
            this._completedSynchronously = false;
            this._exception = e;
            if (errorCallback) {
                if (errorCallback(this)) {
                    return;
                }
            } 
            if (this._throwExceptions) {
                throw e;
            }
        }
    }
}
AjaxControlToolkit.DeferredOperation.registerClass("AjaxControlToolkit.DeferredOperation");

//END AjaxControlToolkit.Common.Threading.js
//START AjaxControlToolkit.Calendar.CalendarBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Common/Common.js" />
/// <reference path="../Common/DateTime.js" />
/// <reference path="../Common/Threading.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Animation/Animations.js" />
/// <reference path="../Animation/AnimationBehavior.js" />
/// <reference path="../PopupExtender/PopupBehavior.js" />


Type.registerNamespace("AjaxControlToolkit");

AjaxControlToolkit.CalendarBehavior = function(element) {
    /// <summary>
    /// A behavior that attaches a calendar date selector to a textbox
    /// </summmary>
    /// <param name="element" type="Sys.UI.DomElement">The element to attach to</param>
    
    AjaxControlToolkit.CalendarBehavior.initializeBase(this, [element]);
            
    this._textbox = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(element);
    this._format = "d";
    this._cssClass = "ajax__calendar";
    this._enabled = true;
    this._animated = true;
    this._buttonID = null;
    this._layoutRequested = 0;
    this._layoutSuspended = false;
    this._button = null;
    this._popupMouseDown = false;
    this._selectedDate = null;
    this._visibleDate = null;
    this._todaysDate = null;
    this._firstDayOfWeek = AjaxControlToolkit.FirstDayOfWeek.Default;

    this._container = null;
    this._popupDiv = null;
    this._header = null;
    this._prevArrow = null;
    this._nextArrow = null;
    this._title = null;
    this._body = null;
    this._today = null;
    this._days = null;
    this._daysTable = null;
    this._daysTableHeader = null;
    this._daysTableHeaderRow = null;
    this._daysBody = null;
    this._months = null;
    this._monthsTable = null;
    this._monthsBody = null;
    this._years = null;
    this._yearsTable = null;
    this._yearsBody = null;
    this._popupPosition = AjaxControlToolkit.CalendarPosition.BottomLeft;
        
    this._popupBehavior = null;
    this._modeChangeAnimation = null;
    this._modeChangeMoveTopOrLeftAnimation = null;
    this._modeChangeMoveBottomOrRightAnimation = null;
    this._mode = "days";
    this._selectedDateChanging = false;
    this._isOpen = false;
    this._isAnimating = false;
    this._width = 170;
    this._height = 139;
    this._modes = {"days" : null, "months" : null, "years" : null};
    this._modeOrder = {"days" : 0, "months" : 1, "years" : 2 };
    this._hourOffsetForDst = 12;  // Hour value for calls to new Date(...) to avoid DST issues
    this._blur = new AjaxControlToolkit.DeferredOperation(1, this, this.blur);
    
    this._button$delegates = {
        click : Function.createDelegate(this, this._button_onclick),
        keypress : Function.createDelegate(this, this._button_onkeypress),
        blur : Function.createDelegate(this, this._button_onblur)
    }
    this._element$delegates = {
        change : Function.createDelegate(this, this._element_onchange),
        keypress : Function.createDelegate(this, this._element_onkeypress),
        click : Function.createDelegate(this, this._element_onclick),
        focus : Function.createDelegate(this, this._element_onfocus),
        blur : Function.createDelegate(this, this._element_onblur)
    }
    this._popup$delegates = { 
        mousedown: Function.createDelegate(this, this._popup_onmousedown),
        mouseup: Function.createDelegate(this, this._popup_onmouseup),
        drag: Function.createDelegate(this, this._popup_onevent),
        dragstart: Function.createDelegate(this, this._popup_onevent),
        select: Function.createDelegate(this, this._popup_onevent)
    }
    this._cell$delegates = {
        mouseover : Function.createDelegate(this, this._cell_onmouseover),
        mouseout : Function.createDelegate(this, this._cell_onmouseout),
        click : Function.createDelegate(this, this._cell_onclick)
    }
}
AjaxControlToolkit.CalendarBehavior.prototype = {    

    get_animated : function() {
        /// <summary>
        /// Whether changing modes is animated
        /// </summary>
        /// <value type="Boolean" />
           
        return this._animated;
    },
    set_animated : function(value) {
        if (this._animated != value) {
            this._animated = value;
            this.raisePropertyChanged("animated");
        }
    },

    get_enabled : function() {
        /// <value type="Boolean">
        /// Whether this behavior is available for the current element
        /// </value>
           
        return this._enabled;
    },
    set_enabled : function(value) {
        if (this._enabled != value) {
            this._enabled = value;
            this.raisePropertyChanged("enabled");
        }
    },
    
    get_button : function() {
        /// <value type="Sys.UI.DomElement">
        /// The button to use to show the calendar (optional)
        /// </value>
        
        return this._button;
    },
    set_button : function(value) {
        if (this._button != value) {
            if (this._button && this.get_isInitialized()) {
                $common.removeHandlers(this._button, this._button$delegates);
            }
            this._button = value;
            if (this._button && this.get_isInitialized()) {
                $addHandlers(this._button, this._button$delegates);
            }
            this.raisePropertyChanged("button");
        }
    },
    
    get_popupPosition : function() {
        /// <value type="AjaxControlToolkit.CalendarPosition">
        /// Where the popup should be positioned relative to the target control.
        /// Can be BottomLeft (Default), BottomRight, TopLeft, TopRight.
        /// </value>
        
        return this._popupPosition;
    },
    set_popupPosition : function(value) {
        if (this._popupPosition != value) {
            this._popupPosition = value;
            this.raisePropertyChanged('popupPosition');
        }
    },
    
    get_format : function() { 
        /// <value type="String">
        /// The format to use for the date value
        /// </value>

        return this._format; 
    },
    set_format : function(value) { 
        if (this._format != value) {
            this._format = value; 
            this.raisePropertyChanged("format");
        }
    },
    
    get_selectedDate : function() {
        /// <value type="Date">
        /// The date value represented by the text box
        /// </value>

        if (this._selectedDate == null) {
            var value = this._textbox.get_Value();
            if (value) {
                value = this._parseTextValue(value);
                if (value) {
                    this._selectedDate = value.getDateOnly();
                }
            }
        }
        return this._selectedDate;
    },
    set_selectedDate : function(value) {
        if(value && (String.isInstanceOfType(value)) && (value.length != 0)) {
            value = new Date(value);
        }
        
        if (value) value = value.getDateOnly();

        if (this._selectedDate != value) {
            this._selectedDate = value;            
            this._selectedDateChanging = true;
            var text = "";
            if (value) {
                text = value.localeFormat(this._format);
            }
            if (text != this._textbox.get_Value()) {
                this._textbox.set_Value(text);
                this._fireChanged();
            }
            this._selectedDateChanging = false;
            this.invalidate();
            this.raisePropertyChanged("selectedDate");
        }
    },

    get_visibleDate : function() {
        /// <summary>
        /// The date currently visible in the calendar
        /// </summary>
        /// <value type="Date" />

        return this._visibleDate;
    },
    set_visibleDate : function(value) {
        if (value) value = value.getDateOnly();
        if (this._visibleDate != value) {
            this._switchMonth(value, !this._isOpen);
            this.raisePropertyChanged("visibleDate");
        }
    },
    
    get_isOpen : function() {
        /// <value type="Boolean">
        /// Whether the calendar is open
        /// </value>
        return this._isOpen;
    },

    get_todaysDate : function() {
        /// <value type="Date">
        /// The date to use for "Today"
        /// </value>
        if (this._todaysDate != null) {
            return this._todaysDate;
        }
        return new Date().getDateOnly();
    },
    set_todaysDate : function(value) {
        if (value) value = value.getDateOnly();
        if (this._todaysDate != value) {
            this._todaysDate = value;
            this.invalidate();
            this.raisePropertyChanged("todaysDate");
        }
    },
    
    get_firstDayOfWeek : function() {
        /// <value type="AjaxControlToolkit.FirstDayOfWeek">
        /// The day of the week to appear as the first day in the calendar
        /// </value>
        
        return this._firstDayOfWeek;
    },
    set_firstDayOfWeek : function(value) {
        if (this._firstDayOfWeek != value) {
            this._firstDayOfWeek = value;
            this.invalidate();
            this.raisePropertyChanged("firstDayOfWeek");
        }
    },
        
    get_cssClass : function() {
        /// <value type="String">
        /// The CSS class selector to use to change the calendar's appearance
        /// </value>

        return this._cssClass;
    },
    set_cssClass : function(value) {
        if (this._cssClass != value) {
            if (this._cssClass && this.get_isInitialized()) {
                Sys.UI.DomElement.removeCssClass(this._container, this._cssClass);
            }
            this._cssClass = value;
            if (this._cssClass && this.get_isInitialized()) {
                Sys.UI.DomElement.addCssClass(this._container, this._cssClass);
            }
            this.raisePropertyChanged("cssClass");
        }
    },
    
    get_todayButton : function() {
        /// <value type="Sys.UI.DomElement">
        /// The button used to select todays date
        /// </value>

        return this._today;
    },
    
    get_dayCell : function(row, col) {
        /// <value type="Sys.UI.DomElement">
        /// Gets the day cell at the specified row or column
        /// </value>
        if (this._daysBody) {
            return this._daysBody.rows[row].cells[col].firstChild;
        }
        return null;
    },
    
    add_showing : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>showiwng</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("showing", handler);
    },
    remove_showing : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>showing</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("showing", handler);
    },
    raiseShowing : function(eventArgs) {
        /// <summary>
        /// Raise the showing event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the showing event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('showing');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_shown : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>shown</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("shown", handler);
    },
    remove_shown : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>shown</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("shown", handler);
    },
    raiseShown : function() {
        /// <summary>
        /// Raise the <code>shown</code> event
        /// </summary>
        /// <returns />

        var handlers = this.get_events().getHandler("shown");
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },
    
    add_hiding : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>hiding</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("hiding", handler);
    },
    remove_hiding : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>hiding</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("hiding", handler);
    },
    raiseHiding : function(eventArgs) {
        /// <summary>
        /// Raise the hiding event
        /// </summary>
        /// <param name="eventArgs" type="Sys.CancelEventArgs" mayBeNull="false">
        /// Event arguments for the hiding event
        /// </param>
        /// <returns />
        
        var handler = this.get_events().getHandler('hiding');
        if (handler) {
            handler(this, eventArgs);
        }
    },
    
    add_hidden : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>hidden</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("hidden", handler);
    },
    remove_hidden : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>hidden</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("hidden", handler);
    },
    raiseHidden : function() {
        /// <summary>
        /// Raise the <code>hidden</code> event
        /// </summary>
        /// <returns />

        var handlers = this.get_events().getHandler("hidden");
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },
    
    add_dateSelectionChanged : function(handler) {
        /// <summary>
        /// Adds an event handler for the <code>dateSelectionChanged</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to add to the event.
        /// </param>
        /// <returns />

        this.get_events().addHandler("dateSelectionChanged", handler);
    },
    remove_dateSelectionChanged : function(handler) {
        /// <summary>
        /// Removes an event handler for the <code>dateSelectionChanged</code> event.
        /// </summary>
        /// <param name="handler" type="Function">
        /// The handler to remove from the event.
        /// </param>
        /// <returns />

        this.get_events().removeHandler("dateSelectionChanged", handler);
    },
    raiseDateSelectionChanged : function() {
        /// <summary>
        /// Raise the <code>dateSelectionChanged</code> event
        /// </summary>
        /// <returns />

        var handlers = this.get_events().getHandler("dateSelectionChanged");
        if (handlers) {
            handlers(this, Sys.EventArgs.Empty);
        }
    },

    initialize : function() {
        /// <summary>
        /// Initializes the components and parameters for this behavior
        /// </summary>
        
        AjaxControlToolkit.CalendarBehavior.callBaseMethod(this, "initialize");
        
        var elt = this.get_element();
        $addHandlers(elt, this._element$delegates);
        
        if (this._button) {
            $addHandlers(this._button, this._button$delegates);
        }
        
        this._modeChangeMoveTopOrLeftAnimation = new AjaxControlToolkit.Animation.LengthAnimation(null, null, null, "style", null, 0, 0, "px");
        this._modeChangeMoveBottomOrRightAnimation = new AjaxControlToolkit.Animation.LengthAnimation(null, null, null, "style", null, 0, 0, "px");
        this._modeChangeAnimation = new AjaxControlToolkit.Animation.ParallelAnimation(null, .25, null, [ this._modeChangeMoveTopOrLeftAnimation, this._modeChangeMoveBottomOrRightAnimation ]);

        var value = this.get_selectedDate();
        if (value) {
            this.set_selectedDate(value);
        } 
    },
    dispose : function() {
        /// <summary>
        /// Disposes this behavior's resources
        /// </summary>
        
        if (this._popupBehavior) {
            this._popupBehavior.dispose();
            this._popupBehavior = null;
        }
        this._modes = null;
        this._modeOrder = null;
        if (this._modeChangeMoveTopOrLeftAnimation) {
            this._modeChangeMoveTopOrLeftAnimation.dispose();
            this._modeChangeMoveTopOrLeftAnimation = null;
        }
        if (this._modeChangeMoveBottomOrRightAnimation) {
            this._modeChangeMoveBottomOrRightAnimation.dispose();
            this._modeChangeMoveBottomOrRightAnimation = null;
        }
        if (this._modeChangeAnimation) {
            this._modeChangeAnimation.dispose();
            this._modeChangeAnimation = null;
        }
        if (this._container) {
            if(this._container.parentNode) { // added this check before calling removeChild WI: 8486
                this._container.parentNode.removeChild(this._container);
            }
            this._container = null;
        }
        if (this._popupDiv) {
            $common.removeHandlers(this._popupDiv, this._popup$delegates);
            this._popupDiv = null;
        }        
        if (this._prevArrow) {
            $common.removeHandlers(this._prevArrow, this._cell$delegates);
            this._prevArrow = null;
        }
        if (this._nextArrow) {
            $common.removeHandlers(this._nextArrow, this._cell$delegates);
            this._nextArrow = null;
        }
        if (this._title) {
            $common.removeHandlers(this._title, this._cell$delegates);
            this._title = null;
        }
        if (this._today) {
            $common.removeHandlers(this._today, this._cell$delegates);
            this._today = null;
        }
        if (this._button) {
            $common.removeHandlers(this._button, this._button$delegates);
            this._button = null;
        }
        if (this._daysBody) {
            for (var i = 0; i < this._daysBody.rows.length; i++) {
                var row = this._daysBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    $common.removeHandlers(row.cells[j].firstChild, this._cell$delegates);
                }
            }
            this._daysBody = null;
        }
        if (this._monthsBody) {
            for (var i = 0; i < this._monthsBody.rows.length; i++) {
                var row = this._monthsBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    $common.removeHandlers(row.cells[j].firstChild, this._cell$delegates);
                }
            }
            this._monthsBody = null;
        }
        if (this._yearsBody) {
            for (var i = 0; i < this._yearsBody.rows.length; i++) {
                var row = this._yearsBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    $common.removeHandlers(row.cells[j].firstChild, this._cell$delegates);
                }
            }
            this._yearsBody = null;
        }        
        var elt = this.get_element();
        $common.removeHandlers(elt, this._element$delegates);
        AjaxControlToolkit.CalendarBehavior.callBaseMethod(this, "dispose");
    },
    
    show : function() {
        /// <summary>
        /// Shows the calendar
        /// </summary>
        
        this._ensureCalendar();
        
        if (!this._isOpen) {
            
            var eventArgs = new Sys.CancelEventArgs();
            this.raiseShowing(eventArgs);
            if (eventArgs.get_cancel()) {
                return;
            }
            
            this._isOpen = true;
            this._switchMonth(null, true);
            this._popupBehavior.show();
            this.raiseShown();
        }
    },    
    hide : function() {
        /// <summary>
        /// Hides the calendar
        /// </summary>
        
        if (this._isOpen) {
            var eventArgs = new Sys.CancelEventArgs();
            this.raiseHiding(eventArgs);
            if (eventArgs.get_cancel()) {
                return;
            }
            
            if (this._container) {
                this._popupBehavior.hide();        
                this._switchMode("days", true);            
            }
            this._isOpen = false;        
            this.raiseHidden();

            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },
    focus : function() {
        if (this._button) {
            this._button.focus();
        } else {
            this.get_element().focus();
        }
    },
    blur : function(force) {
        if (!force && Sys.Browser.agent === Sys.Browser.Opera) {
            this._blur.post(true);
        } else {
            if (!this._popupMouseDown) {
                this.hide();                
            } 
            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },
    
    suspendLayout : function() {
        /// <summary>
        /// Suspends layout of the behavior while setting properties
        /// </summary>

        this._layoutSuspended++;
    },
    resumeLayout : function() {
        /// <summary>
        /// Resumes layout of the behavior and performs any pending layout requests
        /// </summary>

        this._layoutSuspended--;
        if (this._layoutSuspended <= 0) {
            this._layoutSuspended = 0;
            if (this._layoutRequested) {
                this._performLayout();
            }
        }
    },
    invalidate : function() {
        /// <summary>
        /// Performs layout of the behavior unless layout is suspended
        /// </summary>
        
        if (this._layoutSuspended > 0) {
            this._layoutRequested = true;
        } else {
            this._performLayout();
        }
    },
    
    _buildCalendar : function() {
        /// <summary>
        /// Builds the calendar's layout
        /// </summary>
        
        var elt = this.get_element();
        var id = this.get_id();
        
        this._container = $common.createElementFromTemplate({
            nodeName : "div",
            properties : { id : id + "_container" },
            cssClasses : [this._cssClass]
        }, elt.parentNode);

        this._popupDiv = $common.createElementFromTemplate({ 
            nodeName : "div",
            events : this._popup$delegates, 
            properties : {
                id : id + "_popupDiv"
            },
            cssClasses : ["ajax__calendar_container"], 
            visible : false 
        }, this._container);
    },
    _buildHeader : function() {
        /// <summary>
        /// Builds the header for the calendar
        /// </summary>
        
        var id = this.get_id();
        
        this._header = $common.createElementFromTemplate({ 
            nodeName : "div",
            properties : { id : id + "_header" },
            cssClasses : [ "ajax__calendar_header" ]
        }, this._popupDiv);
        
        var prevArrowWrapper = $common.createElementFromTemplate({ nodeName : "div" }, this._header);
        this._prevArrow = $common.createElementFromTemplate({ 
            nodeName : "div",
            properties : {
                id : id + "_prevArrow",
                mode : "prev"
            },
            events : this._cell$delegates,
            cssClasses : [ "ajax__calendar_prev" ] 
        }, prevArrowWrapper);
        
        var nextArrowWrapper = $common.createElementFromTemplate({ nodeName : "div" }, this._header);
        this._nextArrow = $common.createElementFromTemplate({ 
            nodeName : "div",
            properties : {
                id : id + "_nextArrow",
                mode : "next"
            },
            events : this._cell$delegates, 
            cssClasses : [ "ajax__calendar_next" ] 
        }, nextArrowWrapper);
        
        var titleWrapper = $common.createElementFromTemplate({ nodeName : "div" }, this._header);        
        this._title = $common.createElementFromTemplate({ 
            nodeName : "div",
            properties : {
                id : id + "_title",
                mode : "title"
            },
            events : this._cell$delegates, 
            cssClasses : [ "ajax__calendar_title" ] 
        }, titleWrapper);
    },
    _buildBody : function() {
        /// <summary>
        /// Builds the body region for the calendar
        /// </summary>
        
        this._body = $common.createElementFromTemplate({ 
            nodeName : "div",
            properties : { id : this.get_id() + "_body" },
            cssClasses : [ "ajax__calendar_body" ]
        }, this._popupDiv);

        this._buildDays();
        this._buildMonths();
        this._buildYears();
    },
    _buildFooter : function() {
        /// <summary>
        /// Builds the footer for the calendar
        /// </summary>
        
        var todayWrapper = $common.createElementFromTemplate({ nodeName : "div" }, this._popupDiv);
        this._today = $common.createElementFromTemplate({
            nodeName : "div",
            properties : {
                id : this.get_id() + "_today",
                mode : "today"
            },
            events : this._cell$delegates,
            cssClasses : [ "ajax__calendar_footer", "ajax__calendar_today" ]
        }, todayWrapper);
    },
    _buildDays : function() {
        /// <summary>
        /// Builds a "days of the month" view for the calendar
        /// </summary>
        
        var dtf = Sys.CultureInfo.CurrentCulture.dateTimeFormat;
        var id = this.get_id();

        this._days = $common.createElementFromTemplate({ 
            nodeName : "div",
            properties : { id : id + "_days" },
            cssClasses : [ "ajax__calendar_days" ]
        }, this._body);
        this._modes["days"] = this._days;
        
        this._daysTable = $common.createElementFromTemplate({ 
            nodeName : "table",
            properties : {
                id : id + "_daysTable",
                cellPadding : 0,
                cellSpacing : 0,
                border : 0,
                style : { margin : "auto" }
            } 
        }, this._days);
        
        this._daysTableHeader = $common.createElementFromTemplate({ nodeName : "thead", properties : { id : id + "_daysTableHeader" } }, this._daysTable);
        this._daysTableHeaderRow = $common.createElementFromTemplate({ nodeName : "tr", properties : { id : id + "_daysTableHeaderRow" } }, this._daysTableHeader);
        for (var i = 0; i < 7; i++) {
            var dayCell = $common.createElementFromTemplate({ nodeName : "td" }, this._daysTableHeaderRow);
            var dayDiv = $common.createElementFromTemplate({
                nodeName : "div",
                cssClasses : [ "ajax__calendar_dayname" ]
            }, dayCell);
        }

        this._daysBody = $common.createElementFromTemplate({ nodeName: "tbody", properties : { id : id + "_daysBody" } }, this._daysTable);
        for (var i = 0; i < 6; i++) {
            var daysRow = $common.createElementFromTemplate({ nodeName : "tr" }, this._daysBody);
            for(var j = 0; j < 7; j++) {
                var dayCell = $common.createElementFromTemplate({ nodeName : "td" }, daysRow);
                var dayDiv = $common.createElementFromTemplate({
                    nodeName : "div",
                    properties : {
                        mode : "day",
                        id : id + "_day_" + i + "_" + j,
                        innerHTML : "&nbsp;"
                    },
                    events : this._cell$delegates,
                    cssClasses : [ "ajax__calendar_day" ]
                }, dayCell);
            }
        }
    },
    _buildMonths : function() {
        /// <summary>
        /// Builds a "months of the year" view for the calendar
        /// </summary>
        
        var dtf = Sys.CultureInfo.CurrentCulture.dateTimeFormat;        
        var id = this.get_id();
        
        this._months = $common.createElementFromTemplate({
            nodeName : "div",
            properties : { id : id + "_months" },
            cssClasses : [ "ajax__calendar_months" ],
            visible : false
        }, this._body);
        this._modes["months"] = this._months;
        
        this._monthsTable = $common.createElementFromTemplate({
            nodeName : "table",
            properties : {
                id : id + "_monthsTable",
                cellPadding : 0,
                cellSpacing : 0,
                border : 0,
                style : { margin : "auto" }
            }
        }, this._months);

        this._monthsBody = $common.createElementFromTemplate({ nodeName : "tbody", properties : { id : id + "_monthsBody" } }, this._monthsTable);
        for (var i = 0; i < 3; i++) {
            var monthsRow = $common.createElementFromTemplate({ nodeName : "tr" }, this._monthsBody);
            for (var j = 0; j < 4; j++) {
                var monthCell = $common.createElementFromTemplate({ nodeName : "td" }, monthsRow);
                var monthDiv = $common.createElementFromTemplate({
                    nodeName : "div",
                    properties : {
                        id : id + "_month_" + i + "_" + j,
                        mode : "month",
                        month : (i * 4) + j,
                        innerHTML : "<br />" + dtf.AbbreviatedMonthNames[(i * 4) + j]
                    },
                    events : this._cell$delegates,
                    cssClasses : [ "ajax__calendar_month" ]
                }, monthCell);
            }
        }
    },
    _buildYears : function() {
        /// <summary>
        /// Builds a "years in this decade" view for the calendar
        /// </summary>
        
        var id = this.get_id();
        
        this._years = $common.createElementFromTemplate({
            nodeName : "div",
            properties : { id : id + "_years" },
            cssClasses : [ "ajax__calendar_years" ],
            visible : false
        }, this._body);
        this._modes["years"] = this._years;
        
        this._yearsTable = $common.createElementFromTemplate({
            nodeName : "table",
            properties : {
                id : id + "_yearsTable",
                cellPadding : 0,
                cellSpacing : 0,
                border : 0,
                style : { margin : "auto" }
            }
        }, this._years);

        this._yearsBody = $common.createElementFromTemplate({ nodeName : "tbody", properties : { id : id + "_yearsBody" } }, this._yearsTable);
        for (var i = 0; i < 3; i++) {
            var yearsRow = $common.createElementFromTemplate({ nodeName : "tr" }, this._yearsBody);
            for (var j = 0; j < 4; j++) {
                var yearCell = $common.createElementFromTemplate({ nodeName : "td" }, yearsRow);
                var yearDiv = $common.createElementFromTemplate({ 
                    nodeName : "div", 
                    properties : { 
                        id : id + "_year_" + i + "_" + j,
                        mode : "year",
                        year : ((i * 4) + j) - 1
                    },
                    events : this._cell$delegates,
                    cssClasses : [ "ajax__calendar_year" ]
                }, yearCell);
            }
        }
    },
    
    _performLayout : function() {
        /// <summmary>
        /// Updates the various views of the calendar to match the current selected and visible dates
        /// </summary>
        
        var elt = this.get_element();
        if (!elt) return;
        if (!this.get_isInitialized()) return;
        if (!this._isOpen) return;

        var dtf = Sys.CultureInfo.CurrentCulture.dateTimeFormat;        
        var selectedDate = this.get_selectedDate();
        var visibleDate = this._getEffectiveVisibleDate();
        var todaysDate = this.get_todaysDate(); 
        
        switch (this._mode) {
            case "days":
                
                var firstDayOfWeek = this._getFirstDayOfWeek();
                var daysToBacktrack = visibleDate.getDay() - firstDayOfWeek;
                if (daysToBacktrack <= 0)
                    daysToBacktrack += 7;
                    
                var startDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), visibleDate.getDate() - daysToBacktrack, this._hourOffsetForDst);
                var currentDate = startDate;

                for (var i = 0; i < 7; i++) {
                    var dayCell = this._daysTableHeaderRow.cells[i].firstChild;
                    if (dayCell.firstChild) {
                        dayCell.removeChild(dayCell.firstChild);
                    }
                    dayCell.appendChild(document.createTextNode(dtf.ShortestDayNames[(i + firstDayOfWeek) % 7]));
                }
                for (var week = 0; week < 6; week ++) {
                    var weekRow = this._daysBody.rows[week];
                    for (var dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                        var dayCell = weekRow.cells[dayOfWeek].firstChild;
                        if (dayCell.firstChild) {
                            dayCell.removeChild(dayCell.firstChild);
                        }
                        dayCell.appendChild(document.createTextNode(currentDate.getDate()));
                        dayCell.title = currentDate.localeFormat("D");
                        dayCell.date = currentDate;
                        $common.removeCssClasses(dayCell.parentNode, [ "ajax__calendar_other", "ajax__calendar_active" ]);
                        Sys.UI.DomElement.addCssClass(dayCell.parentNode, this._getCssClass(dayCell.date, 'd'));
                        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, this._hourOffsetForDst);
                    }
                }
                
                this._prevArrow.date = new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1, this._hourOffsetForDst);
                this._nextArrow.date = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1, this._hourOffsetForDst);
                if (this._title.firstChild) {
                    this._title.removeChild(this._title.firstChild);
                }
                this._title.appendChild(document.createTextNode(visibleDate.localeFormat("MMMM, yyyy")));
                this._title.date = visibleDate;

                break;
            case "months":

                for (var i = 0; i < this._monthsBody.rows.length; i++) {
                    var row = this._monthsBody.rows[i];
                    for (var j = 0; j < row.cells.length; j++) {
                        var cell = row.cells[j].firstChild;
                        cell.date = new Date(visibleDate.getFullYear(), cell.month, 1, this._hourOffsetForDst);
                        $common.removeCssClasses(cell.parentNode, [ "ajax__calendar_other", "ajax__calendar_active" ]);
                        Sys.UI.DomElement.addCssClass(cell.parentNode, this._getCssClass(cell.date, 'M'));
                    }
                }
                
                if (this._title.firstChild) {
                    this._title.removeChild(this._title.firstChild);
                }
                this._title.appendChild(document.createTextNode(visibleDate.localeFormat("yyyy")));
                this._title.date = visibleDate;
                this._prevArrow.date = new Date(visibleDate.getFullYear() - 1, 0, 1, this._hourOffsetForDst);
                this._nextArrow.date = new Date(visibleDate.getFullYear() + 1, 0, 1, this._hourOffsetForDst);

                break;
            case "years":

                var minYear = (Math.floor(visibleDate.getFullYear() / 10) * 10);
                for (var i = 0; i < this._yearsBody.rows.length; i++) {
                    var row = this._yearsBody.rows[i];
                    for (var j = 0; j < row.cells.length; j++) {
                        var cell = row.cells[j].firstChild;
                        cell.date = new Date(minYear + cell.year, 0, 1, this._hourOffsetForDst);
                        if (cell.firstChild) {
                            cell.removeChild(cell.lastChild);
                        } else {
                            cell.appendChild(document.createElement("br"));
                        }
                        cell.appendChild(document.createTextNode(minYear + cell.year));
                        $common.removeCssClasses(cell.parentNode, [ "ajax__calendar_other", "ajax__calendar_active" ]);
                        Sys.UI.DomElement.addCssClass(cell.parentNode, this._getCssClass(cell.date, 'y'));
                    }
                }

                if (this._title.firstChild) {
                    this._title.removeChild(this._title.firstChild);
                }
                this._title.appendChild(document.createTextNode(minYear.toString() + "-" + (minYear + 9).toString()));
                this._title.date = visibleDate;
                this._prevArrow.date = new Date(minYear - 10, 0, 1, this._hourOffsetForDst);
                this._nextArrow.date = new Date(minYear + 10, 0, 1, this._hourOffsetForDst);

                break;
        }
        if (this._today.firstChild) {
            this._today.removeChild(this._today.firstChild);
        }
        this._today.appendChild(document.createTextNode(String.format(AjaxControlToolkit.Resources.Calendar_Today, todaysDate.localeFormat("MMMM d, yyyy"))));
        this._today.date = todaysDate;        
    },
    
    _ensureCalendar : function() {
    
        if (!this._container) {
            
            var elt = this.get_element();
        
            this._buildCalendar();
            this._buildHeader();
            this._buildBody();
            this._buildFooter();
            
            this._popupBehavior = new $create(AjaxControlToolkit.PopupBehavior, { parentElement : elt }, {}, {}, this._popupDiv);
            if (this._popupPosition == AjaxControlToolkit.CalendarPosition.TopLeft) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.TopLeft);
            } else if (this._popupPosition == AjaxControlToolkit.CalendarPosition.TopRight) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.TopRight);
            } else if (this._popupPosition == AjaxControlToolkit.CalendarPosition.BottomRight) {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.BottomRight);
            } else {
                this._popupBehavior.set_positioningMode(AjaxControlToolkit.PositioningMode.BottomLeft);
            }
        }
    },
    
    _fireChanged : function() {
        /// <summary>
        /// Attempts to fire the change event on the attached textbox
        /// </summary>
        
        var elt = this.get_element();
        if (document.createEventObject) {
            elt.fireEvent("onchange");
        } else if (document.createEvent) {
            var e = document.createEvent("HTMLEvents");
            e.initEvent("change", true, true);
            elt.dispatchEvent(e);
        }
    },
    _switchMonth : function(date, dontAnimate) {
        /// <summary>
        /// Switches the visible month in the days view
        /// </summary>
        /// <param name="date" type="Date">The visible date to switch to</param>
        /// <param name="dontAnimate" type="Boolean">Prevents animation from occuring if the control is animated</param>
        
        // Check _isAnimating to make sure we don't animate horizontally and vertically at the same time
        if (this._isAnimating) {
            return;
        }
        
        var visibleDate = this._getEffectiveVisibleDate();
        if ((date && date.getFullYear() == visibleDate.getFullYear() && date.getMonth() == visibleDate.getMonth())) {
            dontAnimate = true;
        }
        
        if (this._animated && !dontAnimate) {
            this._isAnimating = true;
            
            var newElement = this._modes[this._mode];
            var oldElement = newElement.cloneNode(true);
            this._body.appendChild(oldElement);
            if (visibleDate > date) {

                // animating down
                // the newIndex element is the top
                // the oldIndex element is the bottom (visible)
                
                // move in, fade in
                $common.setLocation(newElement, {x:-162,y:0});
                $common.setVisible(newElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("left");
                this._modeChangeMoveTopOrLeftAnimation.set_target(newElement);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(-this._width);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(0);
                
                // move out, fade out
                $common.setLocation(oldElement, {x:0,y:0});
                $common.setVisible(oldElement, true);
                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("left");
                this._modeChangeMoveBottomOrRightAnimation.set_target(oldElement);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(this._width);

            } else {
                // animating up
                // the oldIndex element is the top (visible)
                // the newIndex element is the bottom
                
                // move out, fade out
                $common.setLocation(oldElement, {x:0,y:0});
                $common.setVisible(oldElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("left");
                this._modeChangeMoveTopOrLeftAnimation.set_target(oldElement);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(-this._width);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(0);

                // move in, fade in
                $common.setLocation(newElement, {x:162,y:0});
                $common.setVisible(newElement, true);
                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("left");
                this._modeChangeMoveBottomOrRightAnimation.set_target(newElement);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(this._width);
            }
            this._visibleDate = date;
            this.invalidate();
            
            var endHandler = Function.createDelegate(this, function() { 
                this._body.removeChild(oldElement);
                oldElement = null;
                this._isAnimating = false;
                this._modeChangeAnimation.remove_ended(endHandler);
            });
            this._modeChangeAnimation.add_ended(endHandler);
            this._modeChangeAnimation.play();
        } else {
            this._visibleDate = date;
            this.invalidate();
        }
    },
    _switchMode : function(mode, dontAnimate) {
        /// <summary>
        /// Switches the visible view from "days" to "months" to "years"
        /// </summary>
        /// <param name="mode" type="String">The view mode to switch to</param>
        /// <param name="dontAnimate" type="Boolean">Prevents animation from occuring if the control is animated</param>
        
        // Check _isAnimating to make sure we don't animate horizontally and vertically at the same time
        if (this._isAnimating || (this._mode == mode)) {
            return;
        }
        
        var moveDown = this._modeOrder[this._mode] < this._modeOrder[mode];
        var oldElement = this._modes[this._mode];
        var newElement = this._modes[mode];
        this._mode = mode;
                
        if (this._animated && !dontAnimate) { 
            this._isAnimating = true;
            
            this.invalidate();
            
            if (moveDown) {
                // animating down
                // the newIndex element is the top
                // the oldIndex element is the bottom (visible)
                
                // move in, fade in
                $common.setLocation(newElement, {x:0,y:-this._height});
                $common.setVisible(newElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("top");
                this._modeChangeMoveTopOrLeftAnimation.set_target(newElement);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(-this._height);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(0);
                
                // move out, fade out
                $common.setLocation(oldElement, {x:0,y:0});
                $common.setVisible(oldElement, true);

                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("top");
                this._modeChangeMoveBottomOrRightAnimation.set_target(oldElement);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(this._height);

            } else {
                // animating up
                // the oldIndex element is the top (visible)
                // the newIndex element is the bottom
                
                // move out, fade out
                $common.setLocation(oldElement, {x:0,y:0});
                $common.setVisible(oldElement, true);
                this._modeChangeMoveTopOrLeftAnimation.set_propertyKey("top");
                this._modeChangeMoveTopOrLeftAnimation.set_target(oldElement);
                this._modeChangeMoveTopOrLeftAnimation.set_endValue(-this._height);
                this._modeChangeMoveTopOrLeftAnimation.set_startValue(0);

                // move in, fade in
                $common.setLocation(newElement, {x:0,y:139});
                $common.setVisible(newElement, true);
                this._modeChangeMoveBottomOrRightAnimation.set_propertyKey("top");
                this._modeChangeMoveBottomOrRightAnimation.set_target(newElement);
                this._modeChangeMoveBottomOrRightAnimation.set_endValue(0);
                this._modeChangeMoveBottomOrRightAnimation.set_startValue(this._height);
            }
            var endHandler = Function.createDelegate(this, function() { 
                this._isAnimating = false;
                this._modeChangeAnimation.remove_ended(endHandler);
            });
            this._modeChangeAnimation.add_ended(endHandler);
            this._modeChangeAnimation.play();
        } else {
            this._mode = mode;
            $common.setVisible(oldElement, false);
            this.invalidate();
            $common.setVisible(newElement, true);
            $common.setLocation(newElement, {x:0,y:0});
        }
    },
    _isSelected : function(date, part) {
        /// <summary>
        /// Gets whether the supplied date is the currently selected date
        /// </summary>
        /// <param name="date" type="Date">The date to match</param>
        /// <param name="part" type="String">The most significant part of the date to test</param>
        /// <returns type="Boolean" />
        
        var value = this.get_selectedDate();
        if (!value) return false;
        switch (part) {
            case 'd':
                if (date.getDate() != value.getDate()) return false;
                // goto case 'M';
            case 'M':
                if (date.getMonth() != value.getMonth()) return false;
                // goto case 'y';
            case 'y':
                if (date.getFullYear() != value.getFullYear()) return false;
                break;
        }
        return true;
    },
    _isOther : function(date, part) {
        /// <summary>
        /// Gets whether the supplied date is in a different view from the current visible month
        /// </summary>
        /// <param name="date" type="Date">The date to match</param>
        /// <param name="part" type="String">The most significant part of the date to test</param>
        /// <returns type="Boolean" />

        var value = this._getEffectiveVisibleDate();
        switch (part) {
            case 'd': 
                return (date.getFullYear() != value.getFullYear() || date.getMonth() != value.getMonth());
            case 'M': 
                return false;
            case 'y': 
                var minYear = (Math.floor(value.getFullYear() / 10) * 10);
                return date.getFullYear() < minYear || (minYear + 10) <= date.getFullYear();
        }
        return false;
    },
    _getCssClass : function(date, part) {
        /// <summary>
        /// Gets the cssClass to apply to a cell based on a supplied date
        /// </summary>
        /// <param name="date" type="Date">The date to match</param>
        /// <param name="part" type="String">The most significant part of the date to test</param>
        /// <returns type="String" />

        if (this._isSelected(date, part)) {
            return "ajax__calendar_active";
        } else if (this._isOther(date, part)) {
            return "ajax__calendar_other";
        } else {
            return "";
        }
    },
    _getEffectiveVisibleDate : function() {
        var value = this.get_visibleDate();
        if (value == null) 
            value = this.get_selectedDate();
        if (value == null)
            value = this.get_todaysDate();
        return new Date(value.getFullYear(), value.getMonth(), 1, this._hourOffsetForDst);
    },
    _getFirstDayOfWeek : function() {
        /// <summary>
        /// Gets the first day of the week
        /// </summary>
        
        if (this.get_firstDayOfWeek() != AjaxControlToolkit.FirstDayOfWeek.Default) {
            return this.get_firstDayOfWeek();
        }
        return Sys.CultureInfo.CurrentCulture.dateTimeFormat.FirstDayOfWeek;
    },
    _parseTextValue : function(text) {
        /// <summary>
        /// Converts a text value from the textbox into a date
        /// </summary>
        /// <param name="text" type="String" mayBeNull="true">The text value to parse</param>
        /// <returns type="Date" />
        
        var value = null;
        if(text) {
            value = Date.parseLocale(text, this.get_format());
        }
        if(isNaN(value)) {
            value = null;
        }
        return value;
    },
    
    _element_onfocus : function(e) {
        /// <summary> 
        /// Handles the focus event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;        
        if (!this._button) {
            this.show();
            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },
    _element_onblur : function(e) {
        /// <summary> 
        /// Handles the blur event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>        
        if (!this._enabled) return;        
        if (!this._button) {
            this.blur();
        }
    },
    _element_onchange : function(e) {
        /// <summary> 
        /// Handles the change event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._selectedDateChanging) {
            var value = this._parseTextValue(this._textbox.get_Value());
            if (value) value = value.getDateOnly();
            this._selectedDate = value;
            if (this._isOpen) {
                this._switchMonth(this._selectedDate, this._selectedDate == null);
            }   
        }
    },
    _element_onkeypress : function(e) {
        /// <summary>
        /// Handles the keypress event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._button && e.charCode == Sys.UI.Key.esc) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }
    },
    _element_onclick : function(e) {
        /// <summary>
        /// Handles the click event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._button) {
            this.show();
            // make sure we clean up the flag due to issues with alert/alt-tab/etc
            this._popupMouseDown = false;
        }
    },

    _popup_onevent : function(e) {
        /// <summary> 
        /// Handles the drag-start event of the popup calendar
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        e.stopPropagation();
        e.preventDefault();
    },
    _popup_onmousedown : function(e) {
        /// <summary> 
        /// Handles the mousedown event of the popup
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        
        // signal that the popup has received a mousedown event, this handles
        // onblur issues on browsers like FF, OP, and SF
        this._popupMouseDown = true;        
    },
    _popup_onmouseup : function(e) {
        /// <summary> 
        /// Handles the mouseup event of the popup
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        
        // signal that the popup has received a mouseup event, this handles
        // onblur issues on browsers like FF, OP, and SF
        if (Sys.Browser.agent === Sys.Browser.Opera && this._blur.get_isPending()) {
            this._blur.cancel();
        }
        this._popupMouseDown = false;
        this.focus();
    },

    _cell_onmouseover : function(e) {
        /// <summary> 
        /// Handles the mouseover event of a cell
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.stopPropagation();

        if (Sys.Browser.agent === Sys.Browser.Safari) {
            // Safari doesn't reliably call _cell_onmouseout, so clear other cells here to keep the UI correct
            for (var i = 0; i < this._daysBody.rows.length; i++) {
                var row = this._daysBody.rows[i];
                for (var j = 0; j < row.cells.length; j++) {
                    Sys.UI.DomElement.removeCssClass(row.cells[j].firstChild.parentNode, "ajax__calendar_hover");
                }
            }
        }

        var target = e.target;

        Sys.UI.DomElement.addCssClass(target.parentNode, "ajax__calendar_hover");
    },
    _cell_onmouseout : function(e) {
        /// <summary> 
        /// Handles the mouseout event of a cell
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.stopPropagation();

        var target = e.target;

        Sys.UI.DomElement.removeCssClass(target.parentNode, "ajax__calendar_hover");
    },
    _cell_onclick : function(e) {
        /// <summary> 
        /// Handles the click event of a cell
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        
        e.stopPropagation();
        e.preventDefault();

        if (!this._enabled) return;

        var target = e.target;
        var visibleDate = this._getEffectiveVisibleDate();
        Sys.UI.DomElement.removeCssClass(target.parentNode, "ajax__calendar_hover");
        switch(target.mode) {
            case "prev":
            case "next":
                this._switchMonth(target.date);
                break;
            case "title":
                switch (this._mode) {
                    case "days": this._switchMode("months"); break;
                    case "months": this._switchMode("years"); break;
                }
                break;
            case "month":
                if (target.month == visibleDate.getMonth()) {
                    this._switchMode("days");
                } else {
                    this._visibleDate = target.date;
                    this._switchMode("days");
                }
                break;
            case "year":
                if (target.date.getFullYear() == visibleDate.getFullYear()) {
                    this._switchMode("months");
                } else {
                    this._visibleDate = target.date;
                    this._switchMode("months");
                }
                break;
            case "day":
                this.set_selectedDate(target.date);
                this._switchMonth(target.date);
                this._blur.post(true);
                this.raiseDateSelectionChanged();
                break;
            case "today":
                this.set_selectedDate(target.date);
                this._switchMonth(target.date);
                this._blur.post(true);
                this.raiseDateSelectionChanged();
                break;
        }
    },

    _button_onclick : function(e) {
        /// <summary> 
        /// Handles the click event of the asociated button
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>

        e.preventDefault();
        e.stopPropagation();

        if (!this._enabled) return;

        if (!this._isOpen) {
            this.show();
        } else {
            this.hide();
        }
        this.focus();
        // make sure we clean up the flag due to issues with alert/alt-tab/etc
        this._popupMouseDown = false;
    },
    _button_onblur : function(e) {
        /// <summary> 
        /// Handles the blur event of the button
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (!this._popupMouseDown) {
            this.hide();
        }
        // make sure we clean up the flag due to issues with alert/alt-tab/etc
        this._popupMouseDown = false;
    },
    _button_onkeypress : function(e) {
        /// <summary>
        /// Handles the keypress event of the element
        /// </summary>
        /// <param name="e" type="Sys.UI.DomEvent">The arguments for the event</param>
        if (!this._enabled) return;
        if (e.charCode == Sys.UI.Key.esc) {
            e.stopPropagation();
            e.preventDefault();
            this.hide();
        }
        // make sure we clean up the flag due to issues with alert/alt-tab/etc
        this._popupMouseDown = false;
    }
}
AjaxControlToolkit.CalendarBehavior.registerClass("AjaxControlToolkit.CalendarBehavior", AjaxControlToolkit.BehaviorBase);

AjaxControlToolkit.CalendarPosition = function() {
    /// <summary>
    /// Position of the popup relative to the target control
    /// </summary>
    /// <field name="BottomLeft" type="Number" integer="true" />
    /// <field name="BottomRight" type="Number" integer="true" />
    /// <field name="TopLeft" type="Number" integer="true" />
    /// <field name="TopRight" type="Number" integer="true" />
    throw Error.invalidOperation();
}
AjaxControlToolkit.CalendarPosition.prototype = {
    BottomLeft: 0,
    BottomRight: 1,
    TopLeft: 2,
    TopRight: 3
}
AjaxControlToolkit.CalendarPosition.registerEnum('AjaxControlToolkit.CalendarPosition');
//END AjaxControlToolkit.Calendar.CalendarBehavior.js
//START AjaxControlToolkit.MaskedEdit.MaskedEditValidator.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../Common/Common.js" />


// Product      : MaskedEdit Validator Control
// Version      : 1.0.0.0
// Date         : 11/08/2006
// Development  : Fernando Cerqueira 
// Version      : 1.0.0.1
// Development  : 02/22/2007 Fernando Cerqueira 
//
function MaskedEditSetMessage(value,msg,txt)
{
    value.errormessage = msg;
    if (txt == "")
    {
        value.text = msg;
    }
    else
    {
        value.text = txt;
    }
    value.innerHTML = value.text;
}
function MaskedEditMessageShow(value,IsValid)
{
    if (typeof(value.display) == "string") 
    {    
        if (value.display == "None") {
            return;
        }
        if (value.display == "Dynamic") {
            value.style.display = IsValid ? "none" : "inline";
            return;
        }
    }
    value.style.visibility = IsValid ? "hidden" : "visible";
}
function MaskedEditSetCssClass(value,Css)
{
    var target = $get(value.TargetValidator); 
    Sys.UI.DomElement.removeCssClass(target,value.InvalidValueCssClass);
    Sys.UI.DomElement.removeCssClass(target,value.CssBlurNegative);
    Sys.UI.DomElement.removeCssClass(target,value.CssFocus);
    Sys.UI.DomElement.removeCssClass(target,value.CssFocusNegative);
    if (Css != "")
    {
        Sys.UI.DomElement.addCssClass(target,Css);
    }
}
function MaskedEditValidatorDateTime(value)
{
    MaskedEditSetMessage(value,"","");
    MaskedEditSetCssClass(value,"");
    MaskedEditMessageShow(value,true);
    if (value.IsMaskedEdit == "false")
    {
        return true;
    }
    var target = $get(value.TargetValidator); 
    if (value.ValidEmpty  == "false")
    {
        if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == value.InitialValue)
        {
            MaskedEditSetMessage(value,value.EmptyValueMessage,value.EmptyValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == "")
    {
        return true;
    }
    var ret = true;
    var mask = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value();
    //regular Exp
    if (value.ValidationExpression != "" )
    {
        var rx = new RegExp(value.ValidationExpression);
        var matches = rx.exec(mask);
        ret = (matches != null && mask == matches[0]);
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    var PartDate = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value().split(" ")[0];
    var PartTime = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value().split(" ")[1];
    if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value().split(" ").length == 3)
    {
        PartTime += " " + AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value().split(" ")[2];
    }
    var MinVlDt = "";
    var MinVlTm = "";
    if (value.MinimumValue != "")
    {
        MinVlDt = value.MinimumValue.split(" ")[0];
        MinVlTm = value.MinimumValue.split(" ")[1];
    }
    var MaxVlDt = "";
    var MaxVlTm = "";
    if (value.MaximumValue != "")
    {
        MaxVlDt = value.MaximumValue.split(" ")[0];
        MaxVlTm = value.MaximumValue.split(" ")[1];
    }
    ret = MaskedEditValidatorPartDate(value,PartDate,MinVlDt,MaxVlDt);
    if (ret)
    {
        ret = MaskedEditValidatorPartTime(value,PartTime,MinVlTm,MaxVlTm);
    }
    //custom valid
    if (ret && value.ClientValidationFunction != "")
    {
        var args = { Value:mask, IsValid:true };
        eval(value.ClientValidationFunction + "(value, args);");
        ret = args.IsValid;
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        }
    }
    if (!ret)
    {
        MaskedEditMessageShow(value,ret);
    }
    return ret;
}
function MaskedEditValidatorPartTime(value,mask,MinVl,MaxVl)
{
    var ret = true;
    var AttibTmSep = value.TimeSeparator;
    var AttibTmSyb = value.AmPmSymbol;
    // hh:mm or hh:mm:ss  
    var SybTm = AttibTmSyb.split(";");
    var tm = AttibTmSyb.replace(";","|");
    var reg1 = "^(^([0][0-9]|[1][0-2])"+ AttibTmSep + "([0-5][0-9])" + AttibTmSep + "([0-5][0-9])\\s("+tm+")$)|(^([0][0-9]|[1][0-2])" + AttibTmSep + "([0-5][0-9])\\s("+tm+")$)$";
    var reg2 = "^(^([0-1][0-9]|[2][0-3])" + AttibTmSep + "([0-5][0-9])" + AttibTmSep + "([0-5][0-9])$)|(^([0-1][0-9]|[2][0-3])" + AttibTmSep + "([0-5][0-9])$)$";
    var H=-1;
    var M=-1;
    var S=-1;
    var aux = "";
    var m_arrValue = mask.split(AttibTmSep);
    var regex1 = new RegExp(reg1);
    var matches1 = regex1.exec(mask);
    var regex2 = new RegExp(reg2);
    var matches2 = regex2.exec(mask);
    if  (matches1 && (matches1[0] == mask))
    {
        aux = mask.substring(mask.length-2).substring(0,1);
        H = parseInt(m_arrValue[0],10);
        if (aux.toUpperCase() == SybTm[1].substring(0,1).toUpperCase())
        {
            H += 12;
            if (H == 24)
            {
                H = 0;
            }
        }
        M = parseInt(m_arrValue[1],10);
        S = (value.length > 9?parseInt(m_arrValue[2].substring(0,2),10):0);
    }
    else if (matches2 && (matches2[0] == mask))
    {
        H = parseInt(m_arrValue[0],10);
        M = parseInt(m_arrValue[1],10);
        S = (mask.length > 5?parseInt(m_arrValue[2],10):0);
    }
    if (H==-1 || M==-1 || S==-1)
    {
        ret = false;
    }
    if (!ret)
    {
        MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
        MaskedEditSetCssClass(value,value.InvalidValueCssClass);
    }
    if(ret && (MaxVl != "" || MinVl != ""))
    {
        var Hr;
        var Mr;
        var Sr;
        var m_arr;
        if (MinVl != "" )
        {
            Hr=-1;
            Mr=-1;
            Sr=-1;
            m_arr = MinVl.split(AttibTmSep);
            matches1 = regex1.exec(MinVl);
            matches2 = regex2.exec(MinVl);
            if (matches1 && (matches1[0] == MinVl))
            {
                aux = MinVl.substring(MinVl.length-2).substring(0,1);
                Hr = parseInt(m_arr[0],10);
                if (aux.toUpperCase() == SybTm[1].substring(0,1).toUpperCase())
                {
                    Hr += 12;
                    if (Hr == 24)
                    {
                        Hr = 0;
                    }
                }
                Mr = parseInt(m_arr[1],10);
                Sr = (MinVl.length > 9?parseInt(m_arr[2].substring(0,2),10):0);
            }
            else if (matches2 && (matches2[0] == MinVl))
            {
                Hr = parseInt(m_arr[0],10);
                Mr = parseInt(m_arr[1],10);
                Sr = (MinVl.length > 5?parseInt(m_arr[2],10):0);
            }
            ret = (H > Hr || (H == Hr && M > Mr) || (H == Hr && M == Mr && S >= Sr));
            if (!ret)
            {
                MaskedEditSetMessage(value,value.MinimumValueMessage,value.MinimumValueText);
                MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            }
        }
        if (MaxVl != "" && ret)
        {
            Hr=-1;
            Mr=-1;
            Sr=-1;
            m_arr = MaxVl.split(AttibTmSep);
            matches1 = regex1.exec(MaxVl);
            matches2 = regex2.exec(MaxVl);
            if  (matches1 && (matches1[0] == MaxVl))
            {
                aux = MaxVl.substring(MaxVl.length-2).substring(0,1);
                Hr = parseInt(m_arr[0],10);
                if (aux.toUpperCase() == SybTm[1].substring(0,1).toUpperCase())
                {
                    Hr += 12;
                    if (Hr == 24)
                    {
                        Hr = 0;
                    }
                }
                Mr = parseInt(m_arr[1],10);
                Sr = (MaxVl.length > 9?parseInt(m_arr[2].substring(0,2),10):0);
            }
            else if (matches2 && (matches2[0] == MaxVl))
            {
                Hr = parseInt(m_arr[0],10);
                Mr = parseInt(m_arr[1],10);
                Sr = (MaxVl.length > 5?parseInt(m_arr[2],10):0);
            }
            ret = (H < Hr || (H == Hr && M < Mr) || (H == Hr && M == Mr && S <= Sr));
            if (!ret)
            {
                MaskedEditSetMessage(value,value.MaximumValueMessage,value.MaximumValueText);
                MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            }
        }
    }
    return ret;
}
function MaskedEditValidatorPartDate(value,mask,MinVl,MaxVl)
{
    var ret = true;
    var AttibDtFmt = value.DateFormat;
    var AttibDtSep = value.DateSeparator;
    var m_arrDate = mask.split(AttibDtSep);
    if (parseInt(m_arrDate.length,10) != 3)
    {
        MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
        MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        ret = false;
    }
    if (AttibDtFmt.indexOf("D") == -1 || AttibDtFmt.indexOf("M") == -1 || AttibDtFmt.indexOf("Y") == -1)
    {
        MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
        MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        ret = false;
    }
    var D = -1;
    var M = -1;
    var Y = -1;
    if (ret)
    {
        D = parseInt(m_arrDate[AttibDtFmt.indexOf("D")],10);
        M = parseInt(m_arrDate[AttibDtFmt.indexOf("M")],10);
        Y = parseInt(m_arrDate[AttibDtFmt.indexOf("Y")],10)
        if (Y < 100)
        {
            Y = parseInt(Y + value.Century,10);
        }
        else if (Y < 999)
        {
            Y += parseInt(value.Century.substring(0,1) + Y,10)
        }
        ret = (D>0 && M>0 && Y>0 && (D<=[,31,28,31,30,31,30,31,31,30,31,30,31][M] || D==29 && M==2 && Y%4==0 && (Y%100>0 || Y%400==0)));
    }
    if (!ret)
    {
        MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
        MaskedEditSetCssClass(value,value.InvalidValueCssClass);
    }
    if(ret && (MaxVl != "" || MinVl != ""))
    {
       var m_arr;
       var Dr=-1;
       var Mr=-1;
       var Yr=-1;
       if (MinVl != "")
       {
            m_arr = MinVl.split(AttibDtSep);
            Dr = parseInt(m_arr[AttibDtFmt.indexOf("D")],10);
            Mr = parseInt(m_arr[AttibDtFmt.indexOf("M")],10);
            Yr = parseInt(m_arr[AttibDtFmt.indexOf("Y")],10);
            if (Yr < 100)
            {
                Yr = parseInt(Yr + value.Century,10);
            }
            else if (Yr < 999)
            {
                Yr += parseInt(value.Century.substring(0,1) + Yr,10)
            }
            ret = (Dr>0 && Mr>0 && Yr>0 && Y > Yr || (Y == Yr && M > Mr) || (Y == Yr && M == Mr && D >= Dr));
            if (!ret)
            {
                MaskedEditSetMessage(value,value.MinimumValueMessage,value.MinimumValueText);
                MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            }
       }
       if (ret && MaxVl != "")
       {
            m_arr = MaxVl.split(AttibDtSep);
            Dr = parseInt(m_arr[AttibDtFmt.indexOf("D")],10);
            Mr = parseInt(m_arr[AttibDtFmt.indexOf("M")],10);
            Yr = parseInt(m_arr[AttibDtFmt.indexOf("Y")],10);
            if (Yr < 100)
            {
                Yr = parseInt(Yr + value.Century,10);
            }
            else if (Yr < 999)
            {
                Yr += parseInt(value.Century.substring(0,1) + Yr,10)
            }
            ret = (Dr>0 && Mr>0 && Yr>0 && Y < Yr || (Y == Yr && M < Mr) || (Y == Yr && M == Mr && D <= Dr));
            if (!ret)
            {
                MaskedEditSetMessage(value,value.MaximumValueMessage,value.MaximumValueText);
                MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            }
       }
    }
    return ret;
}
function MaskedEditValidatorDate(value)
{

    MaskedEditSetMessage(value,"","");
    MaskedEditSetCssClass(value,"");
    MaskedEditMessageShow(value,true);
    if (value.IsMaskedEdit == "false")
    {
        return true;
    }
    var target = $get(value.TargetValidator); 
    if (value.ValidEmpty  == "false")
    {
        if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == value.InitialValue)
        {
            MaskedEditSetMessage(value,value.EmptyValueMessage,value.EmptyValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == "")
    {
        return true;
    }
    var ret = true;
    var mask = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value();
    //regular Exp
    if (value.ValidationExpression != "" )
    {
        var rx = new RegExp(value.ValidationExpression);
        var matches = rx.exec(mask);
        ret = (matches != null && mask == matches[0]);
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    ret = MaskedEditValidatorPartDate(value,mask,value.MinimumValue,value.MaximumValue);
    if (ret && value.ClientValidationFunction != "")
    {
        var args = { Value:mask, IsValid:true };
        eval(value.ClientValidationFunction + "(value, args);");
        ret = args.IsValid;
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        }
    }
    if (!ret)
    {
        MaskedEditMessageShow(value,ret);
    }
    return ret;
}
//  Validator time
function MaskedEditValidatorTime(value)
{
    MaskedEditSetMessage(value,"","");
    MaskedEditSetCssClass(value,"");
    MaskedEditMessageShow(value,true);
    if (value.IsMaskedEdit == "false")
    {
        return true;
    }
    var target = $get(value.TargetValidator); 
    if (value.ValidEmpty  == "false")
    {
        if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == value.InitialValue)
        {
            MaskedEditSetMessage(value,value.EmptyValueMessage,value.EmptyValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == "")
    {
        return true;
    }
    var ret = true;
    var mask = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value();
    //regular Exp
    if (value.ValidationExpression != "" )
    {
        var rx = new RegExp(value.ValidationExpression);
        var matches = rx.exec(mask);
        ret = (matches != null && mask == matches[0]);
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    ret = MaskedEditValidatorPartTime(value,mask,value.MinimumValue,value.MaximumValue);
    if (ret && value.ClientValidationFunction != "")
    {
        var args = { Value:mask, IsValid:true };
        eval(value.ClientValidationFunction + "(value, args);");
        ret = args.IsValid;
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        }
    }
    if (!ret)
    {
        MaskedEditMessageShow(value,ret);
    }
    return ret;        
}
//  Validator Number
function MaskedEditValidatorNumber(value)
{
    MaskedEditSetMessage(value,"","");
    MaskedEditSetCssClass(value,"");
    MaskedEditMessageShow(value,true);
    if (value.IsMaskedEdit == "false")
    {
        return true;
    }
    var target = $get(value.TargetValidator); 
    if (value.ValidEmpty  == "false")
    {
        if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == value.InitialValue)
        {
            MaskedEditSetMessage(value,value.EmptyValueMessage,value.EmptyValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == "")
    {
        return true;
    }
    var ret = true;
    var AttibThSep = value.Thousands;
    var AttibDcSep = value.Decimal;
    var AttibCuSyb = value.Money;
    var AttibLastPos = value.LastMaskPosition + AttibCuSyb.length + 1;
    
    var mask = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value();

    if (value.ValidationExpression != "" )
    {
        var rx = new RegExp(value.ValidationExpression);
        var matches = rx.exec(mask);
        ret = (matches != null && mask == matches[0]);
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    ret = false;
    var cleanInput = null;
    var exp  = null;
    var m = null;
    var num = null;
    var Compnum = null;
    mask = mask.replace(new RegExp("(\\" + AttibThSep + ")", "g"), "");
    mask = mask.replace(new RegExp("(\\" + AttibCuSyb + ")", "g"), "");
    //trim
    m = mask.match(/^\s*(\S+(\s+\S+)*)\s*$/);
    if (m != null)
    {
        mask = m[1];
    }
    //integer
    exp = /^\s*[-\+]?\d+\s*$/;
    if (mask.match(exp) != null) 
    {
        num = parseInt(mask, 10);
        ret = (num == (isNaN(num) ? null : num));
    }
    if (ret)
    {
        if (value.MaximumValue != "")
        {
            Compnum = parseInt(value.MaximumValue, 10);
            if (Compnum == (isNaN(Compnum) ? null : Compnum))
            {
                if (num > Compnum)
                {
                    ret = false;
                    MaskedEditSetMessage(value,value.MaximumValueMessage,value.MaximumValueText);
                    MaskedEditSetCssClass(value,value.InvalidValueCssClass);
                }
            }
        }
        if (ret && value.MinimumValue != "")
        {
            Compnum = parseInt(value.MinimumValue, 10);
            if (Compnum == (isNaN(Compnum) ? null : Compnum))
            {
                if (num < Compnum)
                {
                    ret = false;
                    MaskedEditSetMessage(value,value.MinimumValueMessage,value.MinimumValueText);
                    MaskedEditSetCssClass(value,value.InvalidValueCssClass);
                }
            }
        }
    }
    else
    {
        //float
        exp = new RegExp("^\\s*([-\\+])?(\\d+)?(\\" + AttibDcSep + "(\\d+))?\\s*$");
        m = mask.match(exp);
        if (m != null)
        {
            cleanInput = null;
            if  (typeof(m[1]) != "undefined")
            {
                cleanInput = m[1] + (m[2].length>0 ? m[2] : "0") + "." + m[4];
            }
            else
            {
                cleanInput = (m[2].length>0 ? m[2] : "0") + "." + m[4];
            }
            num = parseFloat(cleanInput);
            ret = (num == (isNaN(num) ? null : num));            
        }
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        }
        if (ret)
        {
            if (value.MaximumValue != "")
            {
                Compnum = parseFloat(value.MaximumValue);
                if (Compnum == (isNaN(Compnum) ? null : Compnum))
                {
                    if (num > Compnum)
                    {
                        ret = false;
                        MaskedEditSetMessage(value,value.MaximumValueMessage,value.MaximumValueText);
                        MaskedEditSetCssClass(value,value.InvalidValueCssClass);
                    }
                }
            }
            if (ret && value.MinimumValue != "")
            {
                Compnum = parseFloat(value.MinimumValue);
                if (Compnum == (isNaN(Compnum) ? null : Compnum))
                {
                    if (num < Compnum)
                    {
                        ret = false;
                        MaskedEditSetMessage(value,value.MinimumValueMessage,value.MinimumValueText);
                        MaskedEditSetCssClass(value,value.InvalidValueCssClass);
                    }
                }
            }
        }
    }
    if (ret && value.ClientValidationFunction != "")
    {
        var args = { Value:mask, IsValid:true };
        eval(value.ClientValidationFunction + "(value, args);");
        ret = args.IsValid;
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        }
    }
    if (!ret)
    {
        MaskedEditMessageShow(value,ret);
    }
    return ret;        
}
//  Validator None
function MaskedEditValidatorNone(value)
{
    MaskedEditSetMessage(value,"","");
    MaskedEditSetCssClass(value,"");
    MaskedEditMessageShow(value,true);
    if (value.IsMaskedEdit == "false")
    {
        return true;
    }
    var target = $get(value.TargetValidator); 
    if (value.ValidEmpty  == "false")
    {
        if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == value.InitialValue)
        {
            MaskedEditSetMessage(value,value.EmptyValueMessage,value.EmptyValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    if (AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value() == "")
    {
        return true;
    }
    var ret = true;
    var mask = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(target).get_Value();
    if (value.ValidationExpression != "" )
    {
        var rx = new RegExp(value.ValidationExpression);
        var matches = rx.exec(mask);
        ret = (matches != null && mask == matches[0]);
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
            MaskedEditMessageShow(value,false);
            return false;
        }
    }
    var exp = /^\d+\s*$/;
    var num = null;
    if (value.MaximumValue != "")
    {
        if (value.MaximumValue.match(exp) != null) 
        {
            num = parseInt(value.MaximumValue, 10);
            if (num == (isNaN(num) ? null : num))
            {
                if (mask.length > num)
                {
                    ret = false;
                    MaskedEditSetMessage(value,value.MaximumValueMessage,value.MaximumValueText);
                    MaskedEditSetCssClass(value,value.InvalidValueCssClass);
                }
            }
        }
    }
    if (ret && value.MinimumValue != "")
    {
        if (value.MinimumValue.match(exp) != null) 
        {
            num = parseInt(value.MinimumValue, 10);
            if (num == (isNaN(num) ? null : num))
            {
                if (mask.length < num)
                {
                    ret = false;
                    MaskedEditSetMessage(value,value.MinimumValueMessage,value.MinimumValueText);
                    MaskedEditSetCssClass(value,value.InvalidValueCssClass);
                }
            }
        }
    }
    if (ret && value.ClientValidationFunction != "")
    {
        var args = { Value:mask, IsValid:true };
        eval(value.ClientValidationFunction + "(value, args);");
        ret = args.IsValid;
        if (!ret)
        {
            MaskedEditSetMessage(value,value.InvalidValueMessage,value.InvalidValueText);
            MaskedEditSetCssClass(value,value.InvalidValueCssClass);
        }
    }
    if (!ret)
    {
        MaskedEditMessageShow(value,ret);
    }
    return ret;        
}

//END AjaxControlToolkit.MaskedEdit.MaskedEditValidator.js
//START AjaxControlToolkit.MaskedEdit.MaskedEditBehavior.js
// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Permissive License.
// See http://www.microsoft.com/resources/sharedsource/licensingbasics/sharedsourcelicenses.mspx.
// All other rights reserved.


/// <reference name="MicrosoftAjax.debug.js" />
/// <reference name="MicrosoftAjaxTimer.debug.js" />
/// <reference name="MicrosoftAjaxWebForms.debug.js" />
/// <reference path="../ExtenderBase/BaseScripts.js" />
/// <reference path="../Compat/Timer/Timer.js" />
/// <reference path="../Common/Common.js" />


// Product      : MaskedEdit Extend Control
// Version      : 1.0.0.0
// Date         : 10/23/2006
// Development  : Fernando Cerqueira 
// Version      : 1.0.0.1
// Development  : 02/22/2007 Fernando Cerqueira 
// 
Type.registerNamespace('AjaxControlToolkit');
AjaxControlToolkit.MaskedEditBehavior = function(element) 
{
    AjaxControlToolkit.MaskedEditBehavior.initializeBase(this, [element]);
    // **************************************************
    // Properties
    // **************************************************
    // mask
    this._Mask = "";
    this._MaskType = AjaxControlToolkit.MaskedEditType.None;
    this._Filtered = "";
    this._PromptChar = "_";
    this._InputDirection = AjaxControlToolkit.MaskedEditInputDirections.LeftToRight;
    // Message
    this._MessageValidatorTip = true;
    this._ShowMessageErrorFloat = false;
    this._CssMessageErrorFloat = "";
    // AutoComplete
    this._AutoComplete = true;
    this._AutoCompleteValue =  "";
    // behavior
    this._ClearTextOnInvalid = false;
    this._ClearMaskOnLostfocus = true;
    this._AcceptAmPm = AjaxControlToolkit.MaskedEditShowSymbol.None;
    this._AcceptNegative = AjaxControlToolkit.MaskedEditShowSymbol.None;
    this._DisplayMoney = AjaxControlToolkit.MaskedEditShowSymbol.None;
    // CSS
    this._OnFocusCssClass = "MaskedEditFocus";
    this._OnInvalidCssClass = "MaskedEditError";
    this._OnFocusCssNegative = "MaskedEditFocusNegative";
    this._OnBlurCssNegative = "MaskedEditBlurNegative";
    // globalization 
    this._CultureName = "";
    this._UserDateFormat = AjaxControlToolkit.MaskedEditUserDateFormat.None;
    this._UserTimeFormat = AjaxControlToolkit.MaskedEditUserTimeFormat.None;
    // globalization Hidden 
    this._CultureDatePlaceholder = "";
    this._CultureTimePlaceholder = "";
    this._CultureDecimalPlaceholder = "";
    this._CultureThousandsPlaceholder = "";
    this._CultureDateFormat = "";
    this._CultureCurrencySymbolPlaceholder = "";
    this._CultureAMPMPlaceholder = "";
    this._AMPMPlaceholderSeparator = ";";
    this._Century = 1900;
    // clipboard
    this._AllowCopyPaste = true;
    this._ClipboardText = AjaxControlToolkit.Resources.Shared_BrowserSecurityPreventsPaste;
    // **************************************************
    // local var mask valid
    // **************************************************
    //  9 = only numeric
    //  L = only letter
    //  $ = only letter and spaces
    //  C = only custom - read from this._Filtered
    //  A = only letter and custom
    //  N = only numeric and custom
    //  ? = any digit
    this._CharsEditMask = "9L$CAN?";
    // **************************************************
    // local var special mask
    // **************************************************
    // at runtime replace with culture property
    //  / = Date placeholder
    //  : = Time placeholder
    //  . = Decimal placeholder
    //  , = Thousands placeholder
    this._CharsSpecialMask = "/:.,";
    // **************************************************
    // local converted mask 
    // **************************************************
    // i.e.: 9{2} => 99 , 9{2}/9{2}/9{2} = 99/99/99
    this._MaskConv = "";
    // **************************************************
    // Others local Var
    // **************************************************
    this._EmptyMask = ""; // save Empty Mask
    this._maskvalid = "" // save valid Mask
    this._DirectSelText = ""; // save the Direction selected Text (only for ie)
    this._initialvalue = ""; // save the initial value for verify changed
    this._LogicSymbol = ""; // save the symbol - or AM/PM
    this._LogicTextMask = ""; // save logic mask with text input
    this._LogicMask = ""; // save logic mask without text
    this._LogicMaskConv = ""; // save logic mask without text and without escape
    this._LogicPrompt = String.fromCharCode(1); // logic prompt char
    this._LogicEscape = String.fromCharCode(2); // logic escape char
    this._LogicFirstPos = -1; // first valid position
    this._LogicLastPos = -1; // Last valid position 
    this._LogicLastInt = -1; // Last valid position RTL Integer with decimal
    this._QtdValidInput = 0; // Qtd Valid input Position 
    this._InLostfocus = false; // Flag to validate in lost focus not duplicate clearMask execute
    this._ExternalMessageError = ""; // Save local MessageError from Controls Validator
    this._CurrentMessageError = ""; // Save local Current MessageError
    this._FiringOnChange = false;  // true when OnChange is being fired
    this._ErroOnEnter = false; // Flag Erro validate with Enter
    // **************************************************
    // local chars ANSI
    // **************************************************
    this._charLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this._charNumbers = "0123456789";    
    this._charEscape = "\\";
    // **************************************************
    // local placeholder delimit for info repeat mask
    // **************************************************
    this._DelimitStartDup = "{";
    this._DelimitEndDup = "}";   
    // **************************************************
    // Handler
    // **************************************************
    this._focusHandler = null;
    this._keypressdown = null;
    this._keypressHandler = null;
    this._blurHandler = null;
    this._mouseOutHandler = null;
    this._mouseOutHandler = null;
    this._mouseMoveHandler = null;
    this._mouseEnterHandler = null;
    this._changeHandler = null;
    // **************************************************
    // Only for Opera
    // **************************************************
    this._timer = null; //Timer
    this._timerHandler = null; //Timer Handler
    this._SaveSymb = ""; // Symb Saved immediate perform Action
    this._SaveText = ""; // Text Saved immediate perform Action
    this._SavePosi = -1; // Cursor pos Saved immediate perform Action
    this._SaveMask = ""; // Mask with text Saved 
    this._SaveKeyDown = 0; // save scancode at keydown
}    
AjaxControlToolkit.MaskedEditBehavior.prototype = { 
    initialize : function() 
    {
        var e = this.get_element();

        this._InLostfocus = true;
        AjaxControlToolkit.MaskedEditBehavior.callBaseMethod(this, 'initialize');
        this._createMask();
        // if this textbox is focused initially
        var hasInitialFocus = false;
        var clientState = this.get_ClientState();
        
        if (clientState != null && clientState != "") 
        {
            hasInitialFocus = (clientState == "Focused");
            this.set_ClientState(null);            
        }
        //only for ie , for firefox see keydown
        if (document.activeElement)
        {
            if (e.id == document.activeElement.id)
            {
                hasInitialFocus = true;
            }
        }
        
        // Create delegates Attach events
        if (this._ShowMessageErrorFloat)
        {
            this._mouseOutHandler = Function.createDelegate(this, this._onMouseOut);
            $addHandler(e, "mouseout", this._mouseOutHandler);
            
            this._mouseMoveHandler = Function.createDelegate(this, this._onMouseMove);
            $addHandler(e, "mousemove", this._mouseMoveHandler);

            this._mouseEnterHandler = Function.createDelegate(this, this._onMouseover);                
            $addHandler(e, "mouseover", this._mouseEnterHandler);
        }

        if (!e.readOnly)
        {
            this._keypressdown = Function.createDelegate(this, this._onKeyPressdown);
            $addHandler(e, "keydown", this._keypressdown); 

            this._keypressHandler = Function.createDelegate(this, this._onKeyPress);
            $addHandler(e, "keypress", this._keypressHandler); 
            
        }

        this._focusHandler = Function.createDelegate(this, this._onFocus);
        $addHandler(e, "focus", this._focusHandler);
        this._blurHandler = Function.createDelegate(this, this._onBlur);
        $addHandler(e, "blur", this._blurHandler);
        this._changeHandler = Function.createDelegate(this, this._onChange);
        $addHandler(e, "change", this._changeHandler);
        
        if (Sys.Browser.agent == Sys.Browser.Opera)
        {
            // Create timer
            this._timerHandler = Function.createDelegate(this, this._OnTimerTicket);
            this._timer = new Sys.Timer();
            this._timer.set_enabled(false);
            this._timer.set_interval(100);
            this._timer.add_tick(this._timerHandler);
            this._SaveText = ""; 
            this._SavePosi = -1;
            this._timer.set_enabled(true);
        }

        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        if (this._ClearMaskOnLostfocus)
        {
            this._InitValue(wrapper.get_Value(),true);
        }
        else
        {
            this._InitValue(wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1),true);
        }
        if (hasInitialFocus) 
        {
            this._onFocus();
        }
        else 
        {
            if (this._ClearMaskOnLostfocus)
            {
                wrapper.set_Value(this._getClearMask(wrapper.get_Value()));
            }
            var IsValid = this._CaptureServerValidators();
            if (!IsValid)
            {
                if (this._OnInvalidCssClass != "")
                {
                    this.AddCssClassMaskedEdit(this._OnInvalidCssClass);
                }
            }
        }
    }
    //
    // Detach events this.dispose
    //
    , dispose : function() 
    {
        var e = this.get_element();
        if (this._mouseOutHandler) 
        {
            $removeHandler(e, "mouseout", this._mouseOutHandler);
            this._mouseOutHandler = null;
        }
        if (this._mouseMoveHandler) 
        {
            $removeHandler(e, "mousemove", this._mouseMoveHandler);
            this._mouseMoveHandler = null;
        }
        if (this._mouseEnterHandler) 
        {
            $removeHandler(e, "mouseover", this._mouseEnterHandler);
            this._mouseEnterHandler = null;
        }
        if (this._focusHandler) 
        {
            $removeHandler(e, "focus", this._focusHandler);
            this._focusHandler = null;
        }
        if (this._focusHandler) 
        {
            $removeHandler(e, "focus", this._focusHandler);
            this._focusHandler = null;
        }
        if (this._blurHandler) 
        {
            $removeHandler(e, "blur", this._blurHandler);
            this._blurHandler = null;
        }
        if (this._changeHandler) 
        {
            $removeHandler(e, "change", this._changeHandler);
            this._changeHandler = null;
        }
        if (this._keypressdown) 
        {
            $removeHandler(e, "keydown", this._keypressdown);
            this._keypressdown = null;
        }
        if (this._keypressHandler) 
        {
            $removeHandler(e, "keypress", this._keypressHandler);
            this._keypressHandler = null;
        }
        if (this._timerHandler) {
            this._timer.set_enabled(false);
            this._timerHandler = null;
            this._timer.dispose();
            this._timer = null;
        }
        AjaxControlToolkit.MaskedEditBehavior.callBaseMethod(this, 'dispose');
    }
    //
    // EVENT TARGET
    //
    , _OnTimerTicket : function() 
    {
        this._SaveSymb = "";
        if (this._InLostfocus)
        {
            return;
        }
        this._timer.set_enabled(false);
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        if (this._SaveText != "")                
        {
            wrapper.set_Value(this._SaveText);
            this.setSelectionRange(this._SavePosi,this._SavePosi);
            this._SaveText = ""; 
            this._SavePosi = -1;
            this._SaveMask = wrapper.get_Value();
        }
        else
        {
            if (wrapper.get_Value().length != this._EmptyMask.length)
            {
                wrapper.set_Value(this._SaveMask);
            }
            if (this._timer.get_interval() != 100)
            {
                this._timer.set_interval(100);
            }
        }
        this._timer.set_enabled(true);
    }
    , _onChange : function() 
    {
        if (!this._FiringOnChange) {
            //capture and initialize external input Ex : calendar Extender
            this._onFocus();
        }
    }
    , _onFocus : function() 
    {
        this._InLostfocus = false;
        this._RemoveDivToolTip();
        if (this._OnFocusCssClass != "")
        {
            this.AddCssClassMaskedEdit(this._OnFocusCssClass);
        }
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        this._initialvalue = wrapper.get_Value();
        if (this._ClearMaskOnLostfocus)
        {
            this._InitValue(wrapper.get_Value(),false);
        }
        else
        {
            this._InitValue(wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1),false);
        }
        var ClearText = this._getClearMask();
        var hastip = false;
        if (this._MessageValidatorTip && ClearText == "")
        {
            hastip = true;
        }
        if ( (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime) && this.get_CultureAMPMPlaceholder() != "" && ClearText == "")
        {
            if (this._AcceptAmPm)
            {
                this.InsertAMPM(this.get_CultureAMPMPlaceholder().substring(0,1));
            }
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && ClearText != "")
        {
            if (this._LogicSymbol == "-" && this._OnFocusCssNegative != "")
            {
                this.AddCssClassMaskedEdit(this._OnFocusCssNegative);
            }
        }
        if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
        {
            if (this._LogicLastInt != -1)
            {
                this.setSelectionRange(this._LogicLastInt,this._LogicLastInt);
            }
            else
            {
                this.setSelectionRange(this._LogicLastPos+1,this._LogicLastPos+1);
            }
        }
        else
        {
            if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && ClearText != "")
            {
                var pos = this._getLastEmptyPosition()+1;
                this.setSelectionRange(pos,pos);
            }
            else
            {
                this.setSelectionRange(this._LogicFirstPos,this._LogicFirstPos);
            }
        }
        this.ShowTooltipMessage(false);
        if (hastip)
        {
            this.ShowTooltipMessage(true);
        }
    }
    , _PeforformValidLostFocus : function(isblur) 
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var ClearText = this._getClearMask(wrapper.get_Value());
        if (ClearText == "" && this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._LogicSymbol == "-")
        {
            this.InsertSignal("+");
        }
        // auto format 
        if (ClearText != "" && this._AutoComplete && this._MaskType == AjaxControlToolkit.MaskedEditType.Date)
        {
            this.AutoFormatDate();
        }
        else if (ClearText != "" && this._AutoComplete && this._MaskType == AjaxControlToolkit.MaskedEditType.Time)
        {
            this.AutoFormatTime();
        }
        else if (ClearText != "" && this._AutoComplete && this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            this.AutoFormatDateTime();
        }
        else if (ClearText != "" && this._AutoComplete && this._MaskType == AjaxControlToolkit.MaskedEditType.Number)
        {
            this.AutoFormatNumber();
        }
        // clear mask and set CSS
        if ((this._ClearMaskOnLostfocus && ClearText != "") || (isblur && this._ClearMaskOnLostfocus) )
        {
            wrapper.set_Value(this._getClearMask(wrapper.get_Value()));
        }
        this.AddCssClassMaskedEdit("");
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._LogicSymbol == "-" && this._OnBlurCssNegative != "")
        {
            this.AddCssClassMaskedEdit(this._OnBlurCssNegative);
        }
        // perform validation
        this.ShowTooltipMessage(false);
        this._RemoveDivToolTip();
        var IsValid = this._CaptureClientsValidators();
        if (!IsValid)
        {
            if (this._OnInvalidCssClass != "")
            {
                this.AddCssClassMaskedEdit(this._OnInvalidCssClass);
            }
            if (this._ClearTextOnInvalid)
            {
                this._createMask();
                wrapper.set_Value(this._EmptyMask);
            }
        }
        return IsValid;
    }
    , _onBlur : function(evt) 
    {
        this._InLostfocus = true;
        var IsValid = this._PeforformValidLostFocus(true);
        if (IsValid)
        {
            // trigger TextChanged with postback
            var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
            if (!this.get_element().readOnly && (this._initialvalue != wrapper.get_Value()) && evt) {
                this._fireChanged();
            }
        }
    }

    , _fireChanged : function() {
        /// <summary>
        /// Attempts to fire the change event on the attached textbox
        /// </summary>

        this._FiringOnChange = true;
        var elt = this.get_element();
        if (document.createEventObject) {
            elt.fireEvent("onchange");
        } else if (document.createEvent) {
            var e = document.createEvent("HTMLEvents");
            e.initEvent("change", true, true);
            elt.dispatchEvent(e);
        }
        this._FiringOnChange = false;
    }

    , _onKeyPress : function(evt) 
    {
        var scancode = this._KeyCode(evt);
        if (scancode == 9) //tab default action
        {
            return true;
        }
        if (scanCode == 13)
        {
            var IsValid = this._PeforformValidLostFocus(false);
            this._ErroOnEnter = false;
            if (!IsValid)
            {
                this._ErroOnEnter = true;
            }
            // Opera not perform cancel event. Re-perform at Timer
            if (Sys.Browser.agent == Sys.Browser.Opera)
            {
                var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                this._SaveText = wrapper.get_Value(); 
                this._SavePosi = this._getCurrentPosition();
                this._timer.set_enabled(false);
                this._timer.set_interval(1);
                this._timer.set_enabled(true);
                
            }
            return IsValid;
        }   
        if (this._OnFocusCssClass != "" && this._ErroOnEnter)
        {
            this.AddCssClassMaskedEdit(this._OnFocusCssClass);
        }
        this._ErroOnEnter = false;
        if (!this._isNormalChar(evt,scancode)) 
        {
            this._ExecuteNav(evt,scancode);
            return false;
        }
        // process and validate normal char
        curpos = this._deleteTextSelection();
        if (curpos == -1)
        {
            curpos = this._getCurrentPosition()
        }
        var c = String.fromCharCode(scanCode);
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.Date && c == this.get_CultureDatePlaceholder())
        {
            this._AdjustElementDate();
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Time && c == this.get_CultureTimePlaceholder())
        {
            this._AdjustElementTime();
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime && (c == this.get_CultureTimePlaceholder() || c == this.get_CultureDatePlaceholder()) )
        {
            this._AdjustElementDateTime(c);
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.LeftToRight && c == this.get_CultureDecimalPlaceholder() && curpos == this._LogicLastInt)
        {
            this._AdjustElementDecimalLTR();
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft && c == this.get_CultureDecimalPlaceholder() && curpos == this._LogicLastInt)
        {
            this._AdjustElementDecimalRTL();
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && c == this.get_CultureDecimalPlaceholder() && curpos != this._LogicLastInt)
        {
            this._MoveDecimalPos();
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.LeftToRight && c == this.get_CultureThousandsPlaceholder() )
        {
            this._MoveThousandLTR();
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft && c == this.get_CultureThousandsPlaceholder() )
        {
            this._MoveThousandRTL();
        }
        else if ( (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime) && this.get_CultureFirstLettersAMPM().toUpperCase().indexOf(c.toUpperCase()) != -1)
        {
            if (this._AcceptAmPm)
            {
                this.InsertAMPM(c);
                this.setSelectionRange(curpos,curpos);
            }
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(c) != -1)
        {
            if (Sys.Browser.agent != Sys.Browser.Opera)
            {
                this.InsertSignal(c);
                this.setSelectionRange(curpos,curpos);
            }
            else
            {
                // Opera perform double event! when press "-" at numpad key
                if (this._SaveSymb == "")
                {
                    this.InsertSignal(c);
                    this.setSelectionRange(curpos,curpos);
                    this._SaveSymb = c;
                    this._timer.set_enabled(false);
                    this._timer.set_interval(1);
                    this._timer.set_enabled(true);
                }
                else
                {
                    this._SaveSymb = "";
                }
            }
        }
        else
        {
            var OriPos = curpos;
            curpos = this._getNextPosition(curpos);
            var logiccur = curpos;
            if (this._LogicLastInt != -1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
            {
                if (OriPos == this._LogicLastInt)
                {
                    logiccur = this._getLastEmptyPosition();
                }
            }
            else
            {
                if (curpos >= this._LogicLastPos+1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                {
                    logiccur = this._getLastEmptyPosition();
                }
            }
            if (this._processKey(logiccur,c)) 
            {
                if (this._MessageValidatorTip) 
                {
                    this.ShowTooltipMessage(false);
                }
                if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.LeftToRight)
                {
                    this._insertContent(c,logiccur);
                    curpos = this._getNextPosition(logiccur+1);
                } 
                else if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                {
                    if (this._LogicLastInt == -1)
                    {
                        if (curpos < this._LogicLastPos+1)
                        {
                            this._insertContent(c,logiccur);
                            curpos = this._getNextPosition(logiccur+1);
                        }
                        else
                        {
                            this._insertContentRight(c);
                            curpos = this._LogicLastPos+1;
                        }
                    }
                    else
                    {
                        if (OriPos != this._LogicLastInt)
                        {
                            this._insertContent(c,logiccur);
                            curpos = this._getNextPosition(logiccur+1);
                        }
                        else
                        {
                            var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                            var ClearText = this._getClearMask(wrapper.get_Value());
                            if (ClearText != "")
                            {
                                var pospt = ClearText.indexOf(this.get_CultureDecimalPlaceholder());
                                if (pospt != -1)                                
                                {
                                   var intnum = ClearText.substring(0,pospt);
                                   if (intnum == "0" || intnum == "-0")
                                   {
                                        this.setSelectionRange(this._LogicLastInt-1,this._LogicLastInt);
                                        this._deleteTextSelection();
                                        curpos = this._LogicLastInt;
                                        this.setSelectionRange(curpos,curpos);
                                   }
                                }
                            }
                            if (ClearText == "" && c == "0")
                            {
                                curpos = this._LogicLastInt;
                            }
                            else
                            {
                                this._insertContentRight(c);
                                curpos = this._LogicLastInt;
                            }
                        }
                    }
                }
                this.setSelectionRange(curpos,curpos);
            }
        }
        this._SetCancelEvent(evt);
        return false;
    }
    , _onKeyPressdown : function(evt) 
    {
        // for other browsers not IE (NOT IMPLEMENT document.activeElement)
        if (this._InLostfocus)
        {
            this._onFocus(evt);
        }
        var scancode = this._KeyCode(evt);
        if (scancode == 9) //tab default action
        {
            return true;
        }
        if (scanCode == 13)  //enter 
        {
            return true;
        }
        if (!this._isNormalChar(evt,scancode)) 
        {
            this._ExecuteNav(evt,scancode);
        }
        else
        {
            // Opera not perform cancel event. Re-perform at Timer
            if (Sys.Browser.agent == Sys.Browser.Opera)
            {
                // cancel shift Ins , assume Ins = "-"
                if (evt.rawEvent.shiftKey && !evt.rawEvent.ctrlKey && !evt.rawEvent.altKey && evt.rawEvent.keyCode == 45) 
                {
                    var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                    this._SaveText = wrapper.get_Value(); 
                    this._SavePosi = this._getCurrentPosition();
                    this._timer.set_enabled(false);
                    this._timer.set_interval(1);
                    this._timer.set_enabled(true);
                }
            }
        }
    }
    , _onMouseOut : function(evt) 
    {
        this._RemoveDivToolTip();
    }
    , _onMouseMove : function(evt) 
    {
        if ((this._InLostfocus || this._ErroOnEnter) && this._ExternalMessageError != "")
        {
            this._ShowDivToolTip(evt);
        }
    }
    ,_onMouseover : function(evt) 
    {
        // check if validation execute at asyc.post back
        if (!$get("DivMaskedEditTip_" + this.get_element().id))
        {
            this._CaptureServerValidators();
        }
        if ((this._InLostfocus || this._ErroOnEnter) && this._ExternalMessageError != "")
        {
            this._createDivToolTip(evt,this._ExternalMessageError);
        }
    }
    //
    // CREATE TOOLTIP
    //
    , _ShowDivToolTip : function(evt) {
        var et = $get("DivMaskedEditTip_" + this.get_element().id);
        if (!et)
        {
            this._createDivToolTip(evt,this._ExternalMessageError);
            et = $get("DivMaskedEditTip_" + this.get_element().id);
        }
        var mousepos = this._GetMousePos(evt);
        et.style.left = mousepos.x + 1/*offset To prevent flick in FF*/ + "px";
        et.style.top  = mousepos.y + 1/*offset To prevent flick in FF*/ + "px";
    }
    , _GetMousePos : function(evt) {
        var scrOfX = 0, scrOfY = 0;
        if( typeof( window.pageYOffset ) == 'number' ) {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
        } 
        else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
        } 
        else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
        
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
        }
        var posX = 0, posY = 0;
        if( typeof( evt.pageX ) == 'number' ) 
        {
            posX = evt.pageX;
            posY = evt.pageY;
        } 
        else if( typeof( evt.clientX ) == 'number' ) 
        {
            posX = evt.clientX;
            posY = evt.clientY;
        }
        return {x:posX+scrOfX,y:posY+scrOfY}
    }
    , _RemoveDivToolTip : function() {
        var e = $get("DivMaskedEditTip_" + this.get_element().id);
        if (e)
        {
            document.body.removeChild(e);
        }
    }
    , _createDivToolTip : function(evt,Msg) {
        var e = $get("DivMaskedEditTip_" + this.get_element().id);
        if (!e)
        {
            var DivTp;
            var mousepos = this._GetMousePos(evt);
            DivTp = document.createElement("div");
            DivTp.id = "DivMaskedEditTip_" + this.get_element().id;
            DivTp.style.position = "absolute"; 
            DivTp.style.left = mousepos.x + 2/*offset*/ + "px";
            DivTp.style.top  = mousepos.y + 2/*offset*/ + "px";
            DivTp.style.zIndex = 99999;
            if (this._CssMessageErrorFloat == "")
            {
                DivTp.style.padding = "3px 3px 3px 3px";
                DivTp.style.border = "Solid 1px #000000";
                DivTp.style.backgroundColor = "#FFFFEA";
                DivTp.style.fontWeight = "normal";
                DivTp.style.fontSize = "12px";
                DivTp.style.fontFamily = "Arial";
            }
            else
            {
                DivTp.className = this._CssMessageErrorFloat;
            }
            DivTp.innerHTML = Msg;
            DivTp = document.body.insertBefore(DivTp, document.body.firstChild);
        }
    }
    //
    // Execute Navigator on Mask
    //
    , _ExecuteNav : function(evt,scanCode)
    {
        if (evt.type == "keydown")
        {
            if (Sys.Browser.agent == Sys.Browser.InternetExplorer) 
            {
                // ctrl v 
                if ( (scanCode == 86 || scanCode == 118) && !evt.shiftKey && evt.ctrlKey && !evt.altKey) {
                    this._SetCancelEvent(evt);
                    this._PasteFromClipBoard();
                    return;
                }
                //Shift Ins 
                if (evt.shiftKey && !evt.ctrlKey && !evt.altKey && evt.keyCode == 45) {
                    this._SetCancelEvent(evt);
                    this._PasteFromClipBoard();
                    return;
                }
            }
        }
        if (Sys.Browser.agent != Sys.Browser.InternetExplorer || evt.type == "keypress") 
        {
            //Shift Ins 
            if (evt.rawEvent.shiftKey && !evt.rawEvent.ctrlKey && !evt.rawEvent.altKey && evt.rawEvent.keyCode == 45) {
                //at opera assume Ins = "-" not execute Shift-Ins
                this._SetCancelEvent(evt);
                this._PasteFromClipBoard();
                return;
            }
            // ctrl v 
            if (evt.type == "keypress" && (scanCode == 86 || scanCode == 118) && !evt.shiftKey && evt.ctrlKey && !evt.altKey) {
                this._SetCancelEvent(evt);
                this._PasteFromClipBoard();
                return;
            }
        }
        if (Sys.Browser.agent == Sys.Browser.InternetExplorer || evt.type == "keypress") 
        {
            if (scanCode == 8) // BackSpace
            {
                this._SetCancelEvent(evt);
                curpos = this._deleteTextSelection();
                if (curpos != -1)
                {
                    this.setSelectionRange(curpos,curpos);
                }
                else
                {
                    curpos = this._getCurrentPosition();
                    this._backspace(curpos);
                    
                    curpos = this._getPreviousPosition(curpos-1);
                    this.setSelectionRange(curpos,curpos);
                }
                var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                if (this._MessageValidatorTip && wrapper.get_Value() == this._EmptyMask)
                {
                    this.ShowTooltipMessage(true);
                }
                // Opera not perform cancel event. Re-perform at Timer
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    this._SaveText = wrapper.get_Value(); 
                    this._SavePosi = curpos;
                    this._timer.set_enabled(false);
                    this._timer.set_interval(1);
                    this._timer.set_enabled(true);
                }
            }
            else if (scanCode == 46 || scanCode == 127) // delete
            {
                this._SetCancelEvent(evt);
                var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                curpos = this._deleteTextSelection();
                if (curpos == -1)
                {
                    curpos = this._getCurrentPosition();
                    if (!this._isValidMaskedEditPosition(curpos))
                    {
                        if (curpos != this._LogicLastInt && this._InputDirection != AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                        {
                            curpos = this._getNextPosition(curpos);
                        }
                    }
                    this._deleteAtPosition(curpos,false);
                }
                else
                {
                    if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                    {
                        ClearText = this._getClearMask(wrapper.get_Value());
                        if (ClearText != "")
                        {
                            ClearText = ClearText.replace(new RegExp("(\\" + this.get_CultureThousandsPlaceholder() + ")", "g"), "") + '';
                            if (ClearText.substring(ClearText.length-1,ClearText.length) == this.get_CultureDecimalPlaceholder())
                            {
                                ClearText = ClearText.substring(0,ClearText.length-1);
                                this.loadValue(ClearText,this._LogicLastInt);
                            }
                            else
                            {
                                this.loadValue(ClearText,this._LogicLastPos);
                            }
                        }
                    }
                }
                this.setSelectionRange(curpos,curpos);
                if (this._MessageValidatorTip && wrapper.get_Value() == this._EmptyMask)
                {
                    this.ShowTooltipMessage(true);
                }
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    this._SaveText = wrapper.get_Value(); 
                    this._SavePosi = curpos;
                    this._timer.set_enabled(false);
                    this._timer.set_interval(1);
                    this._timer.set_enabled(true);
                }
            }
            else if(evt.ctrlKey)
            {
                if (scanCode == 39 || scanCode == 35 || scanCode == 34) //Right or END or pgdown
                {
                    this._DirectSelText = "R";
                    if (Sys.Browser.agent == Sys.Browser.Opera)
                    {
                        return;
                    }
                    this._SetCancelEvent(evt);
                    curpos = this._getCurrentPosition();
                    this.setSelectionRange(curpos,this._LogicLastPos+1);
                }
                else if (scanCode == 37  || scanCode == 36 || scanCode == 33) //Left or Home or pgup
                {
                    this._DirectSelText = "L";
                    if (Sys.Browser.agent == Sys.Browser.Opera)
                    {
                        return;
                    }
                    this._SetCancelEvent(evt);
                    curpos = this._getCurrentPosition();
                    this.setSelectionRange(this._LogicFirstPos,curpos);
                }
            }
            else if (scanCode == 35 || scanCode == 34) //END or pgdown
            {
                this._DirectSelText = "R";
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    return;
                }
                this._SetCancelEvent(evt);
                if (evt.shiftKey)
                {
                    curpos = this._getCurrentPosition();
                    this.setSelectionRange(curpos,this._LogicLastPos+1);
                }
                else
                {
                    this.setSelectionRange(this._LogicLastPos+1,this._LogicLastPos+1);
                }
            }
            else if (scanCode == 36 || scanCode == 33) //Home or pgup
            {
                this._DirectSelText = "L";
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    return;
                }
                this._SetCancelEvent(evt);
                if (evt.shiftKey)
                {
                    curpos = this._getCurrentPosition();
                    this.setSelectionRange(this._LogicFirstPos,curpos);
                }
                else
                {
                    this.setSelectionRange(this._LogicFirstPos,this._LogicFirstPos);
                }
            }
            else if (scanCode == 37) //left
            {
                this._DirectSelText = "L";
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    return;
                }
                this._SetCancelEvent(evt);
                if (evt.shiftKey)
                {
                    var BoundSel = this._GetBoundSelection();
                    if (BoundSel)
                    {
                        if (BoundSel.left > this._LogicFirstPos)
                        {
                            BoundSel.left --;     
                        }
                        this.setSelectionRange(BoundSel.left,BoundSel.right);
                    }
                    else
                    {
                        var pos = this._getCurrentPosition();
                        if (pos  > this._LogicFirstPos)
                        {
                            this.setSelectionRange(pos -1,pos);
                        }
                    }
                }
                else
                {
                    curpos = this._getCurrentPosition()-1;
                    if (curpos < this._LogicFirstPos)
                    {
                        curpos = this._LogicFirstPos;
                    }
                    this.setSelectionRange(curpos,curpos);
                }
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                    this._SaveText = wrapper.get_Value(); 
                    this._SavePosi = curpos;
                    this._timer.set_enabled(false);
                    this._timer.set_interval(1);
                    this._timer.set_enabled(true);
                }
            }
            else if (scanCode == 39) // right
            {
                this._DirectSelText = "R";
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    return;
                }
                this._SetCancelEvent(evt);
                if (evt.shiftKey)
                {
                    var BoundSel = this._GetBoundSelection();
                    if (BoundSel)
                    {
                        if (BoundSel.right < this._LogicLastPos+1)
                        {
                            BoundSel.right ++;     
                        }
                        this.setSelectionRange(BoundSel.left,BoundSel.right);
                    }
                    else
                    {
                        pos = this._getCurrentPosition();
                        if (pos  < this._LogicLastPos+1)
                        {
                            this.setSelectionRange(pos,pos+1);
                        }
                    }
                }
                else
                {
                    curpos = this._getCurrentPosition()+1;
                    if (curpos > this._LogicLastPos+1)
                    {
                        curpos = this._LogicLastPos+1;
                    }
                    this.setSelectionRange(curpos,curpos);
                }
                if (Sys.Browser.agent == Sys.Browser.Opera)
                {
                    var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                    this._SaveText = wrapper.get_Value(); 
                    this._SavePosi = curpos;
                    this._timer.set_enabled(false);
                    this._timer.set_interval(1);
                    this._timer.set_enabled(true);
                }
            }
            else if (scanCode == 27) // esc
            {
                this._SetCancelEvent(evt);
                var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
                if (this._EmptyMask == this._initialvalue)
                {
                    wrapper.set_Value("");
                }
                else
                {
                    wrapper.set_Value(this._initialvalue);
                }
                this._onFocus();
            }
            //else if (scanCode == 38 || scanCode == 40)  //up - down 
        }
        // any other nav key
        this._SetCancelEvent(evt);
    }
    //
    // backspace at current position
    //
    , _backspace : function(curpos) 
    {
        var exec = false;
        if (curpos > this._LogicFirstPos)
        {
            var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
            var masktext = wrapper.get_Value();
            curpos = this._getPreviousPosition(curpos-1);
            this._deleteAtPosition(curpos, true);
            exec = true;
        }
        return exec;
    }
    //
    // delete at current position
    //
    , _deleteAtPosition : function(curpos,isBS) 
    {
        var exec = false;
        var lastpos = this._LogicLastPos+1;
        if (this._LogicLastInt != -1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
        {
            lastpos = this._LogicLastInt;
        }
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        if (isBS == false && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft && curpos == lastpos)
        {
            ClearText = this._getClearMask(wrapper.get_Value());
            if (ClearText != "")
            {
                exec = true;
                ClearText = ClearText.replace(new RegExp("(\\" + this.get_CultureThousandsPlaceholder() + ")", "g"), "") + '';
                if (ClearText.substring(ClearText.length-1,ClearText.length) == this.get_CultureDecimalPlaceholder())
                {
                    ClearText = ClearText.substring(0,ClearText.length-1);
                }
                var arr_num = ClearText.split(this.get_CultureDecimalPlaceholder());
                if (this._LogicLastInt != -1 && arr_num[0] != "")
                {
                    arr_num[0] = arr_num[0].substring(0,arr_num[0].length-1);
                    ClearText =  arr_num[0];
                    if (arr_num.length = 2)
                    {
                        ClearText += this.get_CultureDecimalPlaceholder() + arr_num[1];
                    }
                }
                else
                {
                    ClearText = ClearText.substring(0,ClearText.length-1);
                }
                ClearText += this._LogicSymbol;
                this.loadValue(ClearText,lastpos);
            }
        }
        else
        {
            var masktext = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
            var logiTxt = this._LogicTextMask.substring(this._LogicFirstPos,this._LogicLastPos+1);
            var qtdDt = 0;
            var curvld = curpos - this._LogicFirstPos;
            if (this._isValidMaskedEditPosition(curpos))
            {
                exec = true;
                if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
                {
                    var arr_mask = masktext.split(" ");
                    var posmask = curpos - this._LogicFirstPos;
                    if (posmask > arr_mask[0].length)
                    {
                        // at position time
                        masktext = arr_mask[1];        
                        qtdDt = arr_mask[0].length +1;
                        logiTxt = logiTxt.substring(qtdDt);
                        curvld -= qtdDt;
                    }
                    else
                    {
                        // at position date
                        masktext = arr_mask[0];
                        logiTxt = logiTxt.substring(0,arr_mask[0].length);
                    }
                }
                var resttext = masktext.substring(curvld+1);
                var restlogi = logiTxt.substring(curvld+1);
                masktext = masktext.substring(0,curvld) + this._PromptChar;
                logiTxt = logiTxt.substring(0,curvld) + this._LogicPrompt;
                // clear rest of mask
                for (i = 0 ; i < parseInt(resttext.length,10) ; i++) 
                {
                    if (this._isValidMaskedEditPosition(curpos+1+i))
                    {
                        masktext += this._PromptChar;
                        logiTxt += this._LogicPrompt;
                    }
                    else
                    {
                        masktext += resttext.substring(i,i+1);
                        logiTxt += restlogi.substring(i,i+1);
                    }
                }
                // insert only valid text
                posaux = this._getNextPosition(curpos);
                for (i = 0 ; i < parseInt(resttext.length,10) ; i++) 
                {
                    if (this._isValidMaskedEditPosition(curpos+1+i) && restlogi.substring(i,i+1) != this._LogicPrompt)
                    {
                        masktext = masktext.substring(0,posaux- this._LogicFirstPos-qtdDt) + resttext.substring(i,i+1) + masktext.substring(posaux+1- this._LogicFirstPos-qtdDt);
                        logiTxt = logiTxt.substring(0,posaux- this._LogicFirstPos-qtdDt) + restlogi.substring(i,i+1) + logiTxt.substring(posaux+1- this._LogicFirstPos-qtdDt);
                        posaux = this._getNextPosition(posaux+1);
                    }
                }            
                if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
                {
                    var oritext = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
                    var orilogi = this._LogicTextMask.substring(this._LogicFirstPos,this._LogicLastPos+1)
                    var arr_mask = oritext.split(" ");
                    var posmask = curpos - this._LogicFirstPos;
                    if (posmask > arr_mask[0].length)
                    {
                        // at position time
                        masktext = arr_mask[0] + " " +  masktext;        
                        logiTxt = orilogi.substring(0, qtdDt) + logiTxt;
                    }
                    else
                    {
                        // at position date
                        masktext = masktext + " " + arr_mask[1];
                        logiTxt = logiTxt + orilogi.substring(arr_mask[0].length);
                    }
                }
                var currValue = wrapper.get_Value();
                masktext = currValue.substring(0,this._LogicFirstPos) + masktext + currValue.substring(this._LogicLastPos+1);
                this._LogicTextMask = this._LogicTextMask.substring(0,this._LogicFirstPos) + logiTxt + this._LogicTextMask.substring(this._LogicLastPos+1);
                wrapper.set_Value(masktext);
            }
        }
        return exec;
    }
    //
    // Paste clip board
    //
    ,_ShowModalClipBoardInput : function()
    {
        var clip = prompt(this._ClipboardText,"");
        return clip;
    }
    ,_PasteFromClipBoard  : function()
    {
        var value = null;
        var curpos;
        var iniSel = -1;
        var fimSel = -1;
        if (Sys.Browser.agent == Sys.Browser.InternetExplorer) 
        {
            value = window.clipboardData.getData("Text");
        }
        else
        {
            //save current values because lost focus 
            var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
            var oldvalue = wrapper.get_Value();
            var BoundSel = this._GetBoundSelection();
            var curpos = this._getCurrentPosition();
            var OldAuto = this._AutoComplete;
            var OldInv = this._ClearTextOnInvalid;
            var OldCls = this._ClearMaskOnLostfocus;
            var OldDir = this._DirectSelText;
            this._AutoComplete = false;
            this._ClearTextOnInvalid = false;
            this._ClearMaskOnLostfocus = false;
            value = this._ShowModalClipBoardInput();
            this._AutoComplete = OldAuto;
            this._ClearTextOnInvalid = OldInv;
            this._ClearMaskOnLostfocus = OldCls;
            wrapper.set_Value(oldvalue);
            if (BoundSel)
            {
                this.setSelectionRange(BoundSel.left,BoundSel.right);
            }
            else
            {
                this.setSelectionRange(curpos,curpos);
            }
        }
        if (value == null || value == "")
        {
            return;
        }
        if (value.length > this._maskvalid.length)
        {
             value = value.substring(0,this._maskvalid.length);
        }
        curpos = this._deleteTextSelection();
        if (curpos == -1)
        {
            curpos = this._getCurrentPosition();
            if (BoundSel)
            {
                curpos = BoundSel.left;
            }
        }
        this.setSelectionRange(curpos,curpos);
        var ReturnPosDec = false;
        if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft && this._LogicLastInt != -1)
        {
            ReturnPosDec = true;
        }
        var i = 0;
        for (i = 0; i < value.length;i++)
        {
            var c = value.substring(i,i+1);
            var logiccur = curpos;
            if (ReturnPosDec)
            {
                logiccur = this._getLastEmptyPosition();
            }
            if ( (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime) && this.get_CultureFirstLettersAMPM().toUpperCase().indexOf(c.toUpperCase()) != -1)
            {
                if (this._AcceptAmPm)
                {
                    this.InsertAMPM(c);
                    this.setSelectionRange(curpos,curpos);
                }
            }
            else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(c) != -1)
            {
                this.InsertSignal(c);
                this.setSelectionRange(curpos,curpos);
            }
            else
            {
                var OriPos = curpos;
                curpos = this._getNextPosition(curpos);
                var logiccur = curpos;
                if (this._LogicLastInt != -1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                {
                    if (OriPos == this._LogicLastInt)
                    {
                        logiccur = this._getLastEmptyPosition();
                    }
                }
                else
                {
                    if (curpos >= this._LogicLastPos+1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                    {
                        logiccur = this._getLastEmptyPosition();
                    }
                }
                if (this._processKey(logiccur,c)) 
                {
                    if (this._MessageValidatorTip) 
                    {
                        this.ShowTooltipMessage(false);
                    }
                    if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.LeftToRight)
                    {
                        this._insertContent(c,logiccur);
                        curpos = this._getNextPosition(logiccur+1);
                    } 
                    else if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
                    {
                        if (this._LogicLastInt == -1)
                        {
                            if (curpos < this._LogicLastPos+1)
                            {
                                this._insertContent(c,logiccur);
                                curpos = this._getNextPosition(logiccur+1);
                            }
                            else
                            {
                                this._insertContentRight(c);
                                curpos = this._LogicLastPos+1;
                            }
                        }
                        else
                        {
                            if (OriPos != this._LogicLastInt)
                            {
                                this._insertContent(c,logiccur);
                                curpos = this._getNextPosition(logiccur+1);
                            }
                            else
                            {
                                this._insertContentRight(c);
                                curpos = this._LogicLastInt;
                            }
                        }
                    }
                    this.setSelectionRange(curpos,curpos);
                }
            }
        }
        if (ReturnPosDec)
        {
            this.setSelectionRange(this._LogicLastInt,this._LogicLastInt);
        }
    }
    //
    // Move cursor to decimal position (LeftToRight and RightToLeft Mode)
    //
    , _MoveDecimalPos : function()
    {
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        var curpos = this._LogicFirstPos;
        var max = this._LogicLastPos;
        var posDc = -1;
        while (curpos < max)
        {
            if (wrapper.get_Value().substring(curpos,curpos+1) == this.get_CultureDecimalPlaceholder())
            {
                posDc = curpos;
                break;
            }
            curpos++;
        }
        if (posDc == -1)
        {
            return;
        }
        this.setSelectionRange(posDc,posDc);
    }
    //
    // Move cursor to next Thousand position (LeftToRight Mode)
    //
    , _MoveThousandLTR : function()
    {
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        var curpos = this._getCurrentPosition();
        var max = this._LogicLastPos;
        var cur = curpos+1;
        var posTh = -1;
        while (cur < max)
        {
            if (wrapper.get_Value().substring(cur,cur+1) == this.get_CultureThousandsPlaceholder())
            {
                posTh = cur;
                break;
            }
            cur++;
        }
        if (posTh == -1)
        {
            var cur = 0;
            max = curpos;
            while (cur < max)
            {
                if (wrapper.get_Value().substring(cur,cur+1) == this.get_CultureThousandsPlaceholder())
                {
                    posTh = cur;
                    break;
                }
                cur++;
            }
            if (posTh == -1)
            {
                return;
            }
        }
        this.setSelectionRange(posTh,posTh);
    }
    //
    // Move cursor to next Thousand position (RightToLeft Mode)
    //
    , _MoveThousandRTL : function()
    {
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        var curpos = this._getCurrentPosition();
        var min = this._LogicFirstPos;
        var cur = curpos-1;
        var posTh = -1;
        while (cur > min)
        {
            if (wrapper.get_Value().substring(cur,cur+1) == this.get_CultureThousandsPlaceholder())
            {
                posTh = cur;
                break;
            }
            cur--;
        }
        if (posTh == -1)
        {
            cur = this._LogicLastPos;
            min = curpos;
            while (cur > min)
            {
                if (wrapper.get_Value().substring(cur,cur+1) == this.get_CultureThousandsPlaceholder())
                {
                    posTh = cur;
                    break;
                }
                cur--;
            }
            if (posTh == -1)
            {
                return;
            }
        }
        this.setSelectionRange(posTh,posTh);
    }
    //
    // adjust element Number to Decimal position (LeftToRight Mode)
    //
    , _AdjustElementDecimalLTR : function()
    {
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        var curpos = this._getCurrentPosition();
        if (wrapper.get_Value().substring(curpos).indexOf(this.get_CultureDecimalPlaceholder()) == -1)
        {
            //after decimal position
            return;
        }
        var value = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
        var newcur = value.indexOf(this.get_CultureDecimalPlaceholder());
        if (newcur  == -1)
        {
            //decimal not exist
            return;
        }
        var arr_num;
        ClearText = this._getClearMask(wrapper.get_Value());
        if (ClearText != "")
        {
            ClearText = ClearText.replace(new RegExp("(\\" + this.get_CultureThousandsPlaceholder() + ")", "g"), "") + '';
            arr_num = ClearText.split(this.get_CultureDecimalPlaceholder());
        }
        else
        {
            arr_num =  this.get_CultureDecimalPlaceholder().split(this.get_CultureDecimalPlaceholder());
        }      
        if (arr_num[0] == "")
        {
            arr_num[0] = "0";
        }
        // fill decimal
        var QtdDec = value.length - newcur - 1;
        while (arr_num[1].length < QtdDec)
        {
            arr_num[1] += "0";
        }
        var OldDir = this._InputDirection;
        this._InputDirection = AjaxControlToolkit.MaskedEditInputDirections.RightToLeft;
        this.loadValue(arr_num[0] + this.get_CultureDecimalPlaceholder() + arr_num[1],this._LogicLastPos);
        this._InputDirection = OldDir;
        newcur += this._LogicFirstPos + 1;
        this.setSelectionRange(newcur,newcur);
    }
    //
    // adjust element Number to Decimal position (RightToleft Mode)
    //
    , _AdjustElementDecimalRTL : function()
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var value = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
        var posdec = value.indexOf(this.get_CultureDecimalPlaceholder());
        if (posdec == -1)
        {
            //decimal not exist
            return;
        }
        var curpos = this._getCurrentPosition();
        if (posdec + this._LogicFirstPos >= curpos)
        {
            //before decimal position , EXECUTE LTR MODE
            this._AdjustElementDecimalLTR();
            return;
        }
        var arr_num;
        ClearText = this._getClearMask(wrapper.get_Value());
        if (ClearText != "")
        {
            ClearText = ClearText.replace(new RegExp("(\\" + this.get_CultureThousandsPlaceholder() + ")", "g"), "") + '';
            arr_num = ClearText.split(this.get_CultureDecimalPlaceholder());
        }
        else
        {
            arr_num =  this.get_CultureDecimalPlaceholder().split(this.get_CultureDecimalPlaceholder());
        }      
        if (arr_num[0] == "")
        {
            arr_num[0] = "0";
        }
        // fill decimal
        var QtdDec = value.length - posdec - 1;
        while (arr_num[1].length < QtdDec)
        {
            arr_num[1] += "0";
        }
        var OldDir = this._InputDirection;
        this._InputDirection = AjaxControlToolkit.MaskedEditInputDirections.RightToLeft;
        this.loadValue(arr_num[0] + this.get_CultureDecimalPlaceholder() + arr_num[1],this._LogicLastPos);
        this._InputDirection = OldDir;
        posdec += this._LogicFirstPos + 1;
        this.setSelectionRange(posdec,posdec);
    }
    //
    // adjust Time Format 
    //
    , _AdjustTime : function(value,ValueDefault)
    {
        var emp = true;    
        var i
        for (i = 0 ; i < parseInt(value.length,10) ; i++) 
        {
            if (value.substring(i,i+1) != this._PromptChar)
            {
                emp = false;
            }
        }
        if (emp)
        {
           return ValueDefault;
        }
        var max = value.length;
        value = value.replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        while (value.length < max)
        {
            value = "0" + value;
        }
        return value;
    }
    //
    // adjust Element Time Format 
    //
    , _AdjustElementTime : function()
    {
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        var type = "";
        var curpos = this._getCurrentPosition() - this._LogicFirstPos;
        var m_mask = this._maskvalid;
        var newcur = curpos + this._LogicFirstPos;
        var QtdDt = 0;
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            QtdDt = m_mask.split(" ")[0].length+1;
            if (curpos < QtdDt)
            {
                newcur = QtdDt+this._LogicFirstPos;
                this.setSelectionRange(newcur,newcur);
                return;
            }
            // without am/pm, The AP/PM will get from this._LogicSymbol
            m_mask = m_mask.split(" ")[1];
            curpos -= QtdDt;
        }
        m_mask = m_mask.split(":");
        if (curpos <= 1)
        {
            type = "H";
            newcur = 3 + this._LogicFirstPos + QtdDt;
            
        } 
        else if (curpos >= 2 && curpos <= 4 && m_mask.length == 2)
        {
            type = "M";
            newcur = QtdDt+this._LogicFirstPos;
        }
        else if (curpos >= 2 && curpos <= 4 && m_mask.length == 3)
        {
            type = "M";
            newcur = 6 + this._LogicFirstPos + QtdDt;
        }
        else if (m_mask.length == 3)
        {
            type = "S";
            newcur = QtdDt+this._LogicFirstPos;
        } 
        if (type == "")
        {
            return;
        }
        var valueTM = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            valueTM = valueTM.split(" ")[1];
        }
        var m_arrTime = valueTM.split(this.get_CultureTimePlaceholder());
        var elem = this._GetTimeElementText(type);
        var value;
        if (type == "H")
        {
            value = elem + this.get_CultureTimePlaceholder() + m_arrTime[1];
            if (m_arrTime.length == 3)
            {
                value += this.get_CultureTimePlaceholder() + m_arrTime[2];
            }
        }
        else if (type == "M")
        {
            value = m_arrTime[0] + this.get_CultureTimePlaceholder() + elem;
            if (m_arrTime.length == 3)
            {
                value += this.get_CultureTimePlaceholder() + m_arrTime[2];
            }
        }
        else if (type == "S")
        {
            value = m_arrTime[0] + this.get_CultureTimePlaceholder() + m_arrTime[1];
            value += this.get_CultureTimePlaceholder() + elem;
        }
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            value = wrapper.get_Value().substring(this._LogicFirstPos,QtdDt) + value;
        }
        this.loadMaskValue(value,this._LogicFirstPos,this._LogicSymbol);
        this.setSelectionRange(newcur,newcur);
    }
    //
    // Get Element Time
    //
    , _GetTimeElementText : function(Type)
    {
        var aux;
        var logiTxt = this._LogicTextMask.substring(this._LogicFirstPos,this._LogicLastPos+1);
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            logiTxt = logiTxt.substring(this._maskvalid.split(" ")[0].length+1);
        }
        var m_arrTime = logiTxt.split(this.get_CultureTimePlaceholder());
        m_arrTime[0] = m_arrTime[0].replace(new RegExp("(\\" + this._LogicPrompt + ")", "g"), this._PromptChar) + '';
        aux = m_arrTime[0].replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        if (aux !="" && aux.length < 2)
        {
            aux = "0" + aux;
            m_arrTime[0] = aux;
        }
        
        m_arrTime[1] = m_arrTime[1].replace(new RegExp("(\\" + this._LogicPrompt + ")", "g"), this._PromptChar) + '';
        aux = m_arrTime[1].replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        if (aux !="" && aux.length < 2)
        {
            aux = "0" + aux;
            m_arrTime[1] =  aux;
        }
        if (m_arrTime.length == 3)
        {
            m_arrTime[2] = m_arrTime[2].replace(new RegExp("(\\" + this._LogicPrompt + ")", "g"), this._PromptChar) + '';
            aux = m_arrTime[2].replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
            if (aux !="" && aux.length < 2)
            {
                aux = "0" + aux;
                m_arrTime[2] =  aux;
            }
        }
        if (Type == "H")
        {
            return m_arrTime[0];
        }
        else if (Type == "M")
        {
            return m_arrTime[1];
        }
        //Type == "S"
        return m_arrTime[2];
    }
    //
    // adjust Date Format 
    //
    , _AdjustElementDateTime : function(c)
    {
        if (c == this.get_CultureDatePlaceholder())
        {
            this._AdjustElementDate();
        }
        if (c == this.get_CultureTimePlaceholder())
        {
            this._AdjustElementTime();
        }
    }
    , _AdjustElementDate : function()
    {
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        var input = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            input = input.split(" ")[0];
        }
        var m_arrDate = input.split(this.get_CultureDatePlaceholder());
        var type = "";
        var curpos = this._getCurrentPosition() - this._LogicFirstPos;
        var newcur = curpos + this._LogicFirstPos;
        var QtdY = (this._maskvalid.indexOf("9999") != -1)?2:0;
        if (this.get_CultureDateFormat() == "DMY")
        {
           if (curpos <= 1)
           {
                type = "D";
                newcur = 3 + this._LogicFirstPos;
                
           } 
           else if (curpos >= 2 && curpos <= 4)
           {
                type = "M";
                newcur = 6 + this._LogicFirstPos;
           }
           else
           {
                if (curpos > 8 + QtdY &&  this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
                {
                    this.setSelectionRange(this._LogicFirstPos,this._LogicFirstPos);
                    return;
                }
                type = "Y";
                newcur = this._LogicFirstPos;
           } 
        }
        else if (this.get_CultureDateFormat() == "MDY")
        {
           if (curpos <= 1)
           {
                type = "M";
                newcur = 3 + this._LogicFirstPos;
                
           } 
           else if (curpos >= 2 && curpos <= 4)
           {
                type = "D";
                newcur = 6 + this._LogicFirstPos;
           }
           else
           {
                if (curpos > 8 + QtdY &&  this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
                {
                    this.setSelectionRange(this._LogicFirstPos,this._LogicFirstPos);
                    return;
                }
                type = "Y";
                newcur = this._LogicFirstPos;
           } 
        }
        else if (this.get_CultureDateFormat() == "DYM")
        {
           if (curpos <= 1)
           {
                type = "D";
                newcur = 3 + this._LogicFirstPos;
                
           } 
           else if (curpos >= 2 && curpos <= 4+QtdY)
           {
                type = "Y";
                newcur = 6 + QtdY + this._LogicFirstPos;
           }
           else
           {
                type = "M";
                newcur = this._LogicFirstPos;
           } 
        }
        else if (this.get_CultureDateFormat() == "MYD")
        {
           if (curpos <= 1)
           {
                type = "M";
                newcur = 3 + this._LogicFirstPos;
                
           } 
           else if (curpos >= 2 && curpos <= 4+QtdY)
           {
                type = "Y";
                newcur = 6 + QtdY + this._LogicFirstPos;
           }
           else
           {
                type = "D";
                newcur = this._LogicFirstPos;
           } 
        }
        else if (this.get_CultureDateFormat() == "YMD")
        {
           if (curpos <= 1+QtdY)
           {
                type = "Y";
                newcur = 3 + QtdY + this._LogicFirstPos;
                
           } 
           else if (curpos >= 2+ QtdY && curpos <= 4+QtdY)
           {
                type = "M";
                newcur = 6 + QtdY + this._LogicFirstPos;
           }
           else
           {
                type = "D";
                newcur = this._LogicFirstPos;
           } 
        }
        else if (this.get_CultureDateFormat() == "YDM")
        {
           if (curpos <= 1+QtdY)
           {
                type = "Y";
                newcur = 3 + QtdY + this._LogicFirstPos;
                
           } 
           else if (curpos >= 2+ QtdY && curpos <= 4+QtdY)
           {
                type = "D";
                newcur = 6 + QtdY + this._LogicFirstPos;
           }
           else
           {
                type = "M";
                newcur = this._LogicFirstPos;
           } 
        }            
        var elem = this._GetDateElementText(type);
        m_arrDate[this.get_CultureDateFormat().indexOf(type)] = elem; 
        var value = m_arrDate[0] + this.get_CultureDatePlaceholder() + m_arrDate[1] + this._CultureDatePlaceholder + m_arrDate[2];
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            var aux = wrapper.get_Value().substring(this._LogicFirstPos,this._LogicLastPos+1);
            if (aux.split(" ").length == 3)
            {
                value += " " + aux.split(" ")[1] + " " + aux.split(" ")[2];
            }
            else
            {
                value += " " + aux.split(" ")[1];
            }
        }
        this.loadMaskValue(value,this._LogicFirstPos,this._LogicSymbol);
        this.setSelectionRange(newcur,newcur);
    }
    //
    // Get Element Date 
    //
    , _GetDateElementText : function(Type)
    {
        var aux;
        var m_arrDate;
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            var auxdate = this._LogicTextMask.substring(this._LogicFirstPos,this._LogicLastPos+1).split(" ")[0];
            m_arrDate = auxdate.split(this.get_CultureDatePlaceholder());
        }
        else
        {
            m_arrDate = this._LogicTextMask.substring(this._LogicFirstPos,this._LogicLastPos+1).split(this.get_CultureDatePlaceholder());
        }
        m_arrDate[this.get_CultureDateFormat().indexOf("D")] = m_arrDate[this.get_CultureDateFormat().indexOf("D")].replace(new RegExp("(\\" + this._LogicPrompt + ")", "g"), this._PromptChar) + '';
        aux = m_arrDate[this.get_CultureDateFormat().indexOf("D")].replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        if (aux !="" && aux.length < 2)
        {
            aux = "0" + aux;
            m_arrDate[this.get_CultureDateFormat().indexOf("D")] = aux
        }
        
        m_arrDate[this.get_CultureDateFormat().indexOf("M")] = m_arrDate[this.get_CultureDateFormat().indexOf("M")].replace(new RegExp("(\\" + this._LogicPrompt + ")", "g"), this._PromptChar) + '';
        aux = m_arrDate[this.get_CultureDateFormat().indexOf("M")].replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        if (aux !="" && aux.length < 2)
        {
            aux = "0" + aux;
            m_arrDate[this.get_CultureDateFormat().indexOf("M")] =  aux;
        }
        
        var Y4 = (this._maskvalid.indexOf("9999") != -1)?true:false;
        m_arrDate[this.get_CultureDateFormat().indexOf("Y")] = m_arrDate[this.get_CultureDateFormat().indexOf("Y")].replace(new RegExp("(\\" + this._LogicPrompt + ")", "g"), this._PromptChar) + '';
        aux = m_arrDate[this.get_CultureDateFormat().indexOf("Y")].replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        if (Y4)
        {
            if (aux !="" && aux.length < 4)
            {
                while (aux.length < 4)
                {
                    aux = "0" + aux;
                }
                m_arrDate[this.get_CultureDateFormat().indexOf("Y")] = aux;
            }
        }
        else
        {
            if (aux !="" && aux.length < 2)
            {
                aux = "0" + aux;
                m_arrDate[this.get_CultureDateFormat().indexOf("Y")] = aux;
            }
        }
        return m_arrDate[this.get_CultureDateFormat().indexOf(Type)];
    }
    //
    // Get Bound Selection
    //
    , _GetBoundSelection : function()
    {
        var ret = null;
        var input = this.get_element();
        if (input.setSelectionRange) 
        {
            if (input.selectionStart != input.selectionEnd)
            {
                ret = {left: parseInt(input.selectionStart,10),right: parseInt(input.selectionEnd,10)};
            }
        }    
        else if (document.selection) 
        {
            sel = document.selection.createRange();
            if (sel.text != "")
            {
                var tam = parseInt(sel.text.length,10);
                sel.text = String.fromCharCode(3) + sel.text;
                var dummy = input.createTextRange();
                dummy.findText(String.fromCharCode(3));
                dummy.select();
                var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(input);
                var pos = parseInt(wrapper.get_Value().indexOf(String.fromCharCode(3)),10);
                document.selection.clear();
                ret = {left: pos,right: pos+tam};
            }
        }
        return ret;
    }
    //
    // delete Selection
    //
    , _deleteTextSelection : function()
    {
        var input = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(input);
        var masktext = wrapper.get_Value();
        var lenaux = -1;
        var begin = -1;
        var isDel = false;
        if (input.setSelectionRange) 
        {
            if (input.selectionStart != input.selectionEnd)
            {
                var ini = parseInt(input.selectionStart,10);
                var fim = parseInt(input.selectionEnd,10);
                isDel = true;
                lenaux = fim - ini;
                begin=input.selectionStart;
                input.selectionEnd = input.selectionStart;
            }
        }
        else if (document.selection) 
        {
            sel = document.selection.createRange();
            if (sel.text != "")
            {
                isDel = true;
                var aux = sel.text + String.fromCharCode(3);
                sel.text = aux;
                var dummy = input.createTextRange();
                dummy.findText(aux);
                dummy.select();
                begin = wrapper.get_Value().indexOf(aux);
                document.selection.clear();
                lenaux = parseInt(aux.length,10)-1;
            }
        }
        if (isDel)
        {
            for (i = 0 ; i < lenaux ; i++) 
            {
                if (this._isValidMaskedEditPosition(begin+i))
                {
                    masktext = masktext.substring(0,begin+i) + this._PromptChar + masktext.substring(begin+i+1);
                    this._LogicTextMask = this._LogicTextMask.substring(0,begin+i) + this._LogicPrompt + this._LogicTextMask.substring(begin+i+1);
                }
            }
            wrapper.set_Value(masktext);
            if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
            {
                begin += lenaux;
            }
        }
        this._DirectSelText = "";
        return begin;
    }
    , _isNormalChar : function(evt,scanCode) {
        /// <summary>
        /// Returns true if the specified charCode is a key rather than a normal (displayable) character or Enter Key
        /// </summary>
        /// <param>
        ///  name="scanCode" type="integer" : keycode
        /// </param>
        /// <returns type="Boolean" />
        var ret = true;
        if (Sys.Browser.agent == Sys.Browser.Opera && evt.type == "keydown")
        {
            this._SaveKeyDown = scanCode;
        }
        if (scanCode < 32) { // < space
            ret = false;
        }
        else if (Sys.Browser.agent != Sys.Browser.InternetExplorer || evt.type == "keydown") 
        {
            switch (scanCode) 
            {
                case 33: //pg up or ! 
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            //pg up
                            ret = false;
                        }
                    }
                    break;
                case 34: //pg down  or " 
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            //pg down
                            ret = false;
                        }
                    }
                    break;
                case 35: //end   
                    if (Sys.Browser.agent == Sys.Browser.Opera && evt.type == "keypress")
                    {
                        //at opera keydown = 51 keypress = 35 = #
                        if (this._SaveKeyDown == 35) 
                        {
                            //END
                            ret = false;
                        }
                    }
                    else
                    {
                        ret = false;
                    }
                    break;
                case 36: //home
                    if (Sys.Browser.agent == Sys.Browser.Opera && evt.type == "keypress")
                    {
                        //at opera keydown = 52 keypress = 36 = $
                        if (this._SaveKeyDown == 36)
                        {
                            //home
                            ret = false;
                        }
                    }
                    else
                    {
                        ret = false;
                    }
                    break;
                case 37: //left  or % 
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            //left
                            ret = false;
                        }
                    }
                    break;
                case 38: //up or &
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            //up
                            ret = false;
                        }
                    }
                    break;
                case 39: //right or  '
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            //right
                            ret = false;
                        }
                    }
                    break;
                case 40: //down or (
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            //down
                            ret = false;
                        }
                    }
                    break;
                case 45: //ins - at opera Inconsistency with -
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null && Sys.Browser.agent != Sys.Browser.Opera)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            ret = false;
                        }
                    }
                    // re-valid Ins for opera
                    else if (Sys.Browser.agent == Sys.Browser.Opera)   
                    {
                        //assume ins = char "-"
                        //at opera Shift-ins in MaskedEdit not execute
                        ret = true;
                    }
                    else
                    {
                        ret = false;
                    }
                    break;
                case 86: // V   
                case 118: // v
                    //ctrl press
                    if (!evt.rawEvent.shiftKey && evt.rawEvent.ctrlKey && !evt.rawEvent.altKey) 
                    {
                        ret = false;
                    }
                    break;
                case 46: //del FF ~ Mozilla - at opera Inconsistency with .
                    if (typeof(evt.rawEvent.which) != "undefined" && evt.rawEvent.which !=null && Sys.Browser.agent != Sys.Browser.Opera)
                    {
                        if (evt.rawEvent.which == 0)
                        {
                            ret = false;
                        }
                    }
                    else if (Sys.Browser.agent == Sys.Browser.Opera && evt.type == "keypress")
                    {
                        //at opera keydown = 78 keypress = 46 = . at numpad
                        if (this._SaveKeyDown == 127)
                        {
                            ret = false;
                        }
                    }
                    else
                    {
                        ret = false;
                    }
                    break;
                case 127: //del IE - at opera Inconsistency with .
                    ret = false;
                    break;
            }
        }        
        return ret;
    }
    , _KeyCode : function(evt) {
        /// <summary>
        /// Get Keycode for any browser
        /// and convert keycode Safari to IE Code
        /// </summary>
        /// <param>
        /// Event info name="evt" type="Sys.UI.DomEvent" 
        /// </param>
        /// <Return>
        /// Keycode value 
        /// </Return>
        scanCode = 0;
        if (evt.keyIdentifier) {
            if (evt.charCode == 63272) { //63272: 'KEY_DELETE', 46
                scanCode = 46;
            }
            else if (evt.charCode == 63302) { //63302: 'KEY_INSERT', 45
                scanCode = 45;
            }
            else if (evt.charCode == 63233) { //63233: 'KEY_ARROW_DOWN',40
                scanCode = 40;
            }
            else if (evt.charCode == 63235) { //63235: 'KEY_ARROW_RIGHT', 39
                scanCode = 39;
            }
            else if (evt.charCode == 63232) { //63232: 'KEY_ARROW_UP', 38
                scanCode = 38;
            }
            else if (evt.charCode == 63234) { //63234: 'KEY_ARROW_LEFT', 37
                scanCode = 37;
            }
            else if (evt.charCode == 63273) { //63273: 'KEY_HOME', 36
                scanCode = 36;
            }
            else if (evt.charCode == 63275) { //63275: 'KEY_END', 35
                scanCode = 35;
            }
            else if (evt.charCode == 63277) { //63277: 'KEY_PAGE_DOWN', 34
                scanCode = 34;
            }
            else if (evt.charCode == 63276) { //63276: 'KEY_PAGE_UP', 33
                scanCode = 33;
            }
            else if (evt.charCode == 3) { //3: 'KEY_ENTER', 13
                scanCode = 13;
            }
        }    
        if (scanCode == 0) {
            if (evt.charCode) {
                scanCode = evt.charCode;
            }
        }
        if (scanCode == 0) {
            scanCode = evt.keyCode;
        }
        return scanCode;
    }
    //
    // Init value startup
    //
    , _InitValue : function(value,loadFirst)
    {
        this._LogicSymbol = "";
        var e = this.get_element();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(e);
        wrapper.set_Value(this._EmptyMask);
        if (value == this._EmptyMask || value == "")
        {
            this.loadValue("",this._LogicFirstPos);
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Date && value != "")
        {
            value = this.ConvFmtDate(value,loadFirst);
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Time && value != "")
        {
            value = this.ConvFmtTime(value,loadFirst);
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime && value != "")
        {
            value = this.ConvFmtDateTime(value,loadFirst);
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && value != "")
        {
            value = this.ConvFmtNumber(value,loadFirst);
        }
        if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.LeftToRight && value != "")
        {
            if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number)
            {
                this._InputDirection = AjaxControlToolkit.MaskedEditInputDirections.RightToLeft;
                this.loadValue(value,this._LogicLastPos);
                this._InputDirection = AjaxControlToolkit.MaskedEditInputDirections.LeftToRight;
            }
            else
            {
                this.loadValue(value,this._LogicFirstPos);
            }
        } 
        else if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft && value != "")
        {
            this.loadValue(value,this._LogicLastPos);
        }
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number)
        {
            if (this._InLostfocus && this._LogicSymbol == "-" && this._OnBlurCssNegative != "")
            {
                this.AddCssClassMaskedEdit(this._OnBlurCssNegative);
            }
        }
    }
    //
    // Load initial value with mask
    //
    , loadMaskValue : function(value,logicPosition, Symb)
    {
        this._createMask();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        wrapper.set_Value(this._EmptyMask);
        if ( (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime) && this.get_CultureFirstLettersAMPM().toUpperCase().indexOf(Symb.toUpperCase().substring(0,1)) != -1)
        {
            if (this._AcceptAmPm)
            {
                this.InsertAMPM(Symb.toUpperCase().substring(0,1));
            }
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(Symb) != -1)
        {
            this.InsertSignal(Symb);
        }
        var i = 0;
        for (i = 0 ; i < parseInt(value.length,10) ; i++) 
        {
            var c = value.substring(i+logicPosition,i+logicPosition+1);     
            if (this._processKey(logicPosition+i,c)) 
            {
                this._insertContent(c,logicPosition+i);
            }
        }
    }
    //
    // Load initial value in mask
    //
    , loadValue : function(value,logicPosition)
    {
        this._createMask();
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        wrapper.set_Value(this._EmptyMask);
        if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.LeftToRight)
        {
            var i = 0;
            for (i = 0 ; i < parseInt(value.length,10) ; i++) 
            {
                var c = value.substring(i,i+1);     
                if ( (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime) && this.get_CultureFirstLettersAMPM().toUpperCase().indexOf(c.toUpperCase()) != -1)
                {
                    if (this._AcceptAmPm)
                    {
                        this.InsertAMPM(c);
                    }
                }
                else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(c) != -1)
                {
                    this.InsertSignal(c);
                }
                if (this._processKey(logicPosition,c)) 
                {
                    this._insertContent(c,logicPosition);
                    logicPosition  = this._getNextPosition(logicPosition+1);
                }
            }
        }
        else if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
        {
            if (logicPosition == this._LogicLastInt)
            {
                logicPosition = this._getPreviousPosition(logicPosition);
                var arr_num = value.split(this.get_CultureDecimalPlaceholder())
                // int element
                for (i = parseInt(arr_num[0].length,10) ; i > 0  ; i--) 
                {
                    var c = arr_num[0].substring(i-1,i);  
                    if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(c) != -1)
                    {
                        this.InsertSignal(c);
                    }
                    if (this._processKey(logicPosition,c)) 
                    {
                        this._insertContent(c,logicPosition);
                        logicPosition  = this._getPreviousPosition(logicPosition-1);
                    }
                } 
                // decimal element
                if (arr_num.length > 1)
                {
                    logicPosition  = this._getNextPosition(this._LogicLastInt);
                    for (i = 0 ; i < parseInt(arr_num[1].length,10) ; i++) 
                    {
                        var c = arr_num[1].substring(i,i+1);     
                        if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(c) != -1)
                        {
                            this.InsertSignal(c);
                        }
                        if (this._processKey(logicPosition,c)) 
                        {
                            this._insertContent(c,logicPosition);
                            logicPosition  = this._getNextPosition(logicPosition+1);
                        }
                    }
                }
            }
            else
            {
                for (i = parseInt(value.length,10) ; i > 0  ; i--) 
                {
                    var c = value.substring(i-1,i);  
                    if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative != AjaxControlToolkit.MaskedEditShowSymbol.None && "+-".indexOf(c) != -1)
                    {
                        this.InsertSignal(c);
                    }
                    if (this._processKey(logicPosition,c)) 
                    {
                        this._insertContent(c,logicPosition);
                        logicPosition  = this._getPreviousPosition(logicPosition-1);
                    }
                }   
            }
        }
    }
    //
    // AutoFormat (date and Time and number)
    //
    , AutoFormatNumber : function()
    {
        var i;
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        ValueText = wrapper.get_Value();
        var AutoComp = this._AutoCompleteValue;
        var okdgt = false;
        for (i = this._LogicFirstPos ; i <= this._LogicLastPos ; i++) 
        {
            if (this._LogicTextMask.substring(i,i+1) == this._LogicPrompt)
            {
                var CharComp = "0";
                if (AutoComp != "")
                {
                    CharComp = AutoComp.substring(i-this._LogicFirstPos,i+1-this._LogicFirstPos);
                }
                if (okdgt)
                {
                    this._LogicTextMask = this._LogicTextMask.substring(0,i) + CharComp + this._LogicTextMask.substring(i+1);
                    ValueText = ValueText.substring(0,i) + CharComp + ValueText.substring(i+1);
                }
            }
            else if (this._LogicMask.substring(i,i+1) == this._LogicPrompt && "123456789".indexOf(this._LogicTextMask.substring(i,i+1)) != -1)
            {
                okdgt = true;
            }
        }
        wrapper.set_Value(ValueText);
        return ValueText;
    }
    , AutoFormatTime : function()
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());   
        ValueText = wrapper.get_Value();
        var autocomp = this._AutoCompleteValue;
        if (autocomp.indexOf(this.get_CultureTimePlaceholder()) == -1)
        {
            autocomp = "";
        }
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            if (ValueText.split(" ").length == 3)
            {
                ValueText = ValueText.split(" ")[1] + " " + ValueText.split(" ")[2]; 
            }
            else
            {
                ValueText = ValueText.split(" ")[1]; 
            }
            if (autocomp != "")
            {
                // if not have date...
                if (autocomp.indexOf(this.get_CultureDatePlaceholder()) == -1)
                {
                    autocomp = " " + autocomp;
                }
                if (autocomp.split(" ").length == 3)
                {
                    autocomp = autocomp.split(" ")[1] + " " + autocomp.split(" ")[2];
                }
                else
                {
                    autocomp = autocomp.split(" ")[1];
                }
            }
        }
        var CurDate = new Date();
        var Hcur = CurDate.getHours().toString();
        if (Hcur.length < 2)
        {
            Hcur = "0" + Hcur;
        }
        if (autocomp != "")
        {
            Hcur = autocomp.substring(0,2);
        }
        var SetAM = false;
        var SetPM = false;
        var LcAM = "";
        var LcPM = "";
        var Symb = "";
        if (this.get_CultureAMPMPlaceholder() != "")
        {
            var m_arrtm = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator);
            LcAM = m_arrtm[0];
            LcPM = m_arrtm[1];
            if (autocomp == "")
            {
                var Symb = LcAM;
                if (Hcur > 12)
                {
                    Hcur = (parseInt(Hcur,10) - 12).toString();
                    if (Hcur.length < 2)
                    {
                        Hcur = "0" + Hcur;
                    }
                    Symb = LcPM;
                }
            }
            else
            {
                Symb = LcAM; // default
                if (autocomp.indexOf(LcPM) != -1)
                {
                    // set by autocomplete
                    Symb = LcPM;
                }
            }
            // set by input
            SetAM = true; // default
            if (ValueText.indexOf(LcPM) != -1 && LcPM != "")
            {
                // set by input
                SetPM = true;
            }
            if (!this._AcceptAmPm)
            {
                Symb = "";
                SetPM = false;
                SetAM = false;
            }
            else
            {
                //check empty hour to validate AM/PM
                var emp = true;
                if (ValueText.substring(0,1) != this._PromptChar || ValueText.substring(1,2) != this._PromptChar)
                {
                    emp = false;
                }
                if (emp && Symb != "") 
                {
                    SetAM = true; // default;
                    SetPM = false;
                    if (LcPM == Symb)
                    {
                        // set by current time
                        SetPM = true;
                    }
                }
            }
        }
        var Mcur = CurDate.getMinutes().toString();
        if (Mcur.length < 2)
        {
            Mcur = "0" + Mcur;
        }
        if (autocomp != "" )
        {
            Mcur = autocomp.substring(3,5);
        }
        var Scur = "00";
        var PH,PM;
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            PH = ValueText.substring(0,2);
            PH = this._AdjustTime(PH,Hcur);
            PM = ValueText.substring(3,5);
            PM = this._AdjustTime(PM,Mcur);
        }
        else
        {
            PH = ValueText.substring(this._LogicFirstPos,this._LogicFirstPos+2);
            PH = this._AdjustTime(PH,Hcur);
            PM = ValueText.substring(this._LogicFirstPos+3,this._LogicFirstPos+5);
            PM = this._AdjustTime(PM,Mcur);
        }
        var maskvld = this._maskvalid;
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            maskvld = maskvld.split(" ")[1];
        }
        if (maskvld == "99:99:99")
        {
            if (autocomp != "" )
            {
                Scur = autocomp.substring(6);
            }
            var PS;
            if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
            {
                PS = ValueText.substring(6,8);
                PS = this._AdjustTime(PS,Scur);
            }
            else
            {
                PS = ValueText.substring(this._LogicFirstPos+6,this._LogicFirstPos+8);
                PS = this._AdjustTime(PS,Scur);
            }
            ValueText = PH + this.get_CultureTimePlaceholder() + PM + this.get_CultureTimePlaceholder() + PS;
        }
        else
        {
            ValueText = PH + this.get_CultureTimePlaceholder() + PM;
        }
        if (SetPM)
        {
            ValueText += " " + LcPM;
        }
        else if (SetAM)
        {
            ValueText += " " + LcAM;
        }
        if (this._MaskType != AjaxControlToolkit.MaskedEditType.DateTime)
        {
            this.loadValue(ValueText,this._LogicFirstPos);
        }
        return ValueText;
    }
    , AutoFormatDateTime : function()
    {
        var PartDt = this.AutoFormatDate();            
        var PartTm = this.AutoFormatTime();            
        this.loadValue(PartDt + " " + PartTm,this._LogicFirstPos);
        return PartDt + " " + PartTm;
    }
    , AutoFormatDate : function()
    {
        var D = this._GetDateElementText("D").replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        var M = this._GetDateElementText("M").replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        var Y = this._GetDateElementText("Y").replace(new RegExp("(\\" + this._PromptChar + ")", "g"), "") + '';
        var Y4 = (this._maskvalid.indexOf("9999") != -1)?true:false;
        var autocomp = this._AutoCompleteValue;
        if (autocomp.indexOf(this.get_CultureDatePlaceholder()) == -1)
        {
            autocomp = "";
        }
        var Dcur,Mcur,Ycur;
        if (autocomp == "")
        {
            var CurDate = new Date();
            Dcur = (CurDate.getUTCDate()).toString();
            if (Dcur.length < 2)
            {
                Dcur = "0" + Dcur;
            }
            Mcur = (CurDate.getUTCMonth()+1).toString();
            if (Mcur.length < 2)
            {
                Mcur = "0" + Mcur;
            }
            if (Y4)
            {
                Ycur = CurDate.getUTCFullYear().toString();
            }
            else
            {
                Ycur = Ycur.substring(2);
            }
        }
        else
        {
            var m_arrDate;
            if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
            {
                // if not have time...
                if (autocomp.indexOf(this.get_CultureTimePlaceholder()) == -1)
                {
                    autocomp = autocomp + " ";
                }
                var partdt = autocomp.split(" ")[0]; 
                m_arrDate = partdt.split(this.get_CultureDatePlaceholder());
            }
            else
            {
                m_arrDate = autocomp.split(this.get_CultureDatePlaceholder());
            }
            if (this.get_CultureDateFormat() == "DMY")
            {
                Dcur = m_arrDate[0];
                Mcur = m_arrDate[1];
                Ycur = m_arrDate[2];
            }
            else if (this.get_CultureDateFormat() == "MDY")
            {
                Dcur = m_arrDate[1];
                Mcur = m_arrDate[0];
                Ycur = m_arrDate[2];
            }
            else if (this.get_CultureDateFormat() == "DYM")
            {
                Dcur = m_arrDate[0];
                Mcur = m_arrDate[2];
                Ycur = m_arrDate[1];
            }
            else if (this.get_CultureDateFormat() == "MYD")
            {
                Dcur = m_arrDate[2];
                Mcur = m_arrDate[0];
                Ycur = m_arrDate[1];
            }
            else if (this.get_CultureDateFormat() == "YMD")
            {
                Dcur = m_arrDate[2];
                Mcur = m_arrDate[1];
                Ycur = m_arrDate[0];
            }
            else if (this.get_CultureDateFormat() == "YDM")
            {
                Dcur = m_arrDate[1];
                Mcur = m_arrDate[2];
                Ycur = m_arrDate[0];
            }            
            if (Dcur.length < 2)
            {
                Dcur = "0" + Dcur;
            }
            if (Mcur.length < 2)
            {
                Mcur = "0" + Mcur;
            }
            if (Y4)
            {
                while (Ycur.length < 4)
                {
                    Ycur = "0" + Ycur;
                }
            }
            else
            {
                while (Ycur.length < 2)
                {
                    Ycur = "0" + Ycur;
                }
            }
        }
        if (D == "")
        {
            D = Dcur;
        }
        if (M== "")
        {
            M = Mcur;
        }
        if (Y == "")
        {
            Y = Ycur;
        }
        var value;
        if (this.get_CultureDateFormat() == "DMY")
        {
          value = D + this.get_CultureDatePlaceholder() + M + this._CultureDatePlaceholder + Y;
        }
        else if (this.get_CultureDateFormat() == "MDY")
        {
          value = M + this.get_CultureDatePlaceholder() + D + this._CultureDatePlaceholder + Y;
        }
        else if (this.get_CultureDateFormat() == "DYM")
        {
          value = D + this.get_CultureDatePlaceholder() + Y + this._CultureDatePlaceholder + M;
        }
        else if (this.get_CultureDateFormat() == "MYD")
        {
          value = M + this.get_CultureDatePlaceholder() + Y + this._CultureDatePlaceholder + D;
        }
        else if (this.get_CultureDateFormat() == "YMD")
        {
          value = Y + this.get_CultureDatePlaceholder() + M + this._CultureDatePlaceholder + D;
        }
        else if (this.get_CultureDateFormat() == "YDM")
        {
          value = Y + this.get_CultureDatePlaceholder() + D + this._CultureDatePlaceholder + M;
        }
        if (this._MaskType != AjaxControlToolkit.MaskedEditType.DateTime)
        {
            this.loadValue(value,this._LogicFirstPos);
        }
        return value;
    }
    //
    // normalize initial value (number)
    //
    , ConvFmtNumber : function(input,loadFirst)
    {
        if (this._maskvalid.split(this.get_CultureDecimalPlaceholder()).length == 2)
        {
            if (input.substring(input.length-1,input.length) == this.get_CultureDecimalPlaceholder())
            {
                input = input.substring(0,input.length-1);
            }
            if (input.indexOf(this.get_CultureDecimalPlaceholder()) == -1)
            {
                input += this.get_CultureDecimalPlaceholder();
                var i;
                var m_mask = this._maskvalid;
                for (i = 0;i < m_mask.length;i++)
                {
                    input += "0";
                }
                return input;
            }
        }
        return input;
    }
    //
    // normalize initial value (Time)
    //
    , ConvFmtTime : function(input,loadFirst)
    {
        var AddH = 0;
        var SetAM = false;
        var SetPM = false;
        var LcAM = "";
        var LcPM = "";
        if (this.get_CultureAMPMPlaceholder() != "")
        {
            LcAM = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator)[0];
            LcPM = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator)[1];
        }
        //perform convert for loading of a page 
        if (loadFirst)
        {
            var LDLcAM = "";
            var LDLcPM = "";
            if (this._CultureAMPMPlaceholder != "")
            {
                LDLcAM = this._CultureAMPMPlaceholder.split(this._AMPMPlaceholderSeparator)[0];
                LDLcPM = this._CultureAMPMPlaceholder.split(this._AMPMPlaceholderSeparator)[1];
            }
            // convert current Culture to user culture format (24H)
            if (this.get_UserTimeFormat() == AjaxControlToolkit.MaskedEditUserTimeFormat.TwentyFourHour)
            {
                input = input.replace(new RegExp("(\\" + LDLcAM + ")", "g"),"");
                if (input.indexOf(LDLcPM) != -1)
                {
                    AddH = 12;
                }
                input = input.replace(new RegExp("(\\" + LDLcPM + ")", "g"),"");
            }
        }    
        if (input.indexOf(LcAM) != -1 && LcAM != "")
        {
            SetAM = true;
        }
        else if (input.indexOf(LcPM) != -1 && LcPM != "")
        {
            SetPM = true;
        }
        if (LcAM != "")
        {
            input = input.replace(new RegExp("(\\" + LcAM + ")", "g"), "");
        }
        if (LcPM != "")
        {
            input = input.replace(new RegExp("(\\" + LcPM + ")", "g"), "");
        }
        input = input.replace(new RegExp("(\\" + " " + ")", "g"), "");
        var m_arrTime = input.split(this.get_CultureTimePlaceholder());
        var m_mask = this._maskvalid;
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            m_mask = m_mask.split(" ")[1];
        }
        m_mask = m_mask.split(":");
        if (parseInt(m_arrTime.length,10) < 2 || parseInt(m_arrTime.length,10) > 3)
        {
            return "";
        }
        var H = parseInt(m_arrTime[0],10) + AddH;
        H = H.toString();
        if (H.length < m_mask[0].length)
        {
            while (H.length < m_mask[0].length)
            {
                H = "0" + H;
            }
        }
        m_arrTime[0] = H;
        var M = parseInt(m_arrTime[1],10) + '';
        if (M.length < m_mask[1].length)
        {
            while (M.length < m_mask[1].length)
            {
                M = "0" + M;
            }
        }
        m_arrTime[1] = M;
        var value = "";
        if (parseInt(m_arrTime.length,10) == 3)
        {
            var S = parseInt(m_arrTime[2],10) + '';
            if (S.length < m_mask[2].length)
            {
                while (S.length < m_mask[2].length)
                {
                    S = "0" + S;
                }
            }
            m_arrTime[2] = S;
            value = m_arrTime[0] + this.get_CultureTimePlaceholder() + m_arrTime[1] + this.get_CultureTimePlaceholder() + m_arrTime[2];
        }
        else
        {
            value = m_arrTime[0] + this.get_CultureTimePlaceholder() + m_arrTime[1]; 
        }
        if (SetAM)
        {
            value += " " + LcAM;
        }
        else if (SetPM)
        {
            value += " " + LcPM;
        }
        return value;
    }
    //
    // normalize initial value (Date)
    //
    , ConvFmtDateTime : function(input,loadFirst)
    {
        var partdt = input.split(" ")[0];
        var parttm = input.split(" ")[1];
        if (input.split(" ").length == 3)
        {
            parttm += " " + input.split(" ")[2];
        }
        partdt = this.ConvFmtDate(partdt,loadFirst);
        parttm = this.ConvFmtTime(parttm,loadFirst);
        return  partdt + " " + parttm;
    }
    , ConvFmtDate : function(input,loadFirst)
    {
        var m_arrDateLD; 
        var m_arrDate;
        //perform convert for loading of a page 
        if (loadFirst)
        {
            //split values for perform convert load 
            m_arrDateLD = input.split(this.get_CultureDatePlaceholder());
            //split destination value
            m_arrDate = input.split(this.get_CultureDatePlaceholder());
            // convert current Culture to user culture format
            if (this.get_UserDateFormat() != AjaxControlToolkit.MaskedEditUserDateFormat.None)
            {
                  m_arrDate[this.get_CultureDateFormat().indexOf("D")] = m_arrDateLD[this._CultureDateFormat.indexOf("D")];   
                  m_arrDate[this.get_CultureDateFormat().indexOf("M")] = m_arrDateLD[this._CultureDateFormat.indexOf("M")];   
                  m_arrDate[this.get_CultureDateFormat().indexOf("Y")] = m_arrDateLD[this._CultureDateFormat.indexOf("Y")];   
            }
        }
        else
        {
            // split value (not load) 
            m_arrDate = input.split(this.get_CultureDatePlaceholder());
        }
        var m_mask = this._maskvalid;
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
        {
            m_mask = m_mask.split(" ")[0];
        }
        m_mask = m_mask.split("/");
        if (parseInt(m_arrDate.length,10) != 3)
        {
            return "";
        }
        var D = parseInt(m_arrDate[this.get_CultureDateFormat().indexOf("D")],10) + '';
        if (D.length < m_mask[this.get_CultureDateFormat().indexOf("D")].length)
        {
            while (D.length < m_mask[this.get_CultureDateFormat().indexOf("D")].length)
            {
                D = "0" + D;
            }
        }
        m_arrDate[this.get_CultureDateFormat().indexOf("D")] = D;
        var M = parseInt(m_arrDate[this.get_CultureDateFormat().indexOf("M")],10) + '' ;
        if (M.length < m_mask[this.get_CultureDateFormat().indexOf("M")].length)
        {
            while (M.length < m_mask[this.get_CultureDateFormat().indexOf("M")].length)
            {
                M = "0" + M;
            }
        }
        m_arrDate[this.get_CultureDateFormat().indexOf("M")] = M;
        var Y = parseInt(m_arrDate[this.get_CultureDateFormat().indexOf("Y")],10) + '';
        while (Y.length < m_mask[this.get_CultureDateFormat().indexOf("Y")].length)
        {
            Y = "0" + Y;
        }
        m_arrDate[this.get_CultureDateFormat().indexOf("Y")] = Y;
        return m_arrDate[0] + this.get_CultureDatePlaceholder() + m_arrDate[1] + this._CultureDatePlaceholder + m_arrDate[2];
    }
    //
    // Set/Remove CssClass
    //
    , AddCssClassMaskedEdit : function(CssClass)
    {
        var e = this.get_element();
        Sys.UI.DomElement.removeCssClass(e,this._OnBlurCssNegative);
        Sys.UI.DomElement.removeCssClass(e,this._OnFocusCssClass);
        Sys.UI.DomElement.removeCssClass(e,this._OnFocusCssNegative);
        Sys.UI.DomElement.removeCssClass(e,this._OnInvalidCssClass);
        if (CssClass != "")
        {
            Sys.UI.DomElement.addCssClass(e,CssClass);
        }
    }
    //
    // Set Cancel Event for cross browser
    //
    , _SetCancelEvent : function(evt) {
        /// <summary>
        /// Cancel Event for any browser
        /// </summary>
        /// <param name="evt" type="Sys.UI.DomEvent">
        /// Event info
        /// </param>
        if (typeof(evt.returnValue) !== "undefined") {
            evt.returnValue = false;
        }
        if (typeof(evt.cancelBubble) !== "undefined") {
            evt.cancelBubble = true;
        }
        if (typeof(evt.preventDefault) !== "undefined") {
            evt.preventDefault();
        }
        if (typeof(evt.stopPropagation) !== "undefined") {
            evt.stopPropagation();
        }
    }
    //
    // Capture result validator after Postback
    //
    ,_CaptureServerValidators : function()
    {
        var ret = true;
        var msg = this._ExternalMessageError;
        if  (typeof(Page_Validators) != "undefined")
        {
            var ctrval = null;
            var first = true;
            for (i = 0; i < Page_Validators.length; i++) 
            {
                ctrval = Page_Validators[i];
                if (typeof(ctrval.enabled) == "undefined" || ctrval.enabled != false) 
                {
                    if (ctrval.TargetValidator == this.get_element().id)
                    {
                        if (!ctrval.isvalid)
                        {
                            if (first)
                            {
                                first = false;
                                msg = "";
                            }
                            if (typeof(ctrval.errormessage) == "string")
                            {
                                if (msg != "")
                                {
                                    msg += ", ";
                                }
                                msg += ctrval.errormessage;
                            }
                            ret = false;
                        }
                    }
                }
            }
        }
        this._ExternalMessageError = msg;
        return ret;
    }
    //
    // Capture and execute client validator to control
    //
    ,_CaptureClientsValidators : function()
    {
        var ret = true;
        // clear local save External Message Error
        var msg = "";
        this._ExternalMessageError = msg;
        // Page_Validators is a Array of script asp.net
        if  (typeof(Page_Validators) != "undefined")
        {
            var ctrval = null;
            for (i = 0; i < Page_Validators.length; i++) 
            {
                ctrval = Page_Validators[i];
                if (typeof(ctrval.enabled) == "undefined" || ctrval.enabled != false) 
                {
                    if (ctrval.TargetValidator == this.get_element().id)
                    {
                        if (typeof(ctrval.evaluationfunction) == "function") 
                        {
                            var crtret = ctrval.evaluationfunction(ctrval); 
                            if (!crtret)
                            {
                                ret = false;
                                if (typeof(ctrval.errormessage) == "string")
                                {
                                    if (msg != "")
                                    {
                                        msg += ", ";
                                    }
                                    msg += ctrval.errormessage;
                                }
                            }
                        }
                        else if(typeof(ctrval.evaluationfunction) == "string") 
                        {
                            var crtret; 
                            eval("crtret = " + ctrval.evaluationfunction + "(" + ctrval.id + ")"); 
                            if (!crtret)
                            {
                                ret = false;
                                if (typeof(ctrval.errormessage) == "string")
                                {
                                    if (msg != "")
                                    {
                                        msg += ", ";
                                    }
                                    msg += ctrval.errormessage;
                                }
                            }
                        }
                    }
                }
            }
        }
        this._ExternalMessageError = msg;
        return ret;
    }
    //
    // Show/hide Message Tip
    //
    ,ShowTooltipMessage : function(Visible)
    {
        if  (typeof(Page_Validators) == "undefined")
        {
            return;
        }
        var msg = "";
        if (!Visible)
        {
            msg = this._CurrentMessageError;
            this._CurrentMessageError = "";
        }
        var i = 0
        var ctrval = null;
        for (i = 0; i < Page_Validators.length; i++) 
        {
            ctrval = Page_Validators[i];
            if (ctrval.TargetValidator == this.get_element().id && ctrval.IsMaskedEdit == "true")
            {
                if (!Visible)
                {
                    ctrval.innerHTML = msg;
                    if (typeof(ctrval.display) == "string") 
                    {    
                        if (ctrval.display == "None") {
                            return;
                        }
                        if (ctrval.display == "Dynamic") {
                            ctrval.style.display = ctrval.isvalid ? "none" : "inline";
                            return;
                        }
                    }
                    return;
                }
                this._CurrentMessageError = ctrval.innerHTML;
                ctrval.innerHTML = ctrval.TooltipMessage;
                if (typeof(ctrval.display) == "string") 
                {    
                    if (ctrval.display == "None") {
                        return;
                    }
                    if (ctrval.display == "Dynamic") {
                        ctrval.style.display = "inline";
                        return;
                    }
                }
                ctrval.style.visibility = "visible";
                return;
            }
        }    
    }
    //
    // Insert Content at position in curpos
    //
    , _insertContent : function(value,curpos) 
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var masktext = wrapper.get_Value();
        masktext = masktext.substring(0,curpos) + value + masktext.substring(curpos+1);
        this._LogicTextMask = this._LogicTextMask.substring(0,curpos) + value + this._LogicTextMask.substring(curpos+1);
        wrapper.set_Value(masktext);
    }    
    //
    // Insert Content at last right position 
    //
    , _insertContentRight : function(value) 
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var masktext = wrapper.get_Value();
        curpos = this._getLastEmptyPosition();
        if (curpos < 0)
        {
            return;
        }
        var resttext = masktext.substring(curpos+1);
        var restlogi = this._LogicTextMask.substring(curpos+1);
        masktext = masktext.substring(0,curpos) + this._PromptChar;
        this._LogicTextMask = this._LogicTextMask.substring(0,curpos) + this._LogicPrompt;
        // clear rest of mask
        if (this._LogicLastInt != -1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
        {
            var arr_num = resttext.split(this.get_CultureDecimalPlaceholder());
            var arr_log = restlogi.split(this.get_CultureDecimalPlaceholder());
            for (i = 0 ; i < parseInt(arr_num[0].length,10) ; i++) 
            {
                if (this._isValidMaskedEditPosition(curpos+1+i))
                {
                    masktext += this._PromptChar;
                    this._LogicTextMask += this._LogicPrompt;
                }
                else
                {
                    masktext += arr_num[0].substring(i,i+1);
                    this._LogicTextMask += arr_log[0].substring(i,i+1);
                }
            }
            if (arr_num.length = 2) 
            {
                masktext += this.get_CultureDecimalPlaceholder() + arr_num[1];
                this._LogicTextMask += this.get_CultureDecimalPlaceholder() + arr_log[1];
            }
            // insert only valid text
            posaux = this._getNextPosition(curpos);
            for (i = 0 ; i < parseInt(arr_num[0].length,10); i++) 
            {
                if (this._isValidMaskedEditPosition(curpos+1+i) && arr_log[0].substring(i,i+1) != this._LogicPrompt)
                {
                    masktext = masktext.substring(0,posaux) + arr_num[0].substring(i,i+1) + masktext.substring(posaux+1);
                    this._LogicTextMask = this._LogicTextMask.substring(0,posaux) + arr_log[0].substring(i,i+1) + this._LogicTextMask.substring(posaux+1);
                    posaux = this._getNextPosition(posaux+1);
                }
            }
        }
        else
        {
            for (i = 0 ; i < parseInt(resttext.length,10) ; i++) 
            {
                if (this._isValidMaskedEditPosition(curpos+1+i))
                {
                    masktext += this._PromptChar;
                    this._LogicTextMask += this._LogicPrompt;
                }
                else
                {
                    masktext += resttext.substring(i,i+1);
                    this._LogicTextMask += restlogi.substring(i,i+1);
                }
            }
            // insert only valid text
            posaux = this._getNextPosition(curpos);
            for (i = 0 ; i < parseInt(resttext.length,10); i++) 
            {
                if (this._isValidMaskedEditPosition(curpos+1+i) && restlogi.substring(i,i+1) != this._LogicPrompt)
                {
                    masktext = masktext.substring(0,posaux) + resttext.substring(i,i+1) + masktext.substring(posaux+1);
                    this._LogicTextMask = this._LogicTextMask.substring(0,posaux) + restlogi.substring(i,i+1) + this._LogicTextMask.substring(posaux+1);
                    posaux = this._getNextPosition(posaux+1);
                }
            }            
        }
        // insert value
        var dif = 0;
        if (this._LogicLastInt != -1 && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
        {
            dif = this._LogicLastPos - this._LogicLastInt+1;
        }
        masktext = masktext.substring(0,this._LogicLastPos-dif) + value + masktext.substring(this._LogicLastPos-dif+1);
        this._LogicTextMask = this._LogicTextMask.substring(0,this._LogicLastPos-dif) + value + this._LogicTextMask.substring(this._LogicLastPos-dif+1);
        wrapper.set_Value(masktext);
    }    
    //
    // Insert Symbol AM/PM
    //
    , InsertAMPM : function(value)
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var masktext = wrapper.get_Value();
        var ASymMask = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator);
        var symb =  "";
        if (ASymMask.length == 2)
        {
            if (value.toUpperCase() == this.get_CultureFirstLetterAM().toUpperCase())
            {
              symb = ASymMask[0];
            }
            else if (value.toUpperCase() == this.get_CultureFirstLetterPM().toUpperCase())
            {
              symb = ASymMask[1];
            }
            this._LogicSymbol = symb;
        }
        masktext = masktext.substring(0,this._LogicLastPos+2) + symb + masktext.substring(this._LogicLastPos+2+symb.length);
        wrapper.set_Value(masktext);
    }
    //
    // Insert Symbol Negative
    //
    , InsertSignal : function(value)
    {
        var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(this.get_element());
        var masktext = wrapper.get_Value();
        if (value == "-" && this._LogicSymbol == "-")
        {
            value = "+";
        }
        if (value == "+")
        {
            value = " ";
            this._LogicSymbol = "";
            if (!this._InLostfocus && this._OnFocusCssClass != "")
            {
                this.AddCssClassMaskedEdit(this._OnFocusCssClass);
            }
            else if (!this._InLostfocus)
            {
                this.AddCssClassMaskedEdit("");
            }
        }
        else
        {
            this._LogicSymbol = "-";
            if (!this._InLostfocus && this._OnFocusCssNegative != "")
            {
                this.AddCssClassMaskedEdit(this._OnFocusCssNegative);
            }
        }
        if (this._AcceptNegative == AjaxControlToolkit.MaskedEditShowSymbol.Left)
        {
          masktext = masktext.substring(0,this._LogicFirstPos-1) + value + masktext.substring(this._LogicFirstPos);
        }
        else if (this._AcceptNegative == AjaxControlToolkit.MaskedEditShowSymbol.Right)
        {
          masktext = masktext.substring(0,this._LogicLastPos+1) + value + masktext.substring(this._LogicLastPos+2);
        }
        wrapper.set_Value(masktext);
    }
    //
    // Set Cursor at position in TextBox
    //
    , setSelectionRange : function(selectionStart, selectionEnd) 
    {
      input = this.get_element();
      if (input.setSelectionRange) 
      {
        input.setSelectionRange(selectionStart, selectionEnd);
      }
      else if (input.createTextRange) 
      {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
      }
    }
    //
    // get last position empty in text 
    //
    , _getLastEmptyPosition : function()
    {
        var pos = this._LogicLastPos;
        if (this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft && this._LogicLastInt != -1)
        {
            var curpos = this._getCurrentPosition();
            if (curpos <= this._LogicLastInt)
            {
                pos = this._LogicLastInt;
            }
        }
        while (pos >= 0 && this._LogicTextMask.substring(pos, pos+1) != this._LogicPrompt)
        {
            pos--;
        }
        return pos;
    }
    //
    // position is valid edit ?
    //
    , _isValidMaskedEditPosition : function(pos) 
    {
        return (this._LogicMask.substring(pos,pos+1) == this._LogicPrompt);
    }
    //
    // Next valid Position
    //
    , _getNextPosition : function(pos)
    {
        while (!this._isValidMaskedEditPosition(pos) && pos < this._LogicLastPos+1)
        {
            pos++;
        }
        if (pos > this._LogicLastPos+1)
        {
            pos = this._LogicLastPos+1;
        }
        return pos;
    }
    //
    // Previous valid Position
    //
    , _getPreviousPosition : function(pos)
    {
        while (!this._isValidMaskedEditPosition(pos) && pos > this._LogicFirstPos)
        {
            pos--;
        }
        if (pos < this._LogicFirstPos)
        {
            pos = this._LogicFirstPos;
        }
        return pos;
    }
    //
    // Current Position
    //
    , _getCurrentPosition : function()
    {
        begin = 0;
        input = this.get_element();
        if (input.setSelectionRange) 
        {
            begin = parseInt(input.selectionStart,10);
        }
        else if (document.selection) 
        {
            sel = document.selection.createRange();
            if (sel.text != "")
            {
                var aux = ""
                if (this._DirectSelText == "R")
                {
                    aux = sel.text + String.fromCharCode(3);
                }
                else if (this._DirectSelText == "L")
                {
                    aux = String.fromCharCode(3) + sel.text ;
                }
                sel.text = aux;
                this._DirectSelText == "";
            }
            else
            {
                sel.text = String.fromCharCode(3);
                this._DirectSelText == "";
            }
            var dummy = input.createTextRange();
            dummy.findText(String.fromCharCode(3));
            dummy.select();
            var wrapper = AjaxControlToolkit.TextBoxWrapper.get_Wrapper(input);
            begin = wrapper.get_Value().indexOf(String.fromCharCode(3));
            document.selection.clear();
        }
        if (begin > this._LogicLastPos+1)
        {
            begin = this._LogicLastPos+1;
        }
        if (begin < this._LogicFirstPos)
        {
            begin = this._LogicFirstPos;
        }
        return begin;
    }
    // Validate key at position in mask and/or filter
    //
    , _processKey : function(poscur,key) {
        var posmask = this._LogicMaskConv;
        //  9 = only numeric
        //  L = only letter
        //  $ = only letter and spaces
        //  C = only Custom - read from this._Filtered
        //  A = only letter and Custom
        //  N = only numeric and Custom
        //  ? = any digit
        var filter;
        if  (posmask.substring(poscur,poscur+1) == "9")
        {
            filter = this._charNumbers;
        }
        else if  (posmask.substring(poscur,poscur+1).toUpperCase() == "L")
        {
            filter = this._charLetters + this._charLetters.toLowerCase();
        }
        else if  (posmask.substring(poscur,poscur+1) == "$")
        {
            filter = this._charLetters + this._charLetters.toLowerCase() + " ";
        }
        else if  (posmask.substring(poscur,poscur+1).toUpperCase() == "C")
        {
            filter = this._Filtered;
        }
        else if  (posmask.substring(poscur,poscur+1).toUpperCase() == "A")
        {
            filter = this._charLetters + this._charLetters.toLowerCase() + this._Filtered;
        }
        else if  (posmask.substring(poscur,poscur+1).toUpperCase() == "N")
        {
            filter = this._charNumbers + this._Filtered;
        }
        else if  (posmask.substring(poscur,poscur+1) == "?")
        {
            filter = "";
        }
        else
        {
            return false;
        }
        if (filter == "")
        {
            return true;
        }
        // return true if we should accept the character.
        return (!filter || filter.length == 0 || filter.indexOf(key) != -1);
    }    
    //
    // create mask empty , logic mask empty
    // convert escape code and Placeholder to culture
    //
    , _createMask : function()
    {
        if (this._MaskConv == "" && this._Mask != "")
        {
            this._convertMask();
        } 
        var text = this._MaskConv;
        var i = 0;
        var masktext = "";
        var maskvld = "";
        var flagescape = false;
        this._LogicTextMask = "";
        this._QtdValidInput = 0;
        while (i < parseInt(text.length,10)) 
        {
            if (text.substring(i, i+1) == this._charEscape && flagescape == false) 
            {
                flagescape = true;
            }
            else if (this._CharsEditMask.indexOf(text.substring(i, i+1)) == -1) 
            {
                if (flagescape == true)
                {
                    flagescape = false;
                    masktext += text.substring(i,i+1);
                    maskvld += text.substring(i,i+1);
                    this._LogicTextMask += this._LogicEscape;
                }
                else
                {
                    if (this._CharsSpecialMask.indexOf(text.substring(i, i+1)) != -1) 
                    {
                        this._QtdValidInput ++;
                        if (text.substring(i, i+1) == "/")
                        {
                            masktext += this.get_CultureDatePlaceholder();
                            maskvld += "/";
                            this._LogicTextMask += this.get_CultureDatePlaceholder();
                        }
                        else if (text.substring(i, i+1) == ":")
                        {
                            masktext += this.get_CultureTimePlaceholder();
                            maskvld += ":";
                            this._LogicTextMask += this.get_CultureTimePlaceholder();
                        }
                        else if (text.substring(i, i+1) == ",")
                        {
                            masktext += this.get_CultureThousandsPlaceholder();
                            maskvld += ".";
                            this._LogicTextMask += this.get_CultureThousandsPlaceholder();
                        }
                        else if (text.substring(i, i+1) == ".")
                        {
                            masktext += this.get_CultureDecimalPlaceholder();
                            maskvld += ",";
                            this._LogicTextMask += this.get_CultureDecimalPlaceholder();
                        }
                    }
                    else
                    {
                        masktext += text.substring(i,i+1);
                        maskvld += text.substring(i,i+1);
                        this._LogicTextMask += text.substring(i,i+1);
                    }
                }
            } 
            else 
            {
                if (flagescape == true)
                {
                    flagescape = false;
                    masktext += text.substring(i,i+1);
                    maskvld += text.substring(i,i+1);
                    this._LogicTextMask += this._LogicEscape;
                }
                else
                {
                    this._QtdValidInput ++;
                    masktext += this._PromptChar;
                    maskvld += text.substring(i,i+1);
                    this._LogicTextMask += this._LogicPrompt;
                }
            }
            i++;
        }
        // Set First and last logic position
        this._LogicFirstPos = -1;
        this._LogicLastPos = -1;
        this._LogicLastInt = -1;
        this._LogicMask = this._LogicTextMask;
        for (i = 0 ; i < parseInt(this._LogicMask.length,10) ; i++) 
        {
            if (this._LogicFirstPos == -1 && this._LogicMask.substring(i,i+1) == this._LogicPrompt)
            {
                this._LogicFirstPos = i;
            }
            if (this._LogicMask.substring(i,i+1) == this._LogicPrompt)
            {
                this._LogicLastPos = i;
            }
            if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._InputDirection == AjaxControlToolkit.MaskedEditInputDirections.RightToLeft)
            {
                if (this._LogicMask.substring(i,i+1) == this.get_CultureDecimalPlaceholder())
                {
                    this._LogicLastInt = i;
                }
            }
        }
        this._maskvalid = maskvld.substring(this._LogicFirstPos,this._LogicLastPos+1);
        this._EmptyMask = masktext;
    }
    //
    // return text without mask but with placeholders 
    //
    , _getClearMask : function(masktext)
    {
        var i = 0;
        var clearmask = "";
        var qtdok = 0;
        var includedec = false;
        while (i < parseInt(this._LogicTextMask.length,10)) 
        {
            if (qtdok < this._QtdValidInput)
            {
                if (this._isValidMaskedEditPosition(i) && this._LogicTextMask.substring(i, i+1) != this._LogicPrompt)
                {
                    if (clearmask == "" && includedec)
                    {
                        clearmask += "0" + this.get_CultureDecimalPlaceholder();
                        includedec = false;
                    }
                    clearmask += this._LogicTextMask.substring(i,i+1);
                    qtdok++;
                }
                else if (this._LogicTextMask.substring(i, i+1) != this._LogicPrompt && this._LogicTextMask.substring(i, i+1) != this._LogicEscape)
                {
                    if (this._LogicTextMask.substring(i,i+1) == this.get_CultureDatePlaceholder() && (this._MaskType == AjaxControlToolkit.MaskedEditType.Date || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime))
                    {
                        clearmask += (clearmask == "")?"":this.get_CultureDatePlaceholder();
                    }
                    else if (this._LogicTextMask.substring(i,i+1) == this.get_CultureTimePlaceholder() && (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime))
                    {
                        clearmask += (clearmask == "")?"":this.get_CultureTimePlaceholder();
                    }
                    else if (this._LogicTextMask.substring(i,i+1) == " " && this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
                    {
                        clearmask += (clearmask == "")?"":" ";
                    }
                    else if (this._LogicTextMask.substring(i,i+1) == this.get_CultureThousandsPlaceholder() && this._MaskType == AjaxControlToolkit.MaskedEditType.Number)
                    {
                        clearmask += (clearmask == "")?"":this.get_CultureThousandsPlaceholder();
                    }
                    else if (this._LogicTextMask.substring(i,i+1) == this.get_CultureDecimalPlaceholder() && this._MaskType == AjaxControlToolkit.MaskedEditType.Number)
                    {
                        clearmask += (clearmask == "")?"":this.get_CultureDecimalPlaceholder();
                        if (clearmask == "")
                        {
                            includedec = true;
                        }
                    }
                }
            }
            i++;
        }
        if (this._LogicSymbol != "" && clearmask != "")
        {
            if (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime)
            {
                clearmask += " " + this._LogicSymbol;
            }
            else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number)
            {
                clearmask = this._LogicSymbol + clearmask;
            }
        }
        return clearmask;    
    }
    //
    // Convert notation {Number} in PAD's Number
    //
    , _convertMask : function() 
    {
        this._MaskConv = "";
        var qtdmask = "";
        var maskchar = "";
        for (i = 0 ; i < parseInt(this._Mask.length,10) ; i++) 
        {
          if (this._CharsEditMask.indexOf(this._Mask.substring(i, i+1)) != -1)
          {
            if (qtdmask.length == 0)
            {
                this._MaskConv += this._Mask.substring(i, i+1);
                qtdmask = "";
                maskchar = this._Mask.substring(i, i+1);
            }
            else if (this._Mask.substring(i, i+1) == "9")
            {
                qtdmask += "9";
            }
            else if (this._Mask.substring(i, i+1) == "0")
            {
                qtdmask += "0";
            }
          }
          else if (this._CharsEditMask.indexOf(this._Mask.substring(i, i+1)) == -1 && this._Mask.substring(i, i+1) != this._DelimitStartDup && this._Mask.substring(i, i+1) != this._DelimitEndDup)
          {
            if (qtdmask.length == 0)
            {
                this._MaskConv += this._Mask.substring(i, i+1);
                qtdmask = "";
                maskchar = "";
            }
            else
            {
               if (this._charNumbers.indexOf(this._Mask.substring(i, i+1)) != -1)
               {
                qtdmask += this._Mask.substring(i, i+1);
               }
            }            
          }
          else if (this._Mask.substring(i, i+1) == this._DelimitStartDup && qtdmask == "")
          {
            qtdmask = "0";
          }
          else if (this._Mask.substring(i, i+1) == this._DelimitEndDup && qtdmask != "")
          {
            qtddup = parseInt(qtdmask,10) -1;
            if (qtddup > 0)
            {
                for (q = 0 ; q < qtddup ; q++) 
                {
                    this._MaskConv += maskchar;
                }
            }
            qtdmask = "";
            maskchar = "";
          }
        }
        // set first and last position in mask for Symbols
        var FirstPos = -1;
        var LastPos = -1;
        var flagescape = false;
        for (i = 0 ; i < parseInt(this._MaskConv.length,10) ; i++) 
        {
            if (this._MaskConv.substring(i, i+1) == this._charEscape && !flagescape) 
            {
                flagescape = true;
            }
            else if (this._CharsEditMask.indexOf(this._MaskConv.substring(i, i+1)) != -1 && !flagescape) 
            {
                if (FirstPos == -1)
                {
                    FirstPos = i;
                }
                LastPos = i;
            } 
            else if(flagescape) 
            {
                flagescape = false;
            } 
        }
        // set spaces for Symbols AM/PM
        if ( (this._MaskType == AjaxControlToolkit.MaskedEditType.Time || this._MaskType == AjaxControlToolkit.MaskedEditType.DateTime) && this._AcceptAmPm)
        {
            var ASymMask = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator);
            var SymMask = "";
            if (ASymMask.length == 2)
            {
                SymMask = this._charEscape + " ";
                for (i = 0 ; i < parseInt(ASymMask[0].length,10) ; i++) 
                {
                    SymMask += this._charEscape + " ";
                }
            }
            this._MaskConv = this._MaskConv.substring(0,LastPos+1) + SymMask + this._MaskConv.substring(LastPos+1);
        }
        // set spaces for Symbols Currency
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number &&  this._DisplayMoney == AjaxControlToolkit.MaskedEditShowSymbol.Left)
        {
            var SymMask = "";
            for (i = 0 ; i < parseInt(this.get_CultureCurrencySymbolPlaceholder().length,10) ; i++) 
            {
                if (this._CharsEditMask.indexOf(this.get_CultureCurrencySymbolPlaceholder().substring(i, i+1)) == -1)
                {
                    SymMask += this.get_CultureCurrencySymbolPlaceholder().substring(i, i+1);
                }
                else
                {
                    SymMask += this._charEscape + this.get_CultureCurrencySymbolPlaceholder().substring(i, i+1);
                }
            }
            SymMask += this._charEscape + " ";
            this._MaskConv = this._MaskConv.substring(0,FirstPos) + SymMask + this._MaskConv.substring(FirstPos);
            FirstPos += SymMask.length;
            LastPos += SymMask.length;
        }
        // set spaces for Symbols negative
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._DisplayMoney == AjaxControlToolkit.MaskedEditShowSymbol.Right)
        {
            var SymMask = this._charEscape + " ";
            for (i = 0 ; i < parseInt(this.get_CultureCurrencySymbolPlaceholder().length,10) ; i++) 
            {
                if (this._CharsEditMask.indexOf(this.get_CultureCurrencySymbolPlaceholder().substring(i, i+1)) == -1)
                {
                    SymMask += this.get_CultureCurrencySymbolPlaceholder().substring(i, i+1);
                }
                else
                {
                    SymMask += this._charEscape + this.get_CultureCurrencySymbolPlaceholder().substring(i, i+1);
                }
            }
            this._MaskConv = this._MaskConv.substring(0,LastPos+1) + SymMask  + this._MaskConv.substring(LastPos+1);
        }
        if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative == AjaxControlToolkit.MaskedEditShowSymbol.Right)
        {
            this._MaskConv = this._MaskConv.substring(0,LastPos+1) + this._charEscape + " " + this._MaskConv.substring(LastPos+1);
        }
        else if (this._MaskType == AjaxControlToolkit.MaskedEditType.Number && this._AcceptNegative == AjaxControlToolkit.MaskedEditShowSymbol.Left)
        {
            this._MaskConv = this._MaskConv.substring(0,FirstPos) + this._charEscape + " " + this._MaskConv.substring(FirstPos);
        }
        this._convertMaskNotEscape();
    }
    //
    // Convert mask with escape to mask not escape
    // length is equal to real position 
    //
    , _convertMaskNotEscape : function()
    {
        this._LogicMaskConv = "";
        var atumask = this._MaskConv;
        var flagescape = false;
        for (i = 0 ; i < parseInt(atumask.length,10); i++) 
        {
            if (atumask.substring(i, i+1) == this._charEscape)
            {
                flagescape = true;
            }
            else if (!flagescape)
            {
                this._LogicMaskConv += atumask.substring(i, i+1);    
            }
            else
            {
                this._LogicMaskConv += this._LogicEscape;
                flagescape = false;
            }
        }
    }
    //
    // Helper properties
    //
    , get_Mask : function() {
        if (this._MaskConv == "" && this._Mask != "")
        {
            this._convertMask();
        } 
        return this._MaskConv;
    }
    , set_Mask : function(value) 
    {
        this._Mask = value;
        this.raisePropertyChanged('Mask');
    }
    , get_Filtered : function() 
    {
        return this._Filtered;
    }
    , set_Filtered : function(value) 
    {
        this._Filtered = value;
        this.raisePropertyChanged('Filtered');
    }    
    , get_InputDirection : function() 
    {
        return this._InputDirection;
    }      
    , set_InputDirection : function(value) 
    {
        this._InputDirection = value;
        this.raisePropertyChanged('InputDirection');
    }
    , get_PromptCharacter : function() 
    {
        return this._PromptChar;
    }      
    , set_PromptCharacter : function(value) 
    {
        this._PromptChar = value;
        this.raisePropertyChanged('PromptChar');
    }
    , get_OnFocusCssClass : function() 
    {
        return this._OnFocusCssClass;
    }      
    , set_OnFocusCssClass : function(value) 
    {
        this._OnFocusCssClass = value;
        this.raisePropertyChanged('OnFocusCssClass');
    }
    , get_OnInvalidCssClass : function() 
    {
        return this._OnInvalidCssClass;
    }      
    , set_OnInvalidCssClass : function(value) 
    {
        this._OnInvalidCssClass = value;
        this.raisePropertyChanged('OnInvalidCssClass');
    }
    , get_CultureName : function() 
    {
        return this._CultureName;
    }      
    , set_CultureName : function(value) 
    {
        this._CultureName = value;
        this.raisePropertyChanged('Culture');
    }
    , get_CultureDatePlaceholder : function() 
    {
        return this._CultureDatePlaceholder;
    }      
    , set_CultureDatePlaceholder : function(value) 
    {
        this._CultureDatePlaceholder = value;
        this.raisePropertyChanged('CultureDatePlaceholder');
    }      
    , get_CultureTimePlaceholder : function() 
    {
        return this._CultureTimePlaceholder;
    }      
    , set_CultureTimePlaceholder : function(value) 
    {
        this._CultureTimePlaceholder = value;
        this.raisePropertyChanged('CultureTimePlaceholder');
    }      
    , get_CultureDecimalPlaceholder : function() 
    {
        return this._CultureDecimalPlaceholder;
    }      
    , set_CultureDecimalPlaceholder : function(value) 
    {
        this._CultureDecimalPlaceholder = value;
        this.raisePropertyChanged('CultureDecimalPlaceholder');
    }      
    , get_CultureThousandsPlaceholder : function() 
    {
        return this._CultureThousandsPlaceholder;
    }      
    , set_CultureThousandsPlaceholder : function(value) 
    {
        this._CultureThousandsPlaceholder = value;
        this.raisePropertyChanged('CultureThousandsPlaceholder');
    }      
    , get_CultureDateFormat : function() 
    {
        var ret = this._CultureDateFormat;
        switch (this.get_UserDateFormat()) 
        {
            case AjaxControlToolkit.MaskedEditUserDateFormat.DayMonthYear:
            {
              ret = "DMY";
              break;
            }
            case AjaxControlToolkit.MaskedEditUserDateFormat.DayYearMonth:
            {
              ret = "DYM";
              break;
            }
            case AjaxControlToolkit.MaskedEditUserDateFormat.MonthDayYear:
            {
              ret = "MDY";
              break;
            }
            case AjaxControlToolkit.MaskedEditUserDateFormat.MonthYearDay:
            {
              ret = "MYD";
              break;
            }
            case AjaxControlToolkit.MaskedEditUserDateFormat.YearDayMonth:
            {
              ret = "YDM";
              break;
            }
            case AjaxControlToolkit.MaskedEditUserDateFormat.YearMonthDay:
            {
              ret = "YMD";
              break;
            }
        }
        return ret;
    }      
    , set_CultureDateFormat : function(value) 
    {
        this._CultureDateFormat = value;
        this.raisePropertyChanged('CultureDateFormat');
    }      
    , get_CultureCurrencySymbolPlaceholder : function() 
    {
        return this._CultureCurrencySymbolPlaceholder;
    }      
    , set_CultureCurrencySymbolPlaceholder : function(value) 
    {
        this._CultureCurrencySymbolPlaceholder= value;
        this.raisePropertyChanged('CultureCurrencySymbolPlaceholder');
    }   
    , get_CultureAMPMPlaceholder : function() 
    {
        var value = this._CultureAMPMPlaceholder;
        if (value.split(this._AMPMPlaceholderSeparator).length != 2 || value == this._AMPMPlaceholderSeparator) 
        {
            value = "";
        }
        if (this.get_UserTimeFormat() == AjaxControlToolkit.MaskedEditUserTimeFormat.TwentyFourHour)
        {
            value = "";
        }
        return value;
    }      
    , set_CultureAMPMPlaceholder : function(value) 
    {
        this._CultureAMPMPlaceholder = value;
        this.raisePropertyChanged('CultureAMPMPlaceholder');
    } 
    , get_CultureFirstLettersAMPM : function()  
    {
        if (this.get_CultureAMPMPlaceholder() != "")
        {
            var ASymMask = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator);
            return (ASymMask[0].substring(0,1) + ASymMask[1].substring(0,1));
        }
        return "";
    }
    , get_CultureFirstLetterAM : function() 
    {
        if (this.get_CultureAMPMPlaceholder() != "")
        {
            var ASymMask = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator);
            return ASymMask[0].substring(0,1);
        }
        return "";
    }   
    , get_CultureFirstLetterPM : function() 
    {
        if (this.get_CultureAMPMPlaceholder() != "")
        {
            var ASymMask = this.get_CultureAMPMPlaceholder().split(this._AMPMPlaceholderSeparator);
            return ASymMask[1].substring(0,1);
        }
        return "";
    }   
    , get_ClearMaskOnLostFocus : function() 
    {
        return this._ClearMaskOnLostfocus;
    }      
    , set_ClearMaskOnLostFocus : function(value) 
    {
        this._ClearMaskOnLostfocus = value;
        this.raisePropertyChanged('ClearMaskOnLostfocus');
    }      
    , get_MessageValidatorTip : function() 
    {
        return this._MessageValidatorTip;
    }      
    , set_MessageValidatorTip : function(value) 
    {
        this._MessageValidatorTip = value;
        this.raisePropertyChanged('MessageValidatorTip');
    }      
    , get_AcceptAMPM : function() 
    {
        return this._AcceptAmPm;
    }      
    , set_AcceptAMPM : function(value) 
    {
        this._AcceptAmPm = value;
        this.raisePropertyChanged('AcceptAmPm');
    }   
    , get_AcceptNegative : function() 
    {
        return this._AcceptNegative;
    }      
    , set_AcceptNegative : function(value) 
    {
        this._AcceptNegative= value;
        this.raisePropertyChanged('AcceptNegative');
    }   
    , get_DisplayMoney : function() 
    {
        return this._DisplayMoney;
    }      
    , set_DisplayMoney : function(value) 
    {
        this._DisplayMoney = value;
        this.raisePropertyChanged('DisplayMoney');
    }   
    , get_OnFocusCssNegative : function() 
    {
        return this._OnFocusCssNegative;
    }      
    , set_OnFocusCssNegative : function(value) 
    {
        this._OnFocusCssNegative= value;
        this.raisePropertyChanged('OnFocusCssNegative');
    }   
    , get_OnBlurCssNegative : function() 
    {
        return this._OnBlurCssNegative;
    }      
    , set_OnBlurCssNegative : function(value) 
    {
        this._OnBlurCssNegative= value;
        this.raisePropertyChanged('OnBlurCssNegative');
    }   
    , get_Century : function() 
    {
        return this._Century;
    }      
    , set_Century : function(value) 
    {
        this._Century= value;
        this.raisePropertyChanged('Century');
    }   
    , get_AutoComplete : function() 
    {
        return this._AutoComplete;
    }      
    , set_AutoComplete : function(value) 
    {
        this._AutoComplete = value;
        this.raisePropertyChanged('AutoComplete');
    }   
    , get_AutoCompleteValue : function() 
    {
        return this._AutoCompleteValue;
    }      
    , set_AutoCompleteValue : function(value) 
    {
        this._AutoCompleteValue = value;
        this.raisePropertyChanged('AutoCompleteValue');
    }   
    , get_MaskType : function() 
    {
        return this._MaskType;
    }      
    , set_MaskType : function(value) 
    {
        this._MaskType = value;
        this.raisePropertyChanged('MaskType');
    }   
    
    , get_ClearTextOnInvalid : function()
    {
        return this._ClearTextOnInvalid;
    }
    , set_ClearTextOnInvalid : function(value)
    {
        if(this._ClearTextOnInvalid !== value)
        {
            this._ClearTextOnInvalid = value;
            this.raisePropertyChanged('ClearTextOnInvalid');
        }
    }
    , get_ClipboardText : function() 
    {
        return this._ClipboardText;
    }      
    , set_ClipboardText : function(value) 
    {
        this._ClipboardText = value;
        this.raisePropertyChanged('ClipboardText');  
    }   
    , get_ClipboardEnabled : function()
    {
        return this._AllowCopyPaste;
    }
    , set_ClipboardEnabled : function(value)
    {
        this._AllowCopyPaste = value;
        this.raisePropertyChanged('ClipboardEnabled');
    }
    , get_ErrorTooltipEnabled : function()
    {
        return this._ShowMessageErrorFloat;
    }
    , set_ErrorTooltipEnabled : function(value)
    {
        this._ShowMessageErrorFloat = value;
        this.raisePropertyChanged('ErrorTooltipEnabled');
    }
    , get_ErrorTooltipCssClass : function()
    {
        return this._CssMessageErrorFloat;
    }
    , set_ErrorTooltipCssClass : function(value)
    {
        this._CssMessageErrorFloat = value;
        this.raisePropertyChanged('ErrorTooltipCssClass');
    }
    , get_UserDateFormat : function() 
    {
        return this._UserDateFormat;
    }      
    , set_UserDateFormat : function(value) 
    {
        this._UserDateFormat = value;
        this.raisePropertyChanged('UserDateFormat');
    }
    , get_UserTimeFormat : function() 
    {
        return this._UserTimeFormat;
    }      
    , set_UserTimeFormat : function(value) 
    {
        this._UserTimeFormat = value;
        this.raisePropertyChanged('UserTimeFormat');
    }
}
AjaxControlToolkit.MaskedEditBehavior.registerClass('AjaxControlToolkit.MaskedEditBehavior', AjaxControlToolkit.DynamicPopulateBehaviorBase);

// **************************************************
// Register enumerations  
// **************************************************
AjaxControlToolkit.MaskedEditType = function() {
    throw Error.invalidOperation();
}

AjaxControlToolkit.MaskedEditInputDirections = function() {
    throw Error.invalidOperation();
}

AjaxControlToolkit.MaskedEditShowSymbol = function() {
    throw Error.invalidOperation();
}

AjaxControlToolkit.MaskedEditUserDateFormat = function() {
    throw Error.invalidOperation();
}

AjaxControlToolkit.MaskedEditUserTimeFormat = function() {
    throw Error.invalidOperation();
}

AjaxControlToolkit.MaskedEditType.prototype = {
    None: 0,
    Date: 1,
    Number: 2,
    Time: 3,
    DateTime: 4
}

AjaxControlToolkit.MaskedEditInputDirections.prototype = {
    LeftToRight: 0,
    RightToLeft: 1
}

AjaxControlToolkit.MaskedEditShowSymbol.prototype = {
    None: 0,
    Left: 1,
    Right: 2
}

AjaxControlToolkit.MaskedEditUserDateFormat.prototype = {
    None: 0,
    DayMonthYear: 1,
    DayYearMonth: 2,
    MonthDayYear: 3,
    MonthYearDay: 4,
    YearDayMonth: 5,
    YearMonthDay: 6
}

AjaxControlToolkit.MaskedEditUserTimeFormat.prototype = {
    None: 0,
    TwentyFourHour: 1
}

AjaxControlToolkit.MaskedEditType.registerEnum('AjaxControlToolkit.MaskedEditType');
AjaxControlToolkit.MaskedEditInputDirections.registerEnum('AjaxControlToolkit.MaskedEditInputDirections');
AjaxControlToolkit.MaskedEditShowSymbol.registerEnum('AjaxControlToolkit.MaskedEditShowSymbol');
AjaxControlToolkit.MaskedEditUserDateFormat.registerEnum('AjaxControlToolkit.MaskedEditUserDateFormat');
AjaxControlToolkit.MaskedEditUserTimeFormat.registerEnum('AjaxControlToolkit.MaskedEditUserTimeFormat');

//END AjaxControlToolkit.MaskedEdit.MaskedEditBehavior.js
if(typeof(Sys)!=='undefined')Sys.Application.notifyScriptLoaded();
(function() {var fn = function() {$get('ctl00_ToolkitScriptManager1_HiddenField').value += ';;AjaxControlToolkit, Version=1.0.11119.41102, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e:vi-VN:b6c6a29e-a678-4f82-8215-1947249c9eb0:e2e86ef9:1df13a87:ee0a475d:c4c00916:3858419b:9ea3f0e2:96741c43:c7c04611:cd120801:38ec41c0:fde3863c:a9a7729d:9e8e87e9:4c9865be:ba594826:507fcf1b:c7a4182e:182913ba:bae32fb7';Sys.Application.remove_load(fn);};Sys.Application.add_load(fn);})();
