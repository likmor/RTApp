import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
interface RoomMessages {
  roomName: string;
  messages: MessageProp[];
}
interface MessageProp {
  user: string;
  text: string;
}
interface RoomProps {
  invoke: (message: string, ...args: string[]) => void;
  messages: RoomMessages[];
}

const Room: React.FC<RoomProps> = ({ invoke, messages }) => {
  const { roomName } = useParams<{ roomName: string }>();
  useEffect(() => {
    if (roomName) {
      const userName = localStorage.getItem("UserName") ?? "";
      invoke("JoinRoom", userName, roomName);
    }
  }, []);

  return (
    <div>
      <Chat
        invoke={invoke}
        chatName={roomName ?? ""}
        messages={
          messages.find((room) => room.roomName === roomName)?.messages ?? []
        }
      />
    </div>
  );
};

export default Room;
