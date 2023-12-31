'use client';
import ChatMessage from '@/components/ChatMessage';
import { getSocket } from '@/helpers/socket';
import { IMessage } from '@/types';
import { FC, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
let socket: Socket;

interface IChatDetailProps {
	params: { userId: string };
}

const ChatDetail: FC<IChatDetailProps> = ({ params }) => {
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [userId, setUserId] = useState(Number);

	useEffect(() => {
		try {
			const id = localStorage.getItem('UserId') ?? '';
			const accessToken = localStorage.getItem('Authorization') ?? '';
			setUserId(parseInt(id));
			socket = getSocket(accessToken);
			socket.emit('get-conversation-messages');

			socket.on('conversation-messages', (messages: []) => {
				setMessages(messages);
			});

			socket.on('receive-message', (payload: IMessage[]) => {
				setMessages(payload);
			});

		} catch (error) {
			console.log('🚀🚀🚀 -> useEffect -> error:::', error);
		}

		return () => {
			socket.off();
		};
	}, []);

	// const handleKeyDown = (event: KeyboardEvent) => {
	// 	if (event.key === 'Enter') {
	// 		event.preventDefault();
	// 		sendMessage()
	// 	}
	// };

	function sendMessage() {
		if (message.trim() !== '') {
			const newMessage: IMessage = {
				content: message,
				timestamp: new Date(),
				sender: {
					id: userId,
				},
				receiver: {
					id: +params.userId,
				},
			};
			socket.emit('send-message', newMessage);
			setMessages((prev) => [...prev, newMessage]);
			setMessage('');
		}
	}

	return (
		<div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
			<div className="flex flex-col h-full overflow-x-auto mb-4">
				<div className="flex flex-col h-full">
					<div className="grid grid-cols-12 gap-y-2">
						{messages.map((message: IMessage, index) => (
							<ChatMessage
								key={index}
								isSender={message.sender.id == userId}
								content={message.content}
							/>
						))}
					</div>
				</div>
			</div>
			<div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
				<div>
					<button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
							></path>
						</svg>
					</button>
				</div>
				<div className="flex-grow ml-4">
					<div className="relative w-full">
						<input
							className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<button className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</button>
					</div>
				</div>
				<div className="ml-4">
					<button
						className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
						onClick={sendMessage}
					>
						<span>Send</span>
						<span className="ml-2">
							<svg
								className="w-4 h-4 transform rotate-45 -mt-px"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								></path>
							</svg>
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatDetail;
