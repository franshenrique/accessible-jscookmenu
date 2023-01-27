# Accessible-JSCookMenu
Extension for the JSCookMenu library (http://jscook.yuanheng.org/JSCookMenu/) to make the generated menu accessible. Allows the menu to be keyboard usable and readable by assistive technologies. The changes were based on the 'disclosure navigation pattern' described by APG/W3C (https://www.w3.org/WAI/ARIA/apg/example-index/disclosure/disclosure-navigation.html).

This basically consists of a script that gives the menu the functionality it needs to comply with WGAC Accessibility rules.

To use it, just import the script right after the JSCookMenu and jQuery scripts.

Depedencies:
  - JSCookMenu
  - jQuery