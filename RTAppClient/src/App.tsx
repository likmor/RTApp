import { useEffect, useState } from "react";
import RoomList from "./Components/RoomList";

import Header from "./Components/Header";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Box, Button, Heading, Link, useDisclosure } from "@chakra-ui/react";
import UserNameModal from "./Components/Modals/UserNameModal";
import CreateRoomModal from "./Components/Modals/CreateRoomModal";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import Room from "./Components/Room";

interface RoomMessages {
  roomName: string;
  messages: MessageProp[];
}

interface MessageProp {
  user: string;
  text: string;
}

function App() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomExists, setRoomExists] = useState<boolean>(false);
  const [roomMessages, setRoomMessages] = useState<RoomMessages[]>([]);

  const {
    isOpen: isUserNameModalOpen,
    onOpen: onUserNameModalOpen,
    onClose: onUserNameModalClose,
  } = useDisclosure();
  const {
    isOpen: isCreateRoomModalOpen,
    onOpen: onCreateRoomModalOpen,
    onClose: onCreateRoomModalClose,
  } = useDisclosure();
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(
    null
  );
  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "dark")
  },[])

  useEffect(() => {
    let name = localStorage.getItem("UserName");
    name ? null : onUserNameModalOpen();
  });
  let path = useLocation().pathname;

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5146/hub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to SignalR Hub");

        connection
          .invoke("JoinMainRoom", "user")
          .then(() => console.log("Joined main room successfully"))
          .catch((err) => console.error("Error joining room:", err));

        connection.on("ReceiveRoomsList", (message: string[]) => {
          console.log(message);
          setRooms(message);
        });

        connection.on("ReceiveError", (message: string) => {
          setRoomExists(true);

          console.log(message);
        });
        connection.on("ReceiveSuccess", (message: string) => {
          console.log(message);
          onCreateRoomModalClose();
        });
        connection.on(
          "ReceiveMessage",
          (roomName: string, user: string, text: string) => {
            addMessageToRoom(roomName, { user, text });
          }
        );
      })
      .catch((err) => console.error("Error connecting to SignalR Hub:", err));
    setHubConnection(connection);

    return () => {
      connection
        .stop()
        .then(() => console.log("Disconnected from SignalR Hub"))
        .catch((err) =>
          console.error("Error disconnecting from SignalR Hub:", err)
        );
    };
  }, []);

  const addMessageToRoom = (roomName: string, newMessage: MessageProp) => {
    console.log(roomName, newMessage)
    setRoomMessages((prevRoomMessages) => {
      const updatedRoomMessages = prevRoomMessages.map((room) => {
        if (room.roomName === roomName) {
          return {
            ...room,
            messages: [...room.messages, newMessage],
          };
        }
        return room;
      });

      const roomExists = prevRoomMessages.some(
        (room) => room.roomName === roomName
      );
      if (!roomExists) {
        return [...prevRoomMessages, { roomName, messages: [newMessage] }];
      }

      return updatedRoomMessages;
    });
  };

  const InvokeMessage = async (message: string, ...arg: string[]) => {
    if (hubConnection?.state === HubConnectionState.Connected) {
      hubConnection.invoke(message, ...arg);
    } else {
      await 5000;
      hubConnection?.invoke(message, ...arg);
      console.error("Connection is not established.");
    }
  };

  const createRoom = (roomName: string) => {
    hubConnection?.invoke(
      "CreateRoom",
      roomName,
      localStorage.getItem("UserName")
    );
  };
  const goHome = () => {
    path === "/home" ? null : navigate("/home");
  };

  return (
    <>
      <UserNameModal
        isOpen={isUserNameModalOpen}
        onClose={onUserNameModalClose}
      />
      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={onCreateRoomModalClose}
        createRoom={createRoom}
        roomExists={roomExists}
        setRoomExists={setRoomExists}
      />

      <div className="w-full flex justify-between items-center">
        <Link _hover={{}}>
          <Box onClick={() => goHome()}>
            <Header></Header>
          </Box>
        </Link>
        {useLocation().pathname === "/home" ? (
          <Button
            colorScheme="blue"
            className="m-4"
            onClick={onCreateRoomModalOpen}
          >
            Create new room
          </Button>
        ) : null}

        <Box onClick={onUserNameModalOpen} ml="auto" className="">
          <Link>
            <Heading
              p={5}
              bg="gray.700"
              boxShadow="dark-lg"
              rounded="0px 0px 0px 35px"
              color="rgb(255,255,255, 0.95)"
            >
              {localStorage.getItem("UserName")}
            </Heading>
          </Link>
        </Box>
      </div>
      <Routes>
        <Route path="/home" element={<RoomList rooms={rooms} />} />
        <Route
          path="/room/:roomName"
          element={<Room invoke={InvokeMessage} messages={roomMessages} />}
        />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </>
  );
}

export default App;
