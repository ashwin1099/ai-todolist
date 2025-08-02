import { useState, useEffect, useRef } from "react";

function ClientTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(now);
  }, []);

  return <span>{time}</span>;
}


export default function Index() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAssistantResponse, setCurrentAssistantResponse] = useState("");
  const [newTaskAdded, setNewTaskAdded] = useState(false);
  
  const messagesEndRef = useRef(null);
  const taskInputRef = useRef(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping, currentAssistantResponse]);

  useEffect(() => {
    if (newTaskAdded) {
      const timer = setTimeout(() => {
        setNewTaskAdded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newTaskAdded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddTask = () => {
    if (task.trim() === "") return;
    setTasks([...tasks, { text: task, completed: false }]);
    setTask("");
    setNewTaskAdded(true);
    
    // Focus back on input after adding
    setTimeout(() => {
      taskInputRef.current.focus();
    }, 10);
  };

  const handleTaskComplete = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);
    setCurrentAssistantResponse("");

    try {
      // In a real app, this would be your API call
      // For this demo, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a relevant response based on input
      const responseContent = generateAssistantResponse(chatInput);
      
      // Simulate streaming response
      let accumulatedResponse = "";
      for (let i = 0; i < responseContent.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        accumulatedResponse += responseContent[i];
        setCurrentAssistantResponse(accumulatedResponse);
      }
      
      // Add the final response as an assistant message
      setChatHistory(prev => [...prev, { role: "assistant", content: responseContent }]);
    } catch (err) {
      console.error("Error:", err);
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
      setCurrentAssistantResponse("");
    }
  };

  const generateAssistantResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm your Task Assistant. How can I help you today?";
    }
    
    if (lowerInput.includes("complete") || lowerInput.includes("done")) {
      const incompleteTasks = tasks.filter(t => !t.completed);
      if (incompleteTasks.length === 0) {
        return "Great job! All tasks are completed. Would you like to add new tasks?";
      }
      return `You have ${incompleteTasks.length} tasks remaining. Keep going!`;
    }
    
    if (lowerInput.includes("help")) {
      return "I can help you manage tasks! Try asking about your tasks, adding new ones, or requesting productivity tips.";
    }
    
    if (lowerInput.includes("thank")) {
      return "You're welcome! Let me know if you need anything else.";
    }
    
    if (lowerInput.includes("tip") || lowerInput.includes("advice")) {
      const tips = [
        "Break large tasks into smaller, manageable steps.",
        "Prioritize tasks using the Eisenhower Matrix.",
        "Try the Pomodoro technique: 25 minutes focused work, 5 minutes break.",
        "Review and plan your tasks at the start of each day.",
        "Batch similar tasks together to maintain focus."
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    
    return "I'm here to help with your tasks! You can ask me about your to-do list, productivity tips, or anything task-related.";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearTasks = () => {
    setTasks([]);
  };

  return (
    <div className="wrapper">
      {/* To-do Card */}
      <div className="card">
        <div className="card-content">
          <div className="header-gradient">
            <h1><i className="fas fa-tasks"></i> Task Manager</h1>
            <p>Organize your day efficiently</p>
          </div>
          
          <div className="form">
            <input
              ref={taskInputRef}
              type="text"
              className="input"
              placeholder="Enter task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button className="add-btn" onClick={handleAddTask}>
              <i className="fas fa-plus"></i>
            </button>
          </div>
          
          {newTaskAdded && (
            <div className="success-notification">
              <i className="fas fa-check-circle"></i> Task added successfully!
            </div>
          )}
          
          <div className="task-header">
            <h3>Your Tasks</h3>
            {tasks.length > 0 && (
              <button className="clear-btn" onClick={handleClearTasks}>
                <i className="fas fa-trash-alt"></i> Clear All
              </button>
            )}
          </div>
          
          <div className="task-list-container">
            {tasks.length > 0 ? (
              <ul className="list">
                {tasks.map((t, i) => (
                  <li key={i} className={`list-item ${t.completed ? 'completed' : ''}`}>
                    <div className="task-content">
                      <div className="task-checkbox">
                        <input 
                          type="checkbox" 
                          id={`task-${i}`} 
                          checked={t.completed}
                          onChange={() => handleTaskComplete(i)}
                        />
                        <label htmlFor={`task-${i}`}></label>
                      </div>
                      <span className="task-text">{t.text}</span>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <div className="empty-animation">
                  <div className="empty-circle">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                </div>
                <p>No tasks yet. Add some tasks to get started!</p>
              </div>
            )}
          </div>
          
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">{tasks.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-value">{tasks.filter(t => t.completed).length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat">
              <span className="stat-value">{tasks.filter(t => !t.completed).length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div 
        className={`chat-button ${showChat ? 'active' : ''}`} 
        onClick={() => setShowChat(!showChat)}
      >
        <i className="fas fa-comment"></i>
        <span className="notification-badge">AI</span>
      </div>

      {/* Chat Modal */}
      <div className={`chat-modal ${showChat ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="ai-info">
            <div className="ai-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <span className="ai-name">Task Assistant</span>
              <div className="ai-status">
                {isTyping ? (
                  <span className="typing-indicator">
                    <span>Thinking</span>
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </span>
                ) : (
                  <span>Online</span>
                )}
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={() => setShowChat(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="chat-messages">
          <div className="welcome-message">
            <div className="message assistant">
              <div className="avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="message-content">
                <div className="message-text">
                  <strong>Hello! I'm your Task Assistant.</strong> I can help you manage your tasks, provide productivity tips, and answer any questions about your to-do list. How can I assist you today?
                </div>
                <div className="message-time">
                  <ClientTime />
                </div>
              </div>
            </div>
          </div>
          
          {chatHistory.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.role === "assistant" && (
                <div className="avatar">
                  <i className="fas fa-robot"></i>
                </div>
              )}
              <div className="message-content">
                <div className="message-text">
                  {msg.content}
                </div>
                <div className="message-time">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message assistant">
              <div className="avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="message-content">
                {currentAssistantResponse && (
                  <div className="message-text">
                    {currentAssistantResponse}
                  </div>
                )}
                <div className="typing-bubble">
                  <div className="typing-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <div className="input-container">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
            />
            <div className="input-actions">
              <button 
                className="send-btn" 
                onClick={handleSend} 
                disabled={!chatInput.trim() || isTyping}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div className="suggestions">
            <span>Try asking:</span>
            <button onClick={() => setChatInput("How many tasks do I have?")}>Task count</button>
            <button onClick={() => setChatInput("Give me a productivity tip")}>Tips</button>
          </div>
        </div>
      </div>
    </div>
  );
}