using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace RTApp.Hubs
{
    public class RoomHub : Hub
    {
        public static ConcurrentDictionary<string, HashSet<string>> RoomMembers { get; set; } = new();
        public async Task JoinMainRoom(string user)
        {
            string connectionId = Context.ConnectionId;
            await Groups.AddToGroupAsync(connectionId, "main");
            var room = RoomMembers.GetOrAdd("main", new HashSet<string>());
            room.Add(connectionId);
            await Clients.Caller.SendAsync("ReceiveRoomsList", RoomMembers.Keys);
            Console.WriteLine($"Connection {connectionId} joined room main");

        }
        public async Task CreateRoom(string roomName, string user)
        {
            string connectionId = Context.ConnectionId;
            await Console.Out.WriteLineAsync($"Creating room: {roomName}");
            if (RoomMembers.ContainsKey(roomName))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Room already exists!");
                return;
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            var room = RoomMembers.GetOrAdd(roomName, new HashSet<string>());
            room.Add(connectionId);
            await Clients.Caller.SendAsync("ReceiveSuccess", $"Room {roomName} created with user {user}!");
            await Clients.Group("main").SendAsync("ReceiveRoomsList", RoomMembers.Keys);
        }
        public async Task JoinRoom(string user, string roomName)
        {
            string connectionId = Context.ConnectionId;
            await Groups.AddToGroupAsync(connectionId, roomName);
            var room = RoomMembers.GetOrAdd(roomName, new HashSet<string>());
            room.Add(connectionId);
            Console.WriteLine($"Connection {connectionId} joined room {roomName}");

        }
        public async Task SendMessage(string user, string roomName, string text)
        {
            string connectionId = Context.ConnectionId;
            await Console.Out.WriteLineAsync($"{user} send {text} in {roomName}");
            await Clients.Group(roomName).SendAsync("ReceiveMessage", roomName, user, text);
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;
            Console.WriteLine($"Client disconnected: {connectionId}");
            foreach (var room in RoomMembers)
            {
                if (room.Value.Contains(connectionId))
                {
                    room.Value.Remove(connectionId);
                    Console.WriteLine($"Connection {connectionId} removed from room {room.Key}");
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
