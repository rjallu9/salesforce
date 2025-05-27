List<Invoice__c> invList = new List<Invoice__c>();
for(Integer i=1;i<=10000;i++) {
    Integer randm = Integer.valueof((Math.random() * 700));
    Invoice__c inv = new Invoice__c(Account__c='{ID}');
    inv.Invoice_Date__c=System.Today()-randm;
    inv.Due_Date__c=inv.Invoice_Date__c+Integer.valueof((Math.random() * 30));
    inv.Total__c =(Integer.valueof((Math.random() * 10000)))+10000;
    Integer ran = Integer.valueof((Math.random() * 5));
    inv.Status__c = ran == 1 ? 'Draft' : ran == 2 ? 'Pending' : ran == 3 ? 'In Progress' : 'Paid';
    invList.add(inv);
}
insert invList;