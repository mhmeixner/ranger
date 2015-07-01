// JavaScript source code
var useAddressValidator;

if (typeof jQuery == 'undefined') {
    document.write("<script type=\"text/javascript\" src=\"assets/templates/common/js/jquery.min.js\"></" + "script>");
}

jQuery.getScript('assets/templates/common/js/simplemodal.js');

function get_Element(i) {
    return document.getElementById(i) || document.getElementsByName(i).item(0);
}

function getElementById_s(id) {
    var obj = null;
    if (document.getElementById) {
        /* Prefer the widely supported W3C DOM method, if 
		available:- 
		*/
        obj = get_Element(id);
    } else if (document.all) {
        /* Branch to use document.all on document.all only 
		browsers. Requires that IDs are unique to the page 
		and do not coincide with NAME attributes on other 
		elements:- 
		*/
        obj = document.all[id];
    }
    /* If no appropriate element retrieval mechanism exists on 
	this browser this function always returns null:- 
	*/
    return obj;
}

function closeAddressValidatorModal() {
    parent.jQuery.modal.close();
}

function verify_address(address1, address2, city, state, country, zip, company, strTemplate) {
    if (useAddressValidator == "1") {
        get_Element('hdnAddrressValidatorResult').value = '';
        var url = 'addressvalidator.asp?no-cache=' + Math.random();
        var params = 'doaction=verify&ct=' + strTemplate;
        params += '&company=' + encodeURIComponent(company);
        params += '&address=' + encodeURIComponent(address1);
        params += '&address2=' + encodeURIComponent(address2);
        params += '&city=' + encodeURIComponent(city);
        params += '&state=' + encodeURIComponent(state);
        params += '&zip=' + encodeURIComponent(zip);
        
        if (address1 != '') {
            lastShippingAddress = params;
            jQuery.ajax({
                url: url,
                dataType: 'html',
                type: 'POST',
                data: params,
                cache: false,
                success: function (strResult) {
                    jQuery("#divAddrressValidator").html(strResult);
                },
                error: reportError
            });
            
            return false;
        }
    }
}

function selectAddress(AddrressValidator_address1, AddrressValidator_address2, AddrressValidator_city, AddrressValidator_state, AddrressValidator_zip, address1, address2, city, state, zip) {
    jQuery.modal.close();
    get_Element(address1).value = AddrressValidator_address1;
    get_Element(address2).value = AddrressValidator_address2;
    get_Element(city).value = AddrressValidator_city;
    get_Element(zip).value = AddrressValidator_zip;
    get_Element(state).value = AddrressValidator_state;
}

function reportError(jqXHR, textStatus) {
    ajax_request_progress = 0;
    if (jqXHR.status > 0) {
        alert("Error processing request " + jqXHR.status + " - " + jqXHR);
        //alert(jqXHR.responseText);
    }
}