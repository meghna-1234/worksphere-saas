import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  MessageSquare,
  Video,
  Phone,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Search,
  Plus,
  Users,
  Circle,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  PhoneOff,
  ScreenShare,
  Settings,
  MicOff,
  VideoOff,
  UserPlus,
  Smile,
  Image,
} from 'lucide-react';

export function ChatModule() {
  const { profile } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>('1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah Johnson', content: 'Hey! Did you see the new project requirements?', time: '10:30 AM', isOwn: false },
    { id: 2, sender: 'You', content: 'Yes, I just reviewed them. Looks exciting!', time: '10:32 AM', isOwn: true, read: true },
    { id: 3, sender: 'Sarah Johnson', content: 'Great! Let me know if you need any clarifications.', time: '10:33 AM', isOwn: false },
    { id: 4, sender: 'You', content: 'Will do. I think we should schedule a meeting to discuss the timeline.', time: '10:35 AM', isOwn: true, read: false },
  ]);

  const conversations = [
    { id: '1', name: 'Sarah Johnson', role: 'Engineering Lead', lastMessage: 'Will do. I think we should...', time: '10:35 AM', unread: 2, online: true },
    { id: '2', name: 'Project Alpha Team', role: '8 members', lastMessage: 'Mike: The deadline is next week', time: '9:45 AM', unread: 5, online: false, isGroup: true },
    { id: '3', name: 'Mike Chen', role: 'Marketing', lastMessage: 'Thanks for the update!', time: 'Yesterday', unread: 0, online: false },
    { id: '4', name: 'Emily Davis', role: 'Sales', lastMessage: 'See you at the meeting', time: 'Yesterday', unread: 0, online: true },
    { id: '5', name: 'TechCorp Partners', role: '12 members', lastMessage: 'Ann: Looking forward to the demo', time: 'Monday', unread: 0, isGroup: true },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'You',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      read: false,
    }]);
    setMessage('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-200px)] flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Messages</h2>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                activeConversation === conv.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                  conv.isGroup ? 'bg-gradient-to-br from-slate-500 to-slate-600' : 'bg-gradient-to-br from-blue-400 to-teal-400'
                }`}>
                  {conv.isGroup ? <Users className="w-5 h-5" /> : conv.name.charAt(0)}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800 truncate">{conv.name}</h3>
                  <span className="text-xs text-slate-400">{conv.time}</span>
                </div>
                <p className="text-xs text-slate-500 mb-1">{conv.role}</p>
                <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                  {conv.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium">
                S
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-800">Sarah Johnson</h3>
              <p className="text-xs text-emerald-600">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md ${
                msg.isOwn
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-2xl rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm'
              } px-4 py-2`}>
                <p className="text-sm">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                  <span className="text-xs">{msg.time}</span>
                  {msg.isOwn && (
                    msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 bg-slate-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded transition-colors">
                <Smile className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeetingModule() {
  const { profile } = useAuth();
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const upcomingMeetings = [
    { id: 1, title: 'Quarterly Review', time: '10:00 AM', date: 'Today', participants: 12, organizer: 'Sarah Johnson' },
    { id: 2, title: 'Project Alpha Sync', time: '2:00 PM', date: 'Today', participants: 6, organizer: 'Mike Chen' },
    { id: 3, title: 'Client Presentation', time: '11:00 AM', date: 'Tomorrow', participants: 8, organizer: 'Emily Davis' },
  ];

  return (
    <div className="space-y-6">
      {isInMeeting ? (
        <ActiveMeeting
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleVideo={() => setIsVideoOff(!isVideoOff)}
          onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
          onLeaveMeeting={() => setIsInMeeting(false)}
        />
      ) : (
        <>
          {/* Join Meeting Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Join a Meeting</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Enter meeting code or link"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Join
              </button>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Upcoming Meetings</h3>
              <p className="text-sm text-slate-500 mt-1">Meetings you've been invited to</p>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{meeting.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-slate-500">{meeting.date}</span>
                        <span className="text-sm text-slate-500">{meeting.time}</span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Users className="w-4 h-4" />
                          {meeting.participants}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Organized by {meeting.organizer}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInMeeting(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ActiveMeeting({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveMeeting,
}: {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveMeeting: () => void;
}) {
  const participants = [
    { id: 1, name: 'Sarah Johnson', role: 'Engineering Lead' },
    { id: 2, name: 'Mike Chen', role: 'Marketing' },
    { id: 3, name: 'Emily Davis', role: 'Sales' },
    { id: 4, name: 'James Wilson', role: 'Product' },
  ];

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      {/* Video Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Main Video (You) */}
          <div className="relative aspect-video bg-gradient-to-br from-blue-600/30 to-teal-500/30 rounded-lg flex items-center justify-center">
            {isVideoOff ? (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                U
              </div>
            ) : (
              <div className="text-white/50">Camera Preview</div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/50 rounded-lg text-white text-sm flex items-center gap-2">
              <span>You</span>
              {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
            </div>

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 rounded-lg text-white text-sm flex items-center gap-2">
                <ScreenShare className="w-4 h-4" />
                Sharing Screen
              </div>
            )}
          </div>

          {/* Other Participants */}
          {participants.map((participant) => (
            <div key={participant.id} className="relative aspect-video bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-lg flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400/50 to-teal-400/50 flex items-center justify-center text-white text-xl font-medium">
                {participant.name.charAt(0)}
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/50 rounded-lg text-white text-sm">
                {participant.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-800 flex items-center justify-center gap-4">
        <button
          onClick={onToggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
        <button
          onClick={onToggleScreenShare}
          className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          <ScreenShare className="w-6 h-6" />
        </button>
        <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors">
          <UserPlus className="w-6 h-6" />
        </button>
        <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors">
          <MessageSquare className="w-6 h-6" />
        </button>
        <button className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
        <button
          onClick={onLeaveMeeting}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
