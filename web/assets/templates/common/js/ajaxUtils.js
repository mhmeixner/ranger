function submitAjax(url, sAction, ajaxType, methodType, params, newLocation)
{
	var varResult = '';
//it is NOT Hidden, so hide it
	jQuery.ajax({
		url: url,
		dataType: ajaxType,
		type: methodType,
		data: params,
		cache: false,
		async: true,
		success: function (data, textStatus)
		{
			if (newLocation) window.location = newLocation;

		},
		failure: function (textstatus)
		{
			alert('Process did not complete');
		},
		error: function (jqXHR, textStatus)
		{
			document.body.style.cursor = '';
			if (jqXHR.statusCode > 0)
			{
				alert("Request process incomplete " + jqXHR.statusCode + " - " + jqXHR);
			}
		}
	});
}
