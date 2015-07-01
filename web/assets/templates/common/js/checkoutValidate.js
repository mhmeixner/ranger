// JavaScript source code
var scity = "";
var szip = "";
var scountry = "";
var sstate = "";
var saddress = "";
var bcity = "";
var bzip = "";
var bcountry = "";
var bstate = "";
var baddress = "";
var addrchange = "";
var ajax_request_progress = 0;
var selectedShipId = 0;
var useAddressValidator;
var validShippingAddress = 0;
var lastShippingAddress = "";
var strOriginalDivPaymentContent = "";
var bolPageLoaded = false;
var ccNumerNotAllowedMessage;
var changedaddress = false; //flag to determine to refresh rates or not.

if (typeof jQuery == 'undefined') {
	document.write("<script type=\"text/javascript\" src=\"assets/templates/common/js/jquery.min.js\"></" + "script>");
}

jQuery.getScript('assets/templates/common/js/simplemodal.js');

jQuery.fn.pVal = function () {
    var $this = jQuery(this),
        val = $this.eq(0).val();
    if (val == $this.attr('placeholder'))
        return '';
    else
        return val;
}

//FuturePay
////////////////////////////////////////////////////////////////////////////////////
function FuturePayResponseHandler(response) {
    if (response.error) {
        //  Display some message informing your customer that the purchase was not completed
        error_code = response.code;
        error_reason = response.message;
        alert(response.message); //FuturepayMessage
    } else {
        //  If the response is a Success Pass the returned TransactionID to the Merchant-Order-verification API from the server
        transaction_id = response.transaction_id;
        fp_params = "fptransaction_id|||" + transaction_id;
        doCheckout(document.billing, fp_params);
    }
}
////////////////////////////////////////////////////////////////////////////////////
function get_Element(i) {
    return document.getElementById(i) || document.getElementsByName(i).item(0);
}

function addressValidatorContinue(type) {
    jQuery.modal.close();
    remove_overlay("billing_info");
    if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
        var sameAsBilling = get_Element('sameAsBilling').checked;
    }
    else {
        var sameAsBilling = true;
    }
    if (!sameAsBilling)
        remove_overlay("shipping_info");
    validShippingAddress = 1;
    check_address(type);
}

function check_address2_pos(type) {
    if (jQuery("#hdnAddrressValidatorResult").val() == "1") {
        jQuery.modal.close();
        validShippingAddress = 1;
        check_address(type);
    }
    else {
        validShippingAddress = 0;
        jQuery("#divAddrressValidator").modal({ containerCss: { borderWidth: '1px', width: '602px', height: '212px' } });
    }
}

function closeAddressValidatorModal() {
    parent.jQuery.modal.close();
    if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
        var sameAsBilling = get_Element('sameAsBilling').checked;
    }
    else {
        var sameAsBilling = true;
    }
    if (!sameAsBilling)
        remove_overlay("shipping_info");
}

function select_shipping(shipid) {
    selectedShipId = shipid;
    add_overlay("total_div", 1);
    if (shipid != '-1')
        add_overlay("divPayment", 1);

    var url = 'ship_ajax.asp?action1=total&no-cache=' + Math.random() + '&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');
    var params = 'id=' + shipid + '&action=total';
    //if (jQuery('#insurance').length > 0)
        //params = params + '&insurance=' + jQuery('input[name=insurance]:checked', '#billing').val();

    if (jQuery('input[name=insurance]:checked', '#billing').val() != 'undefined' && jQuery('input[name=insurance]:checked', '#billing').val() != 'null')
        params = params + '&insurance=' + jQuery('input[name=insurance]:checked', '#billing').val();


    jQuery.ajax({
        url: url,
        dataType: 'html',
        type: 'POST',
        data: params,
        cache: false,
        success: function (strResult) {
        	jQuery("#total_div").html(strResult);
        	flagPageLoaded();
        },
        complete: updateajax_total,
        error: reportError
    });
}

function applyCoupon(strCoupon) {
    var strMsg = "";

    if (jQuery.trim(strCoupon) == "")
        strMsg += " - Coupon cannot be blank.\n";

    if (strMsg != "") {
        alert(strMsg);
        return false;
    }

    add_overlay("total_div", 1);
    var url = 'ship_ajax.asp?action1=total&no-cache=' + Math.random();
    var params = 'id=' + selectedShipId + '&action=total&coupon=' + encodeURIComponent(strCoupon) + '&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');

    jQuery.ajax({
        url: url,
        dataType: 'html',
        type: 'POST',
        data: params,
        cache: false,
        success: function (strResult) {
            jQuery("#total_div").html(strResult);
        },
        complete: updateajax_total,
        error: reportError
    });
}

function doPayment() {
    var params='action=dopayment&k='+(jQuery('#k').length>0?jQuery('#k').val():'')+'&wid='+(jQuery('#wid').length>0?jQuery('#wid').val():'')+'&billing_state='+jQuery('#billing_state').val()+'&billing_country='+jQuery('#billing_country').val();

    add_overlay("divPayment", 1);
    var url = 'checkout_one.asp';

    jQuery.ajax({
        url: url,
        dataType: 'html',
        type: 'POST',
        data: params,
        cache: false,
        success: function (strResult) {
            if (strResult == "redirect_login") { location.href = 'myaccount.asp?returnUrl=checkout_one%2Easp'; return; }

            var radioCollectionOriginal = jQuery("input:radio", jQuery.parseHTML(strOriginalDivPaymentContent));
            var radioCollectionNew = jQuery("input:radio", jQuery.parseHTML(strResult));

            var bolSameContent = true;
            if (radioCollectionOriginal.length == radioCollectionNew.length) {
                for (var i = 0; i < radioCollectionOriginal.length; i++) {
                    if (radioCollectionOriginal[i].value.toLowerCase() != radioCollectionNew[i].value.toLowerCase()) {
                        bolSameContent = false;
                        break;
                    }
                }
            }
            else {
                bolSameContent = false;
            }

            if (!bolSameContent) {
                jQuery("#divPayment").html(strResult);
                strOriginalDivPaymentContent = strResult;
                if (strOriginalDivPaymentContent.indexOf("onVmeReady") > 0)
                	strOriginalDivPaymentContent = "";
            }

        },
        complete: paymentSuccess,
        error: reportError
    });
    remove_overlay("divPayment");
}

function paymentSuccess() {
    controlDivPayment('');
    remove_overlay("divPayment");
}

function checkoutQuestionsSuccess() {
    remove_overlay("divCheckoutQuestions");
}

function doCart() {
    var params = 'action=docart&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');

    add_overlay("divCart", 1);
    var url = 'checkout_one.asp';

    jQuery.ajax({
        url: url,
        dataType: 'html',
        type: 'POST',
        data: params,
        cache: false,
        success: function (strResult) {
            if (strResult == "redirect_login") { location.href = 'myaccount.asp?returnUrl=checkout_one%2Easp'; return; }
            jQuery("#divCart").html(strResult);
        },
        complete: cartSuccess,
        error: reportError
    });
}

function cartSuccess() {
    remove_overlay("divCart");
}

function selectAddress(AddrressValidator_address1, AddrressValidator_address2, AddrressValidator_city, AddrressValidator_state, AddrressValidator_zip, AddrressValidator_type, AddressValidator_RDI) {
    jQuery.modal.close();
    getElementById_s(AddrressValidator_type + "_address").value = AddrressValidator_address1;
    getElementById_s(AddrressValidator_type + "_address2").value = AddrressValidator_address2;
    getElementById_s(AddrressValidator_type + "_city").value = AddrressValidator_city;
    getElementById_s(AddrressValidator_type + "_zip").value = AddrressValidator_zip;
    getElementById_s(AddrressValidator_type + "_state").value = AddrressValidator_state;
    remove_overlay("billing_info");
    if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
        var sameAsBilling = get_Element('sameAsBilling').checked;
    }
    else {
        var sameAsBilling = true;
    }
    if (!sameAsBilling)
        remove_overlay("shipping_info");
    //AddressValidator_RDI
    if (getElementById_s("shipping_addresstype") && AddressValidator_RDI != "") {
        if (AddressValidator_RDI == "R")
            getElementById_s("shipping_addresstype").value = "1";
        else
            getElementById_s("shipping_addresstype").value = "2";
    }
    check_address(AddrressValidator_type);
}






function doCheckout(objForm, extraParams) {
	setValidation();
        
	//FuturePay
	////////////////////////////////////////////////////////////////////////////////////
	extraParamsQueryString = '';

	try {
		if (jQuery("#hdnFuturePayID").length > 0 && jQuery("#hdnFuturePayID").val() == jQuery('input[name=payment]:checked', '#' + objForm.name).val()) {
			if (extraParams == 'checkoutButton') {
				FP.CartIntegration();
				FP.CartIntegration.placeOrder();
				return;
			}
			else {
				if (extraParams != null && extraParams != "undefined") {
					arrParams = extraParams.split("|||");
					if (arrParams[0] == 'fptransaction_id') {
						extraParamsQueryString = "&futurepay_callback=1&futurepay_transactionid=" + arrParams[1]
					}
				}
			}

		}
	}
	catch (e) { }
	////////////////////////////////////////////////////////////////////////////////////

	//WePay
	////////////////////////////////////////////////////////////////////////////////////
	try {
		if (jQuery("#hdnWePayID").length > 0 && jQuery("#hdnWePayID").val() == jQuery('input[name=payment]:checked', '#' + objForm.name).val()) {
			if (extraParams == 'checkoutButton') {
			    //WePay.set_endpoint("stage");      
			    WePay.set_endpoint("production");
				
				// Attach the event to the DOM
				var response = WePay.credit_card.create({
					"client_id": jQuery('#hdnWePayClientID').val(),
					"user_name": jQuery('#billing_firstname').val() + ' ' + jQuery('#billing_lastname').val(),
					"email": jQuery('#billing_email').val(),
					"cc_number": jQuery('#wepay_ocardno').val(),
					"cvv": jQuery('#wepay_ocardcvv2').val(),
					"expiration_month": jQuery('#wepay_ocardexpiresmonth').val(),
					"expiration_year": jQuery('#wepay_ocardexpiresyear').val(),
					"address": {
						"zip": jQuery('#billing_zip').val()
					}
				}, function (data) {
					if (data.error) {
						alert(jQuery('#hdnWePayGenericErrorMsg').val() + "\nWePay details: " + data.error_description);
						return false;;
					} else {
					    CardLastFour = jQuery('#wepay_ocardno').val();
					    CardLastFour = CardLastFour.trim();
					    CardLastFour = CardLastFour.substr(CardLastFour.length - 4);
					    hdnWePayRef = data.credit_card_id + '||||' + CardLastFour + '||||' + jQuery('#wepay_ocardexpiresmonth').val() + '||||' + jQuery('#wepay_ocardexpiresyear').val()
					    jQuery('#hdnWePayRef').val(hdnWePayRef);
						jQuery(".wepaydiv :input").attr("disabled", true);
						doCheckoutNormal(objForm);
						return;
					}
				});
				return;
			}
		}
	}
	catch (e) { }
	////////////////////////////////////////////////////////////////////////////////////

	doCheckoutNormal(objForm);
}

function doCheckoutNormal(objForm) {

	//isSubmitComplete = false; //Let this line commented in production... otherwise, it will allow multiple submits.

	if (!objForm.onsubmit() || !checkotherreqfields()) {
		checkoutSwitch(false);
		return false;
	}

	if (validShippingAddress == 0) {
		isSubmitComplete = false;
		check_address("refresh");
		checkoutSwitch(false);
		return;
	}

	var params = 'action=docheckout&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '') + extraParamsQueryString;
	var formArray = getValuesAsArray(objForm);
	//if there's wepay available, enable again the inputs.
	jQuery(".wepaydiv :input").attr("disabled", false);

	for (var prop in formArray) {
		if (prop.indexOf('Paymetric') < 0){
		var value = formArray[prop];
		value = encodeURIComponent(value);
		params = params + '&' + prop + '=' + value;
	}
	}

	//Elayaway
	////////////////////////////////////////////////////////////////////////////////////
	if (document.eci_form != null && document.eci_form != "undefined") {
		params = params + '&elayawayParams=';
		var formArrayElayaway = getValuesAsArray(document.eci_form);
		for (var prop in formArrayElayaway) {
			var value = formArrayElayaway[prop];
			value = encodeURIComponent(value);
			params = params + prop + '=' + value + '|';
		}
	}
	////////////////////////////////////////////////////////////////////////////////////


	get_Element('divCheckout').style.display = 'block';
	add_overlay("billing_div", 1);
	var url = 'checkout_one.asp';

	jQuery.ajax({
		url: url,
		dataType: 'html',
		type: 'POST',
		data: params,
		cache: false,
		success: function (strResult) {
			if (strResult == "redirect_login") { location.href = 'myaccount.asp?returnUrl=checkout_one%2Easp'; return; }
			//PayMetric
			////////////////////////////////////////////////////////////////////////////////////
			if (strResult == "run_paymetric") {
				isSubmitComplete = false;
				return xis2(objForm);
			}
			////////////////////////////////////////////////////////////////////////////////////
			jQuery("#divCheckout").html(strResult);
		},
		complete: checkoutSuccess,
		error: reportError
	});
}

function checkoutSuccess(objResponse) {
	remove_overlay("billing_div");

	if (objResponse.responseText == "run_paymetric")
		return;

	var divCheckout = getInnerText('divCheckout');

	if (divCheckout.indexOf('ORDER PLACED') >= 0 || divCheckout.indexOf('REDIRECTING') >= 0) {
		//var orderId = divCheckout.split("-");
		//window.location.href='ordertracking.asp?op=1&action=view&id='+orderId[1];
		//window.location.href='checkout_thankyou.asp?i=' + orderId[1] + '&t=' +orderId[2];
		return void (0);
	}

	isSubmitComplete = false;

	if (divCheckout.indexOf('INVALID_CART') >= 0) {
		doCart();
		check_address('InvalidCart');
		alert(divCheckout.replace('INVALID_CART', ''));
		return void (0);
	}

	if (divCheckout.indexOf('REDIRECT') >= 0) {
		return void (0);
	}

	if (divCheckout.indexOf('FUTUREPAY-FORM') >= 0) {
		return void (0);
	}

	if (jQuery("#hdnAffirmID").length > 0 && jQuery("#hdnAffirmID").val() == jQuery('input[name=payment]:checked', '#' + document.billing.name).val()) {
		return void (0);
	}

	alert(divCheckout.replace('<li>', '\n \- '));

}

	function checkoutFailure() {
		remove_overlay("billing_div");
	}

	function removeCoupon(couponId) {
		var rep = confirm("Are you sure you want to remove this coupon?");

		if (!rep)
			return void (0);

		add_overlay("total_div", 1);
		var url = 'ship_ajax.asp?action1=total&no-cache=' + Math.random();
		var params = 'id=' + selectedShipId + '&action=total&removeCoupon=1&coupon=' + encodeURIComponent(couponId) + '&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');

		jQuery.ajax({
			url: url,
			dataType: 'html',
			type: 'POST',
			data: params,
			cache: false,
			success: function (strResult) {
				jQuery("#total_div").html(strResult);
			},
			complete: updateajax_total,
			error: reportError
		});
	}

	function updateajax_total(req) {

		var couponApplied = getInnerText('total_div');

		if (couponApplied.indexOf('divCouponApplied') >= 0) {
			check_address('CouponApplied');
			doCart();
		}
		else {
			if (bolPageLoaded)
				doPayment();
			window.setTimeout('flagPageLoaded()', 1000);
		}

		remove_overlay("divPayment");
		remove_overlay("total_div");
	}

	function flagPageLoaded() {
		bolPageLoaded = true;
	}

	function getInnerText(div) {
		if (document.all) {
			return get_Element(div).innerText;
		} else {
			return get_Element(div).textContent;
		}
	}

	function initpage() {

		check_address('shipping');

		if (!document.billing.shipping_zip) {
			select_shipping(-1);
		}
		else {
			if (document.billing.shipping_zip.value == '')
				select_shipping(-1);
		}

		controlDivPayment('');
		fillEmailDiv();

		strOriginalDivPaymentContent = jQuery("#divPayment").html();
		if (strOriginalDivPaymentContent.indexOf("onVmeReady") > 0)
			strOriginalDivPaymentContent = "";
		var radioCollectionOriginal = jQuery("input:radio", jQuery.parseHTML(strOriginalDivPaymentContent));
		if (radioCollectionOriginal.length <= 0)
			doPayment();

		if (jQuery('#sameAsBilling').length > 0 && jQuery('#sameAsBilling').is(':checked')) {
			showHideShipping();
			check_address('');
		}

	}

	function check_address(type) {
		isSubmitComplete = false;

		if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
			var sameAsBilling = get_Element('sameAsBilling').checked;
		}
		else {
			var sameAsBilling = true;
			if (type == 'shipping')
				type = 'billing';
		}

		if (type == '')
			if (sameAsBilling)
				type = 'billing';
			else
				type = 'shipping';

		if((type=='billing'&&sameAsBilling)||(!sameAsBilling&&type=='shipping')||(type=='CouponApplied')||(type=='addresstype')||(type=='InvalidCart')||(type=='refresh'))
			check_address2(type);
		else if(type=='billing'&&jQuery('#billing_country').val()!=''&&jQuery('#billing_state').val()!=''&&(jQuery('#billing_zip').val()!=''||(jQuery('#billing_country').val()!='US'&&jQuery('#billing_country').val()!='CA')))
			doPayment();

	}

	function check_address2(type) {
		var overlayAdded = false;
		var type2 = type;
		if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null)
			var sameAsBilling = get_Element('sameAsBilling').checked;
		else
			var sameAsBilling = true;

		if (type2 == 'CouponApplied' || type2 == 'InvalidCart' || type2 == 'refresh' || type2 == 'addresstype')
			if (sameAsBilling)
				type = 'billing';
			else
				type = 'shipping';

		addrchange = 0;

		if (jQuery('#' + type + '_address').pVal() != saddress) { saddress = encodeURIComponent(removeHTMLTags(jQuery('#' + type + '_address').pVal())); addrchange = 1; }
		if (jQuery('#' + type + '_state').pVal() != sstate && jQuery.trim(jQuery('#' + type + '_state').pVal()).length > 0) { sstate = encodeURIComponent(removeHTMLTags(jQuery('#' + type + '_state').pVal())); addrchange = 1; }
		if (jQuery('#' + type + '_city').pVal() != scity) { scity = encodeURIComponent(removeHTMLTags(jQuery('#' + type + '_city').pVal())); addrchange = 1; }
		if (jQuery('#' + type + '_country').pVal() != scountry && jQuery.trim(jQuery('#' + type + '_country').pVal()).length > 0) { scountry = encodeURIComponent(removeHTMLTags(jQuery('#' + type + '_country').pVal())); addrchange = 1; }
		if ((jQuery('#' + type + '_zip').pVal() != szip || jQuery('#' + type + '_country').pVal() != 'US')) { szip = encodeURIComponent(removeHTMLTags(jQuery('#' + type + '_zip').pVal())); addrchange = 1; }

		if (type2 == 'CouponApplied' || type2 == 'InvalidCart' || type2 == 'refresh' || type2 == 'addresstype') { addrchange = 1; }

		if (((szip.length >= 1 && sstate.length >= 1 && scountry.length >= 1) || (scountry != 'US' && scountry.length >= 1)) && addrchange == 1 && ajax_request_progress == 0) {
			if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
				if (get_Element('sameAsBilling').checked) {
					sameAsBilling = 1;
				}
				else {
					add_overlay("shipping_info", 0)
					overlayAdded = true;
					sameAsBilling = 0;
				}
			}
			else {
				sameAsBilling = 1;
			}

			if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
				var sFirstname = encodeURIComponent(jQuery('#shipping_firstname').pVal());
				var sLastname = encodeURIComponent(jQuery('#shipping_lastname').pVal());
				var sCompany = encodeURIComponent(jQuery('#shipping_company').pVal());
				var sPhone = encodeURIComponent(jQuery('#shipping_phone').pVal());
				sAddress = encodeURIComponent(jQuery('#shipping_address').pVal());
				var sAddress2 = encodeURIComponent(jQuery('#shipping_address2').pVal());
				sCity = encodeURIComponent(jQuery('#shipping_city').pVal());
				sState = encodeURIComponent(jQuery('#shipping_state').pVal());
				sCountry = encodeURIComponent(jQuery('#shipping_country').pVal());
				sZip = encodeURIComponent(jQuery('#shipping_zip').pVal());
			}
			else {
				var sFirstname = ' ';
				var sLastname = ' ';
				var sCompany = ' ';
				var sPhone = ' ';
				sAddress = ' ';
				var sAddress2 = ' ';
				sCity = ' ';
				sState = ' ';
				sCountry = ' ';
				sZip = ' ';
			}

			var bFirstname = encodeURIComponent(jQuery('#billing_firstname').pVal());
			var bLastname = encodeURIComponent(jQuery('#billing_lastname').pVal());
			var bCompany = encodeURIComponent(jQuery('#billing_company').pVal());
			var bPhone = encodeURIComponent(jQuery('#billing_phone').pVal());
			bAddress = encodeURIComponent(jQuery('#billing_address').pVal());
			var bAddress2 = encodeURIComponent(jQuery('#billing_address2').pVal());
			bCity = encodeURIComponent(jQuery('#billing_city').pVal());
			bState = encodeURIComponent(jQuery('#billing_state').pVal());
			bCountry = encodeURIComponent(jQuery('#billing_country').pVal());
			bZip = encodeURIComponent(jQuery('#billing_zip').pVal());

			var sAddressType = '';

			if (get_Element('shipping_addresstype') != 'undefined' && get_Element('shipping_addresstype') != 'null' && get_Element('shipping_addresstype') != null)
				sAddressType = encodeURIComponent(jQuery('#shipping_addresstype').pVal());

			var myCountry = "US";
			myCountry = jQuery('#' + type + '_country').val();
			if (useAddressValidator == "1" && myCountry == "US") {
				getElementById_s("hdnAddrressValidatorResult").value = "";
				var url = 'addressvalidator.asp?no-cache=' + Math.random();
				var params = 'doaction=verify&ct=single&at=' + type + '&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');
				params += '&callBack=check_address2_pos(\'' + type + '\');';
				params += '&name=' + encodeURIComponent(jQuery("#" + type + "_firstname").pVal() + ' ' + jQuery("#" + type + "_lastname").pVal());
				if (getElementById_s(type + "_company")) params += '&company=' + encodeURIComponent(jQuery("#" + type + "_company").pVal());
				params += '&address=' + encodeURIComponent(jQuery("#" + type + "_address").pVal());
				params += '&address2=' + encodeURIComponent(jQuery("#" + type + "_address2").pVal());
				params += '&city=' + encodeURIComponent(jQuery("#" + type + "_city").pVal());
				params += '&state=' + encodeURIComponent(jQuery("#" + type + "_state").pVal());
				params += '&zip=' + encodeURIComponent(jQuery("#" + type + "_zip").pVal());


				if ((params != lastShippingAddress || validShippingAddress == 0) && getElementById_s(type + "_address").value != "") {
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

					if (overlayAdded)
						remove_overlay("shipping_info");

					return false;
				}
			}
			else {
				validShippingAddress = 1;
			}



			jQuery('#shipResult').html('Calculating shipping rates....');
			add_overlay("billing_info", 0)
			add_overlay("shipping_div", 1)
			add_overlay("total_div", 1)
			add_overlay("divPayment", 1)
			ajax_request_progress = 1;

			var url = 'ship_ajax.asp?no-cache=' + Math.random();
			var params = 'shipping_zip=' + szip + '&shipping_city=' + scity + '&shipping_state=' + sstate + '&shipping_country=' + scountry;
			params += '&sFirstname=' + sFirstname;
			params += '&sLastname=' + sLastname;
			params += '&sCompany=' + sCompany;
			params += '&sPhone=' + sPhone;
			params += '&sAddress=' + sAddress;
			params += '&sAddress2=' + sAddress2;
			params += '&sCity=' + sCity;
			params += '&sState=' + sState;
			params += '&sCountry=' + sCountry;
			params += '&sZip=' + sZip;
			params += '&bFirstname=' + bFirstname;
			params += '&bLastname=' + bLastname;
			params += '&bCompany=' + bCompany;
			params += '&bPhone=' + bPhone;
			params += '&bAddress=' + bAddress;
			params += '&bAddress2=' + bAddress2;
			params += '&bCity=' + bCity;
			params += '&bState=' + bState;
			params += '&bCountry=' + bCountry;
			params += '&bZip=' + bZip;
			params += '&sameAsBilling=' + sameAsBilling;
			params += '&Addresstype=' + sAddressType;

			var formArray = getValuesAsArray(document.billing);
			for (var prop in formArray) {
				if (prop == "echoFreightOptions" || prop == "echoFreightOptions1" || prop == "echoFreightOptions2" || prop == "echoFreightOptions3" || prop == "echoFreightOptions4" || prop.toLowerCase().indexOf("collect") > 0) {
					var value = formArray[prop];
					value = encodeURIComponent(value);
					params = params + '&' + prop + '=' + value;
				}
			}

			jQuery.ajax({
				url: url,
				dataType: 'html',
				type: 'POST',
				data: params,
				cache: false,
				success: function (strResult) {
					jQuery("#shipResult").html(strResult);
				},
				complete: function (strResult) {
					updateajax(type2);
				},
				error: reportError
			});
		}
	}

	function updateajax(request) {
		ajax_request_progress = 0;
		remove_overlay("billing_info");

		if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null)
			if (!document.billing.sameAsBilling.checked)
				remove_overlay("shipping_info");

		remove_overlay("shipping_div");
		remove_overlay("total_div");
		remove_overlay("divPayment");

		if (request != 'CouponApplied') {
			if (get_Element('radio_ship') != undefined) {
				var selectedId = jQuery('input[name=shipping]:checked', '#billing').val();
				if (!jQuery.isNumeric(selectedId))
					selectedId = -1;
				select_shipping(selectedId);
			}
			else {
				select_shipping(-1);
			}
		}
	}

	function reportError(jqXHR, textStatus) {
		isSubmitComplete = false;
		ajax_request_progress = 0;
		remove_overlay("billing_info");

		if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null)
			if (!document.billing.sameAsBilling.checked)
				remove_overlay("shipping_info");
		if (jqXHR.status > 0) {
			alert("Error processing request " + jqXHR.status + " - " + jqXHR);
			//alert(jqXHR.responseText);
		}
		checkoutSwitch(false);
	}

	function showHideShipping() {

		if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
			if (document.billing.sameAsBilling.checked) {
				add_overlay("shipping_info", 0);

				get_Element('shipping_firstname').value = '';
				get_Element('shipping_lastname').value = '';
				get_Element('shipping_company').value = '';
				get_Element('shipping_phone').value = '';
				get_Element('shipping_address').value = '';
				get_Element('shipping_address2').value = '';
				get_Element('shipping_city').value = '';
				get_Element('shipping_zip').value = '';
				get_Element('shipping_country').value = jQuery('#billing_country').pVal();
				populateState('shipping_state', 'shipping_country');
				get_Element('shipping_state').value = jQuery('#billing_state').pVal();
			}
			else {
				remove_overlay("shipping_info");

				if (jQuery('#shipping_firstname').pVal() != jQuery('#billing_firstname').pVal()) {
					get_Element('shipping_firstname').value = jQuery('#billing_firstname').pVal();
					get_Element('shipping_lastname').value = jQuery('#billing_lastname').pVal();
					get_Element('shipping_company').value = jQuery('#billing_company').pVal();
					get_Element('shipping_phone').value = jQuery('#billing_phone').pVal();
					get_Element('shipping_address').value = jQuery('#billing_address').pVal();
					get_Element('shipping_address2').value = jQuery('#billing_address2').pVal();
					get_Element('shipping_city').value = jQuery('#billing_city').pVal();
					get_Element('shipping_zip').value = jQuery('#billing_zip').pVal();
					get_Element('shipping_country').value = jQuery('#billing_country').pVal();
					populateState('shipping_state', 'shipping_country');
					get_Element('shipping_state').value = jQuery('#billing_state').pVal();
				}
			}
		}
		else {
			//add_overlay("shipping_info",0);
		}
	}

	function selectGiftRegAddress() {
		remove_overlay("shipping_info");

		if (get_Element('sameAsBilling') != 'undefined' && get_Element('sameAsBilling') != null) {
			get_Element('sameAsBilling').checked = false;
		}
		get_Element('shipping_firstname').value = jQuery('#giftreg_shipping_firstname').pVal();
		get_Element('shipping_lastname').value = jQuery('#giftreg_shipping_lastname').pVal();
		get_Element('shipping_company').value = jQuery('#giftreg_shipping_company').pVal();
		get_Element('shipping_phone').value = jQuery('#giftreg_shipping_phone').pVal();
		get_Element('shipping_address').value = jQuery('#giftreg_shipping_address').pVal();
		get_Element('shipping_address2').value = jQuery('#giftreg_shipping_address2').pVal();
		get_Element('shipping_city').value = jQuery('#giftreg_shipping_city').pVal();
		get_Element('shipping_zip').value = jQuery('#giftreg_shipping_zip').pVal();
		get_Element('shipping_country').value = jQuery('#giftreg_shipping_country').pVal();
		populateState('shipping_state', 'shipping_country');
		get_Element('shipping_state').value = jQuery('#giftreg_shipping_state').pVal();
		check_address('');
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

	function remove_overlay(panel) {
		var elem = document.getElementById('overlay_' + panel);
		if (elem)
			elem.parentNode.removeChild(elem);
		return false;
	}

	function add_overlay(panel, loading) {
		var elem = document.getElementById('overlay_' + panel);
		if (elem)
			return false;

		var objBody = getElementById_s(panel);
		var objOverlay = document.createElement("div");

		objOverlay.setAttribute('id', 'overlay_' + panel);
		objOverlay.className = 'overlay';
		objOverlay.style.position = 'absolute';
		objOverlay.style.textAlign = 'center';
		objOverlay.style.width = objBody.clientWidth + "px";
		objOverlay.style.height = objBody.clientHeight + "px";
		//alert(objOverlay.style.height);
		objBody.insertBefore(objOverlay, objBody.firstChild);
		objOverlay.style.display = 'block';

		if (loading == 1) {
			get_Element('overlay_' + panel).innerHTML = '<table border=0 width=100% height=100%><tr><td style="text-align: center;"><img src="assets/templates/common/images/loading.gif"></td></tr></table>';
		}
		else {
			get_Element('overlay_' + panel).innerHTML = '<table border=0 width=100% height=100%><tr><td align="center"></td></tr></table>';
		}
		DisableEnableForm(document.billing, false);
	}

	function DisableEnableForm(xForm, xHow) {
		objElems = xForm.elements;
		for (i = 0; i < objElems.length; i++) {
			objElems[i].disabled = xHow;
		}
	}

	var giftCertDetails = "";
	function showGiftCertDetails() {
		get_Element('divGiftCertDetails').style.display = giftCertDetails;
		if (giftCertDetails == "")
			giftCertDetails = "none";
		else
			giftCertDetails = "";
	}

	var giftDiscountDetails = "";
	function showDiscountDetails() {
		get_Element('divDiscountDetails').style.display = giftDiscountDetails;
		if (giftDiscountDetails == "")
			giftDiscountDetails = "none";
		else
			giftDiscountDetails = "";
	}

	function fillEmailDiv() {
		var strValue = get_Element('billing_email').value;
		if (strValue == '')
			strValue = 'Type your email above';
		if (get_Element('divEmail') != 'undefined' && get_Element('divEmail') != null) {
			strValue = "&nbsp;" + jQuery.trim(removeHTMLTags(strValue));
			get_Element('divEmail').innerHTML = strValue;
		}
	}

	function updateOrderEmail() {
		var strValue = get_Element('billing_email').value;
		//alert(strValue);
		var url = 'ship_ajax.asp?action=updateOrderEmail&no-cache=' + Math.random();
		var params = 'email=' + encodeURIComponent(strValue) + '&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');

		jQuery.ajax({
			url: url,
			dataType: 'html',
			type: 'POST',
			data: params,
			cache: false
		});
	}

	function updateOrderComments(strValue) {
		//alert(strValue);
		var url = 'ship_ajax.asp?action=updateOrderComments&no-cache=' + Math.random();
		var params = 'comment=' + encodeURIComponent(strValue) + '&k=' + (jQuery('#k').length > 0 ? jQuery('#k').val() : '') + '&wid=' + (jQuery('#wid').length > 0 ? jQuery('#wid').val() : '');

		jQuery.ajax({
			url: url,
			dataType: 'html',
			type: 'POST',
			data: params,
			cache: false
		});
	}



	function removeHTMLTags(strString) {
		var strInputCode = strString;

		strInputCode = strInputCode.replace(/&(lt|gt);/g, function (strMatch, p1) {
			return (p1 == "lt") ? "<" : ">";
		});
		var strTagStrippedText = strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
		strTagStrippedText = strTagStrippedText.replace(/\u00a0/g, '');
		//strTagStrippedText = strTagStrippedText.replace(/&nbsp;/gi,'');
		return strTagStrippedText;
	}

	function clearContent(obj) {
		obj.value = removeHTMLTags(obj.value);
	}

	function controlDivPayment(id) {
		var divs = document.getElementsByTagName("div");
		for (var x = 0; x < divs.length; x++) {
			if ((divs[x].id.indexOf("divPaymentOption") >= 0)) {
				obj1 = get_Element(divs[x].id);

				if (obj1 != undefined)
					if (id == '') {
						obj1.style.display = '';
						break;
					}
					else {
						if (obj1.id == 'divPaymentOption' + id)
							obj1.style.display = '';
						else
							obj1.style.display = 'none';
					}
			}
		}
	}

	function controlDivShipping(id) {
		var divs = document.getElementsByTagName("div");
		for (var x = 0; x < divs.length; x++) {
			if (divs[x].id.indexOf("divShipping") >= 0 && divs[x].id != "divShipping" && divs[x].id != "divShippingCUSTOM") {
				obj1 = get_Element(divs[x].id);

				if (obj1 != undefined)
					if (id == '') {
						obj1.style.display = '';
						break;
					}
					else {
						if (obj1.id == 'divShipping' + id)
							obj1.style.display = '';
						else
							obj1.style.display = 'none';
					}
			}
		}
	}

	function editAddress(addrtype) {
		if (addrtype == 'shippingdone') {
			jQuery("#shipping_info").slideUp();
			jQuery("#divShippingInfo").slideDown();

			jQuery('#btnEditShipping').show();
			jQuery('#btnEditShippingDone').hide();

			jQuery("#spnShippingFirstName").html(jQuery("#shipping_firstname").val());
			jQuery("#spnShippingLastName").html(jQuery("#shipping_lastname").val());
			jQuery("#spnShippingCompany").html(jQuery("#shipping_company").val());
			jQuery("#spnShippingPhone").html(jQuery("#shipping_phone").val());
			jQuery("#spnShippingAddress").html(jQuery("#shipping_address").val());
			jQuery("#spnShippingAddress2").html(jQuery("#shipping_address2").val());
			jQuery("#spnShippingCity").html(jQuery("#shipping_city").val());
			jQuery("#spnShippingState").html(jQuery("#shipping_state").val());
			jQuery("#spnShippingCountry").html(jQuery("#shipping_country").val());
			jQuery("#spnShippingZip").html(jQuery("#shipping_zip").val());
			if (changedaddress) {
				check_address('shipping');
				changedaddress = false;
			}
		}

		if (addrtype == 'shipping') {
			jQuery("#divShippingInfo").slideUp();
			jQuery("#shipping_info").slideDown();

			jQuery('#btnEditShipping').hide();
			jQuery('#btnEditShippingDone').show();
		}

		if (addrtype == 'billingdone') {
			jQuery("#billing_info2").slideUp();
			jQuery("#divBillingInfo").slideDown();

			jQuery('#btnEditBilling').show();
			jQuery('#btnEditBillingDone').hide();

			jQuery("#spnBillingFirstName").html(jQuery("#billing_firstname").val());
			jQuery("#spnBillingLastName").html(jQuery("#billing_lastname").val());
			jQuery("#spnBillingCompany").html(jQuery("#billing_company").val());
			jQuery("#spnBillingPhone").html(jQuery("#billing_phone").val());
			jQuery("#spnBillingAddress").html(jQuery("#billing_address").val());
			jQuery("#spnBillingAddress2").html(jQuery("#billing_address2").val());
			jQuery("#spnBillingCity").html(jQuery("#billing_city").val());
			jQuery("#spnBillingState").html(jQuery("#billing_state").val());
			jQuery("#spnBillingCountry").html(jQuery("#billing_country").val());
			jQuery("#spnBillingZip").html(jQuery("#billing_zip").val());
			jQuery("#spnBillingEmail").html(jQuery("#billing_email").val());
			if (changedaddress) {
				check_address('billing');
				changedaddress = false;
			}
		}

		if (addrtype == 'billing') {
			jQuery("#divBillingInfo").slideUp();
			jQuery("#billing_info2").slideDown();

			jQuery('#btnEditBilling').hide();
			jQuery('#btnEditBillingDone').show();
		}
	}