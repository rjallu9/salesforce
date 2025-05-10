import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ApexLogger {

 private static final String INSTANCE_URL = "https://<INSTANCE_NAME>.my.salesforce.com/";
 private static final String ACCESS_TOKEN = "<ACCESS_TOKEN>";
 private static final String QUERY = "Select Id from ApexLog";
 private static final String FILES_PATH = "D:/Salesforce/Logs/";
 private static Integer COUNTER = 0;

 public static void fetchLogFile(String logId) throws IOException {
     String logUrl = INSTANCE_URL + "/services/data/v63.0/tooling/sobjects/ApexLog/"+logId+"/Body";
     HttpURLConnection connection = (HttpURLConnection) new URL(logUrl).openConnection();
     connection.setRequestMethod("GET");
     connection.setRequestProperty("Authorization", "Bearer " + ACCESS_TOKEN);
     connection.setRequestProperty("Accept", "text/plain");

     int responseCode = connection.getResponseCode();
     if (responseCode == 200) {
         BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
         StringBuilder response = new StringBuilder();
         String line;
         while ((line = reader.readLine()) != null) {
            response.append(line).append("\n");
         }
         reader.close();
         saveFile(response.toString(), FILES_PATH + logId + ".log");
     } else {
         System.err.println("Failed to fetch log. HTTP Status: " + responseCode);
     }
 }

 private static void saveFile(String content, String fileName) {
     try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName))) {
         writer.write(content);
         System.out.println("Files downloaded : "+(++COUNTER));
     } catch (IOException e) {
         System.err.println("Error saving log file: " + e.getMessage());
     }
 }
 
 public static List<String> getLogIds() throws IOException {
      List<String> idList = new ArrayList<>();
      String logUrl = INSTANCE_URL + "/services/data/v63.0/tooling/query/?q="+QUERY.replaceAll("\\s", "+");
      HttpURLConnection connection = (HttpURLConnection) new URL(logUrl).openConnection();
      connection.setRequestMethod("GET");
      connection.setRequestProperty("Authorization", "Bearer " + ACCESS_TOKEN);
      connection.setRequestProperty("Accept", "application/json");

      int responseCode = connection.getResponseCode();
      if (responseCode == 200) {
         BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
         StringBuilder response = new StringBuilder();
         String line;
         while ((line = reader.readLine()) != null) {
              response.append(line).append("\n");
         }
         reader.close();   
         Pattern pattern = Pattern.compile("\"Id\":\"([a-zA-Z0-9]+)\"");
         Matcher matcher = pattern.matcher(response.toString());
         while (matcher.find()) {
             idList.add(matcher.group(1));
         }
         System.out.println(idList.size()+" Log Ids retrived.");
       } else {
         System.err.println("Failed to fetch log. HTTP Status: " + responseCode);
       }
       return idList;
  }

  public static void main(String[] args) {
      try {
           File directory = new File(FILES_PATH);
           if (!directory.exists()) {
               directory.mkdirs();
           }
           List<String> logIdList = getLogIds();
           for(String logId : logIdList) {
               if(!new File(FILES_PATH + logId + ".log").exists()) {
                   fetchLogFile(logId);
               }
           }
      } catch (IOException e) {
          e.printStackTrace();
      }
   }
}