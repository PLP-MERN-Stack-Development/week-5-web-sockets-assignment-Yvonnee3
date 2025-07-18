const TypingIndicator = ({ typingUsers, currentUser }) => {
  const otherTypingUsers = typingUsers.filter((user) => user.userId !== currentUser?.id)

  if (otherTypingUsers.length === 0) {
    return null
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].username} is typing...`
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].username} and ${otherTypingUsers[1].username} are typing...`
    } else {
      return `${otherTypingUsers.length} people are typing...`
    }
  }

  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}

export default TypingIndicator
