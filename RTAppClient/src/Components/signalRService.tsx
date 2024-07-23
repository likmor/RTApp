import * as signalR from "@microsoft/signalr";

const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5146/hub") // Adjust the URL as necessary
    .withAutomaticReconnect()
    .build();

export default hubConnection;