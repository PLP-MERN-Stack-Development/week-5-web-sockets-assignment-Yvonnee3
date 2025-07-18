

const MessageList = ({ messages, currentUser }) => {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message
          key={message._id}
          message={message}
          isOwn={message.sender._id === currentUser?.id}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}

export default MessageList
