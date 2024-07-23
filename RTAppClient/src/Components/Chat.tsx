import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
} from "@chakra-ui/react";
import Message from "./Message";
import { FormEvent, useEffect, useRef, useState } from "react";
interface MessageProp {
  user: string;
  text: string;
}
interface RoomProps {
  invoke: (message: string, ...args: string[]) => void;
  messages: MessageProp[];
  chatName: string;
}
const Chat: React.FC<RoomProps> = ({ invoke, messages, chatName }) => {
  const [message, setMessage] = useState<string>("");
  const lastMessageRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const onSendMessage = (e : FormEvent) => {
    e.preventDefault();
    invoke(
      "SendMessage",
      localStorage.getItem("UserName") ?? "",
      chatName,
      message
    );
    setMessage("");
  };
  return (
    <>
      <div className="flex justify-center">
        <Box className="h-[750px] w-[500px] bg-slate-800 shadow-lg rounded-3xl">
          <Center>
            <Heading className="p-4 text-ellipsis overflow-hidden whitespace-nowrap">
              Room: {chatName}
            </Heading>
          </Center>
          <Flex alignItems="center" direction="column">
            <Flex
              direction="column"
              className="h-[650px] w-[450px] max-h-[650px] bg-slate-700 shadow-2xl rounded-xl p-4"
            >
              <div className="h-[550px] max-h-[550px] overflow-auto">
                {messages?.map((message, index) => (
                  <Message key={index} message={message}></Message>
                ))}
                <span ref={lastMessageRef} />
              </div>
              <form onSubmit={(e) => onSendMessage(e)} className="mt-auto">
                <Flex
                  direction="row"
                  gap={4}
                  
                >
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type something..."
                      className="bg-slate-700 rounded-none"
                    />
                    <Button type="submit" colorScheme="blue">
                      Submit
                    </Button>
                </Flex>
              </form>
            </Flex>
          </Flex>
        </Box>
      </div>
    </>
  );
};
export default Chat;
