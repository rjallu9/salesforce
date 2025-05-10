import { LightningElement, api, wire, track } from 'lwc';
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import ID_FIELD from "@salesforce/schema/Account.Id";
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry_Type__c";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";

const fields = [INDUSTRY_FIELD];
export default class CustomAccountForm extends LightningElement {

    @track options;
    @api recordId;

    @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: INDUSTRY_FIELD }) 
    picklistResults({ error, data }) {
        console.log('picklistResults '+data);
        if (data) {
            this.options = data.values.map(opt => {return {"label": opt.label, "value": opt.value}});
            this.template.querySelector('[role="cm-picklist"]').setOptions(this.options);
            this.template.querySelector('[role="cm-picklist"]').setSelectedList(getFieldValue(this.account.data, INDUSTRY_FIELD));
        }
    }    

    @wire(getRecord, { recordId: "$recordId", fields})
    account

    handleSave() {
        if(this.template.querySelector('[role="cm-picklist"]').isValid()) {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[INDUSTRY_FIELD.fieldApiName] = this.template.querySelector('[role="cm-picklist"]').getSelectedList();
            const recordInput = {
                fields: fields
            };
            updateRecord(recordInput).then((record) => {
                console.log(record);
            });
        } else {
            console.log('In Valid...')
        }
    }
}