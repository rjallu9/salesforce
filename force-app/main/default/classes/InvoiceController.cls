public class InvoiceController {
    
    @AuraEnabled(cacheable=true)
    public static List<Invoice__c> getRecords(Id accountId, String searchKey, String sortBy, Integer pageSize, 
                                              String next, String prev, boolean first, boolean last, Integer lastPageSize) { 
        List<Invoice__c> records = null;
        String query = 'SELECT Id, Name, Invoice_Date__c, Due_Date__c, Status__c, Total__c FROM Invoice__c Where Account__c=\''+accountId+'\' ';
        if(searchKey != '') {
            String textFilter = '%'+searchKey+'%';
            query = buildSearchTerm(query, searchKey);
        }
                                                  
        String sortField = sortBy.split(':')[0];
        String sortByType = sortBy.split(':')[1];
        String sortOrder = sortBy.split(':')[2];
        
        if(next != '' || prev != '') {
            String value = next != '' ? next.subString(20) : prev.subString(20);
            String id =  next != '' ? next.subString(0, 18) : prev.subString(0, 18);
            
            String param = ':textParam';
            String textParam = value != '' && value != '<NULL>' ? value : null;
            if(sortByType == 'Number' && textParam != null) {
                param = ':numberParam';                
                Integer numberParam = Integer.valueOf(textParam);
            } else if(sortByType == 'Date' && textParam != null) {
                param = ':dateParam';                
                Date dateParam = Date.valueOf(textParam);
            } 
            
            String field = sortField;   
            String operator = next != '' ? (sortOrder == 'asc' ? '>': '<') : (sortOrder == 'asc' ? '<': '>');             
            if(value.equals('<NULL>')) {
                query += 'and (' + field + ' != NULL OR ('+field+'= NULL AND Id'+ operator +':id)) ';
            } else if(sortOrder == 'desc') {
                query += 'and (' + field + operator + param + ' OR '+field+' = NULL OR ('+field+'='+param+' AND Id'+ operator +':id)) ';
            } else {
                query += 'and (' + field + operator + param + ' OR ('+field+'='+param+' AND Id'+ operator +':id)) ';
            }
        }
        
        String orderQuery = '';                                         
        if(last || prev != '') {
            orderQuery = 'Order BY ' + sortField + ' ' + (sortOrder == 'asc' ? 'desc NULLS LAST ': 'asc NULLS FIRST ') + ', Id '+ (sortOrder == 'asc' ? 'desc': 'asc'); 
        } else {
            orderQuery = 'Order BY ' + sortField + ' ' + (sortOrder == 'asc' ? 'asc NULLS FIRST ': 'desc NULLS LAST ') + ', Id '+ sortOrder;        
        }
        query += orderQuery + ' LIMIT ' + (last && lastPageSize > 0 ? lastPageSize : pageSize);
                                                  
        System.debug(query);
        records = Database.query(query);
                                                  
        if(prev != '' || last) {
            List<Invoice__c> tmp = new List<Invoice__c>();
            for(Integer i=records.size()-1; i>=0; i--) {
                tmp.add(records.get(i));
            }
            records = tmp;
        } 
        return records;
    }
    
    @AuraEnabled(cacheable=true)
    public static Integer getCount(Id accountId, String searchKey) { 
        String query = 'SELECT Count() FROM Invoice__c Where Account__c=:accountId ';
        if(searchKey != '') {
            String textFilter = '%'+searchKey+'%';
            query = buildSearchTerm(query, searchKey);
        }  
        return Database.countQuery(query);
    }
    
    private static String buildSearchTerm(String query, String searchKey) {
        query += 'and ( Name Like :textFilter or Status__c Like :textFilter ';
        if(searchKey.isNumeric()) {
            query += ' or CALENDAR_YEAR(Invoice_Date__c)='+searchKey+' or CALENDAR_MONTH(Invoice_Date__c)='+searchKey+' or DAY_IN_MONTH(Invoice_Date__c)='+searchKey;  
            query += ' or CALENDAR_YEAR(Due_Date__c)='+searchKey+' or CALENDAR_MONTH(Due_Date__c)='+searchKey+' or DAY_IN_MONTH(Due_Date__c)='+searchKey; 
            query += ' or Total__c='+searchKey+' ) '; 
        } else {
            Pattern p = Pattern.compile('(\\d{4})-(\\d{1,2})(-(\\d{1,2}))?');
            Matcher pm = p.matcher(searchKey);
            if(pm.matches()) {                
                query += ' or (CALENDAR_YEAR(Invoice_Date__c)='+pm.group(1)+' and CALENDAR_MONTH(Invoice_Date__c)='+pm.group(2)+' '+
                    		(pm.group(3) != null ? ' and DAY_IN_MONTH(Invoice_Date__c)='+pm.group(3).replace('-', '')+' ' : '')+') ';  
                query += ' or (CALENDAR_YEAR(Due_Date__c)='+pm.group(1)+' and CALENDAR_MONTH(Due_Date__c)='+pm.group(2)+' '+
                    		(pm.group(3) != null ? ' and DAY_IN_MONTH(Due_Date__c)='+pm.group(3).replace('-', '')+' ' : '')+') '; 
            }
            query += ') ';  
        }
        return query;
    }
    
    
}