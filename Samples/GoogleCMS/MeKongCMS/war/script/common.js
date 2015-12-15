/**
 * Submit the form.
 * @param frmName
 * @param eventId
 * @return
 */
function submitAction(frmName, eventId) {
	var frm = document.forms[frmName];
	frm.eventId.value = eventId;
	frm.submit();
}

function submitToDoc(frmName, eventId, docName) {
	var frm = document.forms[frmName];
	frm.eventId.value = eventId;
	frm.action = docName;
	frm.submit();
}