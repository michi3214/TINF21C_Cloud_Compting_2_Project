# TINF21C_Cloud_Compting_2_Project
Dieses Projekt erstellt mithilfe von Ansible und Terraform eine GCP VM und SQL Instance. Auf der VM wird ein Docker Container gestartet, welcher ein Webinterface besitzt um Text zu Bildern umzuwandeln.  

## Requirements 
Es wird eine vorhandene GCP Instanz benötigt. 

## Ausführung 
Zu Beginn kan das Terraform Skript ausgeführt werden. Dieses befindet sich in dem Ordner "Terraform".
Hier können noch die Zugangsdaten zur späteren SQL Instance angepasst werden. 
Der Output des Terraform Skriptes beinhaltet die benötigten IP Adressen für die folgende Konfiguration. 
Nun wird ein .env Datei angelegt. Diese weist den folgenden Inhalt auf: 
```
# Acces Token for EdenAI 
API_KEY=< EdenAI Api Key >
# Port 
SERVER_PORT=80
# SQL Server 
SQL_IP_Server=< Public IP of SQL Instance >
SQL_User=< SQL Username >
SQL_Password=< SQL Password >
SQL_DatabaseName=picturesDB
SQL_TableName=pictures
```


Nun muss noch das Playbook angepasst werden. Hier muss die öffentliche IP der SQL Datenbank, sowie die Zugangsdaten zur Datenbank eingetragen werden. Des Weiteren wird noch die Pfad zur .env Datei benötigt. 

Im Anschluss kann auch das Ansible Skript ausgeführt werden. Hierzu muss noch die IP der VM in die Inventory Datei eingefügt werden. Danach ist die Erstellung und Konfiguration der Ressourcen abgeschlossen.  