/**
************************************************************************
MIT License

Copyright (c) 2023 Henrique Andrade


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

****************************************************************************
Acessible-JSCookMenu v1.0

Extension for the JSCookMenu library (http://jscook.yuanheng.org/JSCookMenu/) 
to make the generated menu accessible.Allows the menu to be keyboard usable 
and readable by assistive technologies.The changes were based on the disclosure
navigation standard described by APG/W3C 
(https://www.w3.org/WAI/ARIA/apg/example-index/disclosure/disclosure-navigation.html).

This basically consists of a script that gives the menu the functionality it needs to comply with WGAC Accessibility rules.

To use it, just import the script right after the JSCookMenu and jQuery scripts.

Depedencies:
  - JSCookMenu
  - jQuery
*/

if(!j$) j$=jQuery;

var _cmsrMenuList=document.createElement('ul');
var _flag_down=false;
var _cmsrDrawCurrentSubmenuList=_cmsrMenuList;
var _cmsrDrawNextSubmenuList=_cmsrMenuList

const _cmsr_sronly_css={
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    border: 0,
}

window.old_cmDraw=window.cmDraw;
window.cmDraw= function (id, menu, orient, nodeProperties, prefix) {
    let ret= window.old_cmDraw (id, menu, orient, nodeProperties, prefix);
    j$('#'+id)
        .attr('aria-hidden','true')
        .before('<div id="jscookmenu-screen-reader"></div>');
    j$('#jscookmenu-screen-reader')
        .css(_cmsr_sronly_css)
        .append(_cmsrMenuList);
    return ret;
}

window.old_cmDrawSubMenu=window.cmDrawSubMenu;
window.cmDrawSubMenu=function(subMenu, prefix, id, orient, nodeProperties){
    let oldSubmenuList=_cmsrDrawCurrentSubmenuList;
    _cmsrDrawCurrentSubmenuList=_cmsrDrawNextSubmenuList;
    let ret = window.old_cmDrawSubMenu(subMenu, prefix, id, orient, nodeProperties);
    _cmsrDrawCurrentSubmenuList=oldSubmenuList;
    return ret;
}

window.old_cmActionItem=window.cmActionItem;
window.cmActionItem=function(item, prefix, isMain, idSub, orient, nodeProperties){
    let ret = window.old_cmActionItem(item, prefix, isMain, idSub, orient, nodeProperties);
    if(item!=_cmSplit){
        let index = _cmItemList.length - 1;
        
        ret +=' id="cmAction-'+index+'"';

        let li=document.createElement('li');
        _cmsrDrawCurrentSubmenuList.appendChild(li);
        if(idSub){
            let btn=document.createElement('button');
            let ul=document.createElement('ul');
            li.appendChild(btn);
            li.appendChild(ul);
            
            btn.setAttribute('id','cmsrSubmenuAction-'+index);
            btn.setAttribute('type','button');
            btn.setAttribute('onfocus','cmsrFocusButton('+index+')');
            btn.setAttribute('onblur','cmsrBlurButton('+index+')');
            btn.setAttribute('onclick','cmsrClickButton('+index+')');
            btn.setAttribute('aria-haspopup','menu');
            btn.setAttribute('aria-expanded','false');
            btn.setAttribute('aria-controls','cmsrSubmenuList-'+index);
            btn.innerHTML=item[1];
            btn.cmsrIdSubmenu=idSub;
            btn.cmsrIndex=index;

            ul.setAttribute('id','cmsrSubmenuList-'+index)
            ul.setAttribute('hidden','true');
            ul.setAttribute('aria-labelledby','cmsrSubmenuAction-'+index);
            _cmsrDrawNextSubmenuList=ul;
        }else{
            let link=document.createElement('a');
            li.appendChild(link);
            link.setAttribute('href','javascript:void(0)');
            link.setAttribute('onfocus','cmsrFocusLink('+index+')');
            link.setAttribute('onblur','cmsrBlurLink('+index+')');
            link.setAttribute('onclick','cmsrClickLink('+index+')');
            link.innerHTML=item[1];
        }
    }
    return ret;
}

window.old_cmItemMouseOver=window.cmItemMouseOver;
window.cmItemMouseOver=function(obj, prefix, isMain, idSub, orient, index){
    old_cmItemMouseOver (obj, prefix, isMain, idSub, orient, index);
}

window.old_cmItemMouseOut=window.cmItemMouseOut;
window.cmItemMouseOut=function(obj, delayTime){
    old_cmItemMouseOut (obj, delayTime);
}

window.old_cmHideMenuTime=cmHideMenuTime;
window.cmHideMenuTime=function(){
    window.old_cmHideMenuTime()
}

//Virtual menu event handlers

function cmsrClickButton(target_index){
    let cmaction=j$('#cmAction-'+target_index);
    let submenubutton=j$('#cmsrSubmenuAction-'+target_index);
    let submenulist=j$('#cmsrSubmenuList-'+target_index);
    let expanded=submenubutton.attr('aria-expanded')=='true'?true:false;
    if(!expanded){
        //Recolhe submenu do mesmo parent, só pode estar expandido apenas um submenu por parent
        submenubutton.parent().parent().children().children('button[aria-expanded="true"]').trigger('click');

        //Expande o menu virtual em questão
        submenubutton.attr('aria-expanded','true');
        submenulist.removeAttr('hidden');
        
        //Expande o menu visual em questão
        cmaction.trigger('mouseover');
    }
    else{
        //Recolhe todos os submenus filhos do menu em questão
        submenulist.children().children('button[aria-expanded="true"]').trigger('click');

        //Recolhe o menu virtual em questão
        submenubutton.attr('aria-expanded','false');
        submenulist.attr('hidden','true');

        //Recolhe o menu visual em questão
        let cmIdSubMenu=j$('#'+submenubutton[0].cmsrIdSubmenu);
        cmIdSubMenu.css("visibility", "hidden");
    }
}

function cmsrFocusButton(target_index){
    j$(_cmsrMenuList).find('button[aria-expanded="true"]').each(function(){
        j$('#'+this.cmsrIdSubmenu).css("visibility", "visible");
    })
    let cmaction=j$('#cmAction-'+target_index);
    let className = cmaction.attr('class');
    className=className.replace('Hover','');
    className+='Hover';
    cmaction.attr('class',className);
}

function cmsrBlurButton(target_index){
    let cmaction=j$('#cmAction-'+target_index);
    let className = cmaction.attr('class');
    className=className.replace('Hover','');
    cmaction.attr('class',className);
}

function cmsrClickLink(target_index){
    let cmaction=j$('#cmAction-'+target_index);
    cmaction.trigger('mouseup');
}

function cmsrFocusLink(target_index){
    cmsrFocusButton(target_index);
}

function cmsrBlurLink(target_index){
    cmsrBlurButton(target_index);
}


