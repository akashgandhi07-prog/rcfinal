"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Reply, Plus, User, Clock, CheckCircle2 } from "lucide-react"
import { getCurrentUser, getMessagesForUser, createMessage, markThreadAsRead, getUnreadMessageCount, getUserById, getLinkedStudents, getLinkedStudentsForMentor, getMentorsForStudent, getParentsForStudent } from "@/lib/supabase/queries"
import { supabase } from "@/lib/supabase/client"
import type { MessageWithUsers, User as UserType } from "@/lib/supabase/types"
import { formatDistanceToNow } from "date-fns"

interface MessagesViewProps {
  viewMode: "student" | "parent" | "mentor"
  studentId?: string
}

export function MessagesView({ viewMode, studentId }: MessagesViewProps) {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [messages, setMessages] = useState<MessageWithUsers[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageWithUsers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessageText, setNewMessageText] = useState("")
  const [newMessageSubject, setNewMessageSubject] = useState("")
  const [replyText, setReplyText] = useState("")
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [showNewMessageForm, setShowNewMessageForm] = useState(false)
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [availableRecipients, setAvailableRecipients] = useState<UserType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUserAndMessages()
  }, [studentId])

  useEffect(() => {
    if (currentUser && studentId) {
      loadAvailableRecipients()
      loadUnreadCount()
    }
  }, [currentUser, studentId])

  const loadUserAndMessages = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
        const displayStudentId = studentId || user.id
        const userMessages = await getMessagesForUser(user.id, displayStudentId)
        setMessages(userMessages)
        
        // Mark threads as read when viewing
        userMessages.forEach((msg) => {
          if (!msg.is_read && msg.recipient_id === user.id) {
            markThreadAsRead(msg.thread_id, user.id)
          }
        })
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableRecipients = async () => {
    if (!currentUser) return

    try {
      const recipients: UserType[] = []
      const displayStudentId = studentId || (currentUser.role === "student" ? currentUser.id : null)

      // If we have a student context, get the student
      if (displayStudentId) {
        const student = await getUserById(displayStudentId)
        if (student && student.id !== currentUser.id) {
          recipients.push(student)
        }
      }

      // If current user is student, get their parents and mentors
      if (currentUser.role === "student" && displayStudentId) {
        const parents = await getParentsForStudent(displayStudentId)
        const mentors = await getMentorsForStudent(displayStudentId)
        recipients.push(...parents, ...mentors)
      }

      // If current user is parent, get mentors and student
      if (currentUser.role === "parent" && displayStudentId) {
        const mentors = await getMentorsForStudent(displayStudentId)
        recipients.push(...mentors)
      }

      // If current user is mentor, get parents and student
      if (currentUser.role === "mentor" && displayStudentId) {
        const parents = await getParentsForStudent(displayStudentId)
        recipients.push(...parents)
      }

      // Get all admins (for all user types)
      const { data: admins } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
      
      if (admins) {
        recipients.push(...admins)
      }

      // Remove duplicates and current user
      setAvailableRecipients(recipients.filter((r, i, arr) => 
        arr.findIndex(u => u.id === r.id) === i && r.id !== currentUser.id
      ))
    } catch (error) {
      console.error("Error loading recipients:", error)
    }
  }

  const loadUnreadCount = async () => {
    if (!currentUser) return
    try {
      const count = await getUnreadMessageCount(currentUser.id, studentId || undefined)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading unread count:", error)
    }
  }

  const handleSendNewMessage = async () => {
    if (!currentUser || !newMessageText.trim() || !recipientId) return

    setIsSending(true)
    try {
      const displayStudentId = studentId || (currentUser.role === "student" ? currentUser.id : null)
      const newMessage = await createMessage(
        currentUser.id,
        recipientId,
        displayStudentId,
        newMessageText.trim(),
        newMessageSubject.trim() || null,
        null, // parent_id
        null  // thread_id (will be auto-set)
      )

      if (newMessage) {
        setNewMessageText("")
        setNewMessageSubject("")
        setRecipientId(null)
        setShowNewMessageForm(false)
        await loadUserAndMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleReply = async (parentMessage: MessageWithUsers) => {
    if (!currentUser || !replyText.trim()) return

    setIsSending(true)
    try {
      const displayStudentId = studentId || (currentUser.role === "student" ? currentUser.id : null)
      const recipientId = parentMessage.sender_id === currentUser.id 
        ? parentMessage.recipient_id || parentMessage.student_id
        : parentMessage.sender_id

      const reply = await createMessage(
        currentUser.id,
        recipientId || null,
        displayStudentId,
        replyText.trim(),
        null, // subject
        parentMessage.id, // parent_id
        parentMessage.thread_id // thread_id
      )

      if (reply) {
        setReplyText("")
        setReplyingToId(null)
        await loadUserAndMessages()
        // Reload the selected thread
        if (selectedThread) {
          const updatedMessages = await getMessagesForUser(currentUser.id, displayStudentId || undefined)
          const updatedThread = updatedMessages.find(m => m.thread_id === selectedThread.thread_id)
          if (updatedThread) {
            setSelectedThread(updatedThread)
            markThreadAsRead(updatedThread.thread_id, currentUser.id)
          }
        }
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectThread = async (thread: MessageWithUsers) => {
    setSelectedThread(thread)
    if (currentUser && !thread.is_read && thread.recipient_id === currentUser.id) {
      await markThreadAsRead(thread.thread_id, currentUser.id)
      await loadUnreadCount()
    }
  }

  const renderMessageThread = (message: MessageWithUsers, depth = 0): React.JSX.Element => {
    const isCurrentUser = message.sender_id === currentUser?.id
    const isUnread = !message.is_read && !isCurrentUser

    return (
      <div key={message.id} className={`space-y-2 ${depth > 0 ? 'ml-6 border-l-2 border-slate-200 pl-4' : ''}`}>
        <div className={`p-3 rounded-lg ${isCurrentUser ? 'bg-blue-50 ml-auto max-w-[80%]' : 'bg-slate-50 max-w-[80%]'} ${isUnread ? 'ring-2 ring-blue-200' : ''}`}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {message.sender?.full_name || message.sender?.email || "Unknown"}
                </p>
                <p className="text-xs text-slate-500">
                  {message.sender?.role && message.sender.role.charAt(0).toUpperCase() + message.sender.role.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {message.is_read && isCurrentUser && (
                <CheckCircle2 size={12} className="text-blue-500" />
              )}
              <Clock size={12} />
              <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.message_text}</p>
        </div>

        {/* Reply form for this message */}
        {selectedThread?.thread_id === message.thread_id && replyingToId === message.id && (
          <div className="ml-6 space-y-2">
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleReply(message)}
                disabled={!replyText.trim() || isSending}
                size="sm"
              >
                <Reply size={14} className="mr-2" />
                Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingToId(null)
                  setReplyText("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reply button */}
        {selectedThread?.thread_id === message.thread_id && replyingToId !== message.id && (
          <button
            onClick={() => setReplyingToId(message.id)}
            className="ml-6 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Reply size={12} />
            Reply
          </button>
        )}

        {/* Render replies recursively */}
        {message.replies && message.replies.length > 0 && (
          <div className="space-y-2 mt-2">
            {message.replies.map((reply) => renderMessageThread(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-slate-900">Messages</h1>
          <p className="text-sm text-slate-600 mt-1">Direct communication with your team</p>
        </div>
        <Button
          onClick={() => setShowNewMessageForm(!showNewMessageForm)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Message
        </Button>
      </div>

      {/* New Message Form */}
      {showNewMessageForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">To</Label>
              <select
                id="recipient"
                value={recipientId || ""}
                onChange={(e) => setRecipientId(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select recipient...</option>
                {availableRecipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.full_name || recipient.email} ({recipient.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
                placeholder="Message subject..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[120px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSendNewMessage}
                disabled={!newMessageText.trim() || !recipientId || isSending}
                className="flex items-center gap-2"
              >
                <Send size={14} />
                {isSending ? "Sending..." : "Send Message"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewMessageForm(false)
                  setNewMessageText("")
                  setNewMessageSubject("")
                  setRecipientId(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threads List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conversations</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {messages.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start a new conversation</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {messages.map((thread) => {
                    const isUnread = !thread.is_read && thread.recipient_id === currentUser?.id
                    const isSelected = selectedThread?.thread_id === thread.thread_id
                    const otherUser = thread.sender_id === currentUser?.id 
                      ? thread.recipient || thread.student
                      : thread.sender

                    return (
                      <button
                        key={thread.thread_id}
                        onClick={() => handleSelectThread(thread)}
                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        } ${isUnread ? 'font-medium' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <User size={18} className="text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`text-sm truncate ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                                {otherUser?.full_name || otherUser?.email || "Unknown"}
                              </p>
                              {isUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            {thread.subject && (
                              <p className="text-xs text-slate-600 truncate mb-1">{thread.subject}</p>
                            )}
                            <p className="text-xs text-slate-500 truncate">{thread.message_text}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedThread ? (
                <div>
                  <p className="text-lg">
                    {selectedThread.subject || "Conversation"}
                  </p>
                  <p className="text-sm font-normal text-slate-600 mt-1">
                    {selectedThread.sender_id === currentUser?.id
                      ? `To: ${selectedThread.recipient?.full_name || selectedThread.recipient?.email || selectedThread.student?.full_name || "Unknown"}`
                      : `From: ${selectedThread.sender?.full_name || selectedThread.sender?.email || "Unknown"}`}
                  </p>
                </div>
              ) : (
                "Select a conversation"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedThread ? (
              <div className="p-4 space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {renderMessageThread(selectedThread)}
                  </div>
                </ScrollArea>
                {/* Reply to thread at bottom */}
                {replyingToId === null && (
                  <div className="border-t pt-4 space-y-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={() => handleReply(selectedThread)}
                      disabled={!replyText.trim() || isSending}
                      className="w-full sm:w-auto"
                    >
                      <Reply size={14} className="mr-2" />
                      {isSending ? "Sending..." : "Reply"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

