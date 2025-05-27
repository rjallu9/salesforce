import { LightningElement, wire, track, api } from 'lwc';
import getRecords from '@salesforce/apex/InvoiceController.getRecords';
import getCount from '@salesforce/apex/InvoiceController.getCount';

const columns = [
    {
        label: "Name", fieldName: "Link", type: "url", sortable: "true", typeAttributes: {
            label: { fieldName: 'Name'}, target: '_self' 
        }
    },
    { label: "Invoice Date", fieldName: "Invoice_Date__c", type: "Date", sortable: "true" },
    { label: "Due Date", fieldName: "Due_Date__c", type: "Date", sortable: "true" },
    { label: "Status", fieldName: "Status__c", type: "Text", sortable: "true" },
    { label: "Total", fieldName: "Total__c", type: "Number", sortable: "true" }
];
const pageSize = 100;
export default class CustomDataTable extends LightningElement {
    
    @track records = [];
    @api recordId;

    currentPage = 1;
    totalRecords;
    totalPages;
    columns = columns;    

    searchText = '';
    searchKey = '';
    sortByUI = 'Link';    
    sortDirection = 'asc';
    sortBy = 'Name:Text:asc';

    @track first = true;
    next = '';
    prev = '';
    last = false;

    lastPageSize = 0;

    isLoading = true;

    @wire(getRecords, {
        accountId: "$recordId",
        searchKey: "$searchKey",     
        sortBy: "$sortBy",
        pageSize,
        first: "$first",
        next: "$next",
        prev: "$prev",
        last: "$last",   
        lastPageSize: "$lastPageSize"
    })
    getInvoiceRecords({ data, errors }) {
        this.isLoading = false;
        if (data) {
            this.records = data.map((rec) => {
                return {...rec, "Link": '/'+rec.Id }
            }); 
        }       
    }

    @wire(getCount, {
        accountId: "$recordId",
        searchKey: "$searchKey"     
    })
    getCount({ data, errors }) {
        if (data) {
            this.totalRecords = data;
            this.totalPages = Math.ceil(data/pageSize);           
        }
    }   

    handleSearchChange(event) {
        this.searchText = event.target.value;
    }

    handleSearch() {        
        this.searchKey = this.searchText;  

        this.currentPage = 1;  
        this.resetFields(); 
        this.refreshButtons();                 
    }

    handleSort(event) {
        this.currentPage = 1;  
        this.resetFields();
        this.refreshButtons();   

        this.sortByUI = event.detail.fieldName;

        this.sortBy = this.sortByUI == 'Link' ? 'Name:Text:'+event.detail.sortDirection : 
                this.sortByUI +':'+ this.columns.find(ele => ele.fieldName == this.sortByUI).type + ':' + event.detail.sortDirection;      
    }

    get showBar() {
        return this.totalPages > 1; 
    } 

    handleFirst() {        
        this.currentPage = 1;  
        this.resetFields();
        this.refreshButtons();
    }

    handleNext() {
        this.currentPage++;    
        this.resetFields();
        var lastRecord = this.records[this.records.length-1];
        this.next = this.last ? '' : lastRecord['Id'] + "::" + (lastRecord[this.sortByUI=='Link'?'Name':this.sortByUI] ? 
                    lastRecord[this.sortByUI=='Link'?'Name':this.sortByUI] : '<NULL>'); 
        this.refreshButtons();
    }

    handlePrevious() {   
        this.currentPage--;  
        this.resetFields();     
        var firstRecord = this.records[0];     
        this.prev = this.first ? '' : firstRecord['Id'] + "::" + (firstRecord[this.sortByUI=='Link'?'Name':this.sortByUI] ? 
                    firstRecord[this.sortByUI=='Link'?'Name':this.sortByUI] : '<NULL>');
        this.refreshButtons();
    }

    handleLast() {
        this.currentPage = this.totalPages; 
        this.resetFields(); 
        this.refreshButtons();
    }

    resetFields() {
        this.isLoading = true;  
        this.prev = '';    
        this.next = '';      
        this.first = (this.currentPage == 1);
        this.last = (this.currentPage == this.totalPages);
        this.lastPageSize = this.totalRecords % pageSize;
    }

    refreshButtons() {
        this.template.querySelectorAll('.icon_button').forEach(button => {
            button.classList.remove('icon_button_disabled');
        });
        if(this.last || this.first) {
            this.template.querySelector(this.last ? '[role=next]' : '[role=first]').classList.add('icon_button_disabled');
            this.template.querySelector(this.last ? '[role=last]' : '[role=previous]').classList.add('icon_button_disabled');
        }
    }

    get rowNumberOffset() {
        return (this.currentPage-1)*pageSize;
    }
}