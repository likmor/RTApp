
interface Message {
    user: string;
    text: string;
  }
const Message: React.FC<{message :Message}> = ({message}) =>{

    return (
        <div>
            <span className="text-sm text-slate-300">{message.user}</span>
            <div className="bg-slate-600 rounded-lg shadow-lg p-2">{message.text}</div>
        </div>
    )
}
export default Message;