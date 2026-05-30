import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Meeting } from '../lib/supabase';
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
  Check,
  CheckCheck,
  Calendar,
  PhoneOff,
  ScreenShare,
  Settings,
  MicOff,
  VideoOff,
  UserPlus,
  Smile,
} from 'lucide-react';

export function ChatModule() {
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
  const { user, profile } = useAuth();
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [activeMeetingTitle, setActiveMeetingTitle] = useState('Team Meeting');
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [meetingMessage, setMeetingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canScheduleMeetings = profile?.role === 'hr' || profile?.role === 'company_admin';
  const roleTitle = profile?.role === 'employee' ? 'Employee Meetings' : profile?.role === 'company_admin' ? 'Company Meetings' : 'HR/Admin Meetings';

  useEffect(() => {
    fetchMeetings();
  }, [user?.id]);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .order('scheduled_at', { ascending: true })
      .limit(20);

    setScheduledMeetings(data && data.length > 0 ? (data as Meeting[]) : sampleMeetings());
    setLoadingMeetings(false);
  };

  const openMeeting = (title: string) => {
    setActiveMeetingTitle(title);
    setIsInMeeting(true);
  };

  const joinMeeting = () => {
    setMeetingMessage(null);
    const code = joinCode.trim();
    if (!code) {
      setMeetingMessage({ type: 'error', text: 'Enter a meeting code or link before joining.' });
      return;
    }
    openMeeting(code.startsWith('http') ? 'External Meeting' : `Meeting ${code}`);
  };

  const startMeeting = () => {
    openMeeting(`${profile?.name || 'Team'} live meeting`);
  };

  const scheduleMeeting = async () => {
    setMeetingMessage(null);
    if (!meetingTitle.trim() || !meetingDate || !meetingTime) {
      setMeetingMessage({ type: 'error', text: 'Add a title, date, and time before scheduling.' });
      return;
    }
    if (!user) {
      setMeetingMessage({ type: 'error', text: 'Sign in again before scheduling a meeting.' });
      return;
    }

    const scheduledAt = new Date(`${meetingDate}T${meetingTime}`).toISOString();
    const payload = {
      organizer_id: user.id,
      title: meetingTitle.trim(),
      scheduled_at: scheduledAt,
      duration_minutes: 60,
      meeting_url: `worksphere-${Date.now()}`,
      participant_ids: [user.id],
      status: 'scheduled',
    };

    const { data, error } = await supabase.from('meetings').insert(payload).select('*').maybeSingle();
    if (error) {
      const fallbackMeeting = {
        id: `local-${Date.now()}`,
        organizer_id: user.id,
        company_id: '',
        title: meetingTitle.trim(),
        description: '',
        scheduled_at: scheduledAt,
        duration_minutes: 60,
        meeting_url: payload.meeting_url,
        status: 'scheduled',
        participant_ids: [user.id],
        created_at: new Date().toISOString(),
      } as Meeting;
      setScheduledMeetings((meetings) => [fallbackMeeting, ...meetings]);
      setMeetingMessage({ type: 'success', text: 'Meeting scheduled locally. Apply meeting policies if you want it saved to Supabase.' });
    } else if (data) {
      setScheduledMeetings((meetings) => [data as Meeting, ...meetings]);
      setMeetingMessage({ type: 'success', text: 'Meeting scheduled successfully.' });
    }

    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
  };

  return (
    <div className="space-y-6">
      {isInMeeting ? (
        <ActiveMeeting
          meetingTitle={activeMeetingTitle}
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
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{roleTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {canScheduleMeetings ? 'Schedule team meetings, start a live room, or join with a meeting code.' : 'Join meetings you have been invited to or enter a meeting code.'}
            </p>
          </div>

          <div className={`grid grid-cols-1 ${canScheduleMeetings ? 'lg:grid-cols-2' : ''} gap-6`}>
            {canScheduleMeetings && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-2">Start a Meeting Immediately</h3>
                <p className="text-sm text-slate-500 mb-4">Open a live meeting room for your team right now.</p>
                <button
                  onClick={startMeeting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Start Now
                </button>
              </div>
            )}

            {canScheduleMeetings && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-2">Schedule a Meeting for Later</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(event) => setMeetingTitle(event.target.value)}
                    placeholder="Meeting title"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(event) => setMeetingDate(event.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(event) => setMeetingTime(event.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <button
                    onClick={scheduleMeeting}
                    className="w-full px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Meeting
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Join Meeting Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Join a Meeting</h3>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="Enter meeting code or link"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button onClick={joinMeeting} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Join
              </button>
            </div>
            {meetingMessage && (
              <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${meetingMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {meetingMessage.text}
              </div>
            )}
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Upcoming Meetings</h3>
              <p className="text-sm text-slate-500 mt-1">Meetings you've been invited to</p>
            </div>
            <div className="divide-y divide-slate-100">
              {loadingMeetings ? (
                <div className="p-8 text-center text-slate-500">Loading meetings...</div>
              ) : scheduledMeetings.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No upcoming meetings yet.</div>
              ) : scheduledMeetings.map((meeting) => (
                <div key={meeting.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{meeting.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-slate-500">{formatMeetingDate(meeting.scheduled_at)}</span>
                        <span className="text-sm text-slate-500">{formatMeetingTime(meeting.scheduled_at)}</span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Users className="w-4 h-4" />
                          {meeting.participant_ids?.length || 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{meeting.status} • {meeting.meeting_url || 'Worksphere room'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openMeeting(meeting.title)}
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
  meetingTitle,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveMeeting,
}: {
  meetingTitle: string;
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
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">{meetingTitle}</h2>
          <p className="text-sm text-slate-400">Live meeting room</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-sm">Connected</span>
      </div>
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

function formatMeetingDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatMeetingTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sampleMeetings(): Meeting[] {
  const now = new Date();
  return [
    { id: 'sample-1', organizer_id: '', company_id: '', title: 'Quarterly Review', description: '', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(), duration_minutes: 60, meeting_url: 'review-room', status: 'scheduled', participant_ids: ['sample'], created_at: now.toISOString() },
    { id: 'sample-2', organizer_id: '', company_id: '', title: 'Project Alpha Sync', description: '', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(), duration_minutes: 45, meeting_url: 'alpha-sync', status: 'scheduled', participant_ids: ['sample'], created_at: now.toISOString() },
    { id: 'sample-3', organizer_id: '', company_id: '', title: 'Client Presentation', description: '', scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0).toISOString(), duration_minutes: 60, meeting_url: 'client-demo', status: 'scheduled', participant_ids: ['sample'], created_at: now.toISOString() },
  ];
}
